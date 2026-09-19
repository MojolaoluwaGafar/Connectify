import { env } from '../../config/env.js';
import { AppError } from '../../core/errors/app-error.js';
import { logger } from '../../core/logger/logger.js';

// The only file that knows which geocoding providers exist. Callers, the
// database and the frontend only ever see PlaceSuggestion.
//
// LocationIQ is the primary provider when LOCATIONIQ_API_KEY is set. Photon
// (keyless, fair-use) is both the fallback if LocationIQ is down, rate-limited
// or rejects the key, and the default when no key is configured — so location
// search keeps working for users either way.

export type GeocoderProvider = 'locationiq' | 'photon';

export interface PlaceSuggestion {
  label: string;
  lat: number;
  lng: number;
}

export interface PlaceSearchResult {
  suggestions: PlaceSuggestion[];
  // Which provider answered — the UI shows the attribution that provider
  // requires alongside the results.
  provider: GeocoderProvider;
}

// What each provider adapter boils a result down to. Everything downstream
// (labelling, de-duplication, limiting) is shared.
interface RawPlace {
  name?: string;
  state?: string;
  lat: number;
  lng: number;
}

// The app is Nigeria-only for now.
const COUNTRY_CODE = 'NG';
// Photon's bbox is minLon,minLat,maxLon,maxLat.
const NIGERIA_BBOX = '2.67,4.27,14.68,13.89';
// Area-level places only (no streets, shops or malls) — near-me matches on
// where someone lives, not their exact address.
const PHOTON_LAYERS = ['city', 'district', 'county', 'state'];
const LOCATIONIQ_TAGS = [
  'place:city',
  'place:town',
  'place:village',
  'place:suburb',
  'place:neighbourhood',
  'place:quarter',
  'place:county',
  'place:state',
  'place:district',
  'boundary:administrative',
].join(',');

const LOCATIONIQ_URL = 'https://api.locationiq.com/v1/autocomplete';
const USER_AGENT = 'Connectify/1.0 (location autocomplete)';

const RESULT_LIMIT = 6;
const REQUEST_TIMEOUT_MS = 4_000;
const CACHE_TTL_MS = 60 * 60_000;
const CACHE_MAX_ENTRIES = 500;

const cache = new Map<
  string,
  { expiresAt: number; value: PlaceSearchResult }
>();

function readCache(key: string) {
  const hit = cache.get(key);
  if (!hit) return undefined;

  if (hit.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }

  return hit.value;
}

function writeCache(key: string, value: PlaceSearchResult) {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    // Maps iterate in insertion order, so the first key is the oldest entry.
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }

  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
}

function unavailable() {
  return new AppError(
    502,
    'GEOCODER_UNAVAILABLE',
    'Location search is temporarily unavailable. Please try again.',
  );
}

// Returns the parsed JSON body, or null when notFoundMeansEmpty and the
// provider answered 404 (LocationIQ's way of saying "no matches").
//
// LocationIQ's key travels in the URL, so nothing here ever logs the URL or a
// raw error object — only the provider, status and error kind.
async function request(
  provider: GeocoderProvider,
  url: URL,
  options: { notFoundMeansEmpty?: boolean } = {},
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    logger.warn('Geocoder request failed', {
      provider,
      reason: error instanceof Error ? error.name : 'unknown',
    });
    throw unavailable();
  }

  if (response.status === 404 && options.notFoundMeansEmpty) return null;

  if (!response.ok) {
    logger.warn('Geocoder returned an error status', {
      provider,
      status: response.status,
    });
    throw unavailable();
  }

  try {
    return await response.json();
  } catch {
    logger.warn('Geocoder returned an unreadable response', { provider });
    throw unavailable();
  }
}

interface PhotonFeature {
  geometry?: { coordinates?: unknown };
  properties?: {
    name?: string;
    city?: string;
    county?: string;
    state?: string;
    countrycode?: string;
  };
}

