import api from '../../api';

export interface PlaceSuggestion {
  label: string;
  lat: number;
  lng: number;
}

export type GeocoderProvider = 'locationiq' | 'photon';

export interface PlaceSearchResult {
  suggestions: PlaceSuggestion[];
  provider: GeocoderProvider;
}

export const GeocodeServices = {
  async autocomplete(
    query: string,
    signal?: AbortSignal,
  ): Promise<PlaceSearchResult> {
    const { data } = await api.get('/api/v1/geocode/autocomplete', {
      params: { q: query },
      signal,
    });

    return {
      suggestions: (data?.data as PlaceSuggestion[] | undefined) ?? [],
      provider: data?.provider === 'locationiq' ? 'locationiq' : 'photon',
    };
  },
};

export const autocompletePlaces = GeocodeServices.autocomplete;