async function searchPhoton(query: string): Promise<RawPlace[]> {
  const url = new URL(env.GEOCODER_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(RESULT_LIMIT * 2));
  url.searchParams.set('lang', 'en');
  url.searchParams.set('bbox', NIGERIA_BBOX);
  for (const layer of PHOTON_LAYERS) {
    url.searchParams.append('layer', layer);
  }

  const body = (await request('photon', url)) as {
    features?: PhotonFeature[];
  } | null;

  return (body?.features ?? []).flatMap((feature): RawPlace[] => {
    const { properties, geometry } = feature;
    const coordinates = geometry?.coordinates;

    if (properties?.countrycode?.toUpperCase() !== COUNTRY_CODE) return [];

    // GeoJSON order is [longitude, latitude].
    if (
      !Array.isArray(coordinates) ||
      typeof coordinates[0] !== 'number' ||
      typeof coordinates[1] !== 'number'
    ) {
      return [];
    }

    return [
      {
        name: properties.name ?? properties.city ?? properties.county,
        state: properties.state,
        lng: coordinates[0],
        lat: coordinates[1],
      },
    ];
  });
}

interface LocationIqResult {
  lat?: string;
  lon?: string;
  display_place?: string;
  address?: {
    name?: string;
    state?: string;
    country_code?: string;
  };
}

async function searchLocationIq(query: string): Promise<RawPlace[]> {
  const url = new URL(LOCATIONIQ_URL);
  url.searchParams.set('key', env.LOCATIONIQ_API_KEY);
  url.searchParams.set('q', query);
  url.searchParams.set('countrycodes', COUNTRY_CODE.toLowerCase());
  url.searchParams.set('limit', String(RESULT_LIMIT * 2));
  url.searchParams.set('dedupe', '1');
  url.searchParams.set('tag', LOCATIONIQ_TAGS);

  const body = await request('locationiq', url, { notFoundMeansEmpty: true });
  if (!Array.isArray(body)) return [];

  return (body as LocationIqResult[]).flatMap((item): RawPlace[] => {
    if (item.address?.country_code?.toUpperCase() !== COUNTRY_CODE) return [];

    // LocationIQ sends coordinates as strings.
    const lat = Number(item.lat);
    const lng = Number(item.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];

    return [
      {
        name: item.address.name ?? item.display_place,
        state: item.address.state,
        lat,
        lng,
      },
    ];
  });
}

// LocationIQ says "Lagos State" where Photon says "Lagos"; show one style.
const stripStateSuffix = (part: string) =>
  part.replace(/\s+state$/i, '').trim();

function buildLabel({ name, state }: RawPlace) {
  const parts = [name, state]
    .map((part) => stripStateSuffix(part ?? ''))
    .filter(Boolean);

  const seen = new Set<string>();
  return parts
    .filter((part) => {
      const key = part.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(', ');
}

function toSuggestions(places: RawPlace[]): PlaceSuggestion[] {
  const suggestions: PlaceSuggestion[] = [];
  const seenLabels = new Set<string>();

  for (const place of places) {
    const label = buildLabel(place);
    // First hit wins, and providers list the most important place first.
    if (!label || seenLabels.has(label.toLowerCase())) continue;

    seenLabels.add(label.toLowerCase());
    suggestions.push({ label, lat: place.lat, lng: place.lng });
  }

  return suggestions.slice(0, RESULT_LIMIT);
}

async function lookup(query: string): Promise<PlaceSearchResult> {
  const providers: GeocoderProvider[] = env.LOCATIONIQ_API_KEY
    ? ['locationiq', 'photon']
    : ['photon'];

  let lastError: unknown;

  for (const provider of providers) {
    try {
      const places =
        provider === 'locationiq'
          ? await searchLocationIq(query)
          : await searchPhoton(query);

      // An empty list is a real answer ("no matches"), not a failure, so it
      // doesn't trigger the fallback.
      return { suggestions: toSuggestions(places), provider };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

export async function searchPlaces(query: string): Promise<PlaceSearchResult> {
  const key = query.trim().toLowerCase();

  const cached = readCache(key);
  if (cached) return cached;

  const result = await lookup(key);
  writeCache(key, result);

  return result;
}
