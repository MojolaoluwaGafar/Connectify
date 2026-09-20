import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import { MapPin } from 'lucide-react';

import {
  autocompletePlaces,
  type GeocoderProvider,
  type PlaceSuggestion,
} from '../../API/Services/Geocode/Geocode';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

type SearchStatus = 'idle' | 'loading' | 'done' | 'error';

interface LocationAutocompleteProps {
  label?: string;
  value: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  // Fires on every keystroke. The parent should treat any typing as
  // invalidating a previously chosen place (its coordinates no longer match).
  onInputChange: (text: string) => void;
  onSelect: (place: PlaceSuggestion) => void;
}

export default function LocationAutocomplete({
  label,
  value,
  placeholder,
  error,
  hint,
  onInputChange,
  onSelect,
}: LocationAutocompleteProps) {
  const inputId = useId();
  const listboxId = `${inputId}-listbox`;

  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [provider, setProvider] = useState<GeocoderProvider>('photon');
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const inFlight = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      clearTimeout(debounceTimer.current);
      inFlight.current?.abort();
    },
    [],
  );

  function search(query: string) {
    clearTimeout(debounceTimer.current);
    // A newer keystroke supersedes any request still in flight, so a slow
    // response for "lag" can't overwrite the results for "lagos".
    inFlight.current?.abort();

    if (query.trim().length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setStatus('idle');
      return;
    }

    setStatus('loading');

    debounceTimer.current = setTimeout(async () => {
      const controller = new AbortController();
      inFlight.current = controller;

      try {
        const result = await autocompletePlaces(
          query.trim(),
          controller.signal,
        );
        if (controller.signal.aborted) return;

        setSuggestions(result.suggestions);
        setProvider(result.provider);
        setStatus('done');
      } catch {
        if (controller.signal.aborted) return;

        setSuggestions([]);
        setStatus('error');
      }
    }, DEBOUNCE_MS);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onInputChange(e.target.value);
    setIsOpen(true);
    setActiveIndex(-1);
    search(e.target.value);
  }

  function choose(place: PlaceSuggestion) {
    clearTimeout(debounceTimer.current);
    inFlight.current?.abort();

    onSelect(place);
    setIsOpen(false);
    setSuggestions([]);
    setStatus('idle');
    setActiveIndex(-1);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (suggestions.length === 0) return;

      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => {
        const step = e.key === 'ArrowDown' ? 1 : -1;
        return (current + step + suggestions.length) % suggestions.length;
      });
      return;
    }

    if (e.key === 'Enter' && isOpen && activeIndex >= 0) {
      // Stops the surrounding form from submitting while picking a place.
      e.preventDefault();
      const place = suggestions[activeIndex];
      if (place) choose(place);
    }
  }

  const showPanel = isOpen && status !== 'idle';

  return (
    <div className="relative w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-ink-900"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
        }
        aria-invalid={Boolean(error)}
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-500/70
          transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40
          ${error ? 'border-red-400 focus:border-red-400' : 'border-ink-900/15 focus:border-brand-500'}`}
      />

      {showPanel && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 z-20 mt-1 max-h-64 overflow-auto rounded-xl border border-ink-900/15 bg-white py-1 shadow-lg"
        >
          {status === 'loading' && (
            <li className="px-4 py-2.5 text-sm text-ink-500">Searching…</li>
          )}

          {status === 'error' && (
            <li className="px-4 py-2.5 text-sm text-red-600">
              Location search is unavailable right now. Please try again.
            </li>
          )}

          {status === 'done' && suggestions.length === 0 && (
            <li className="px-4 py-2.5 text-sm text-ink-500">
              No places found. Try a nearby city or area.
            </li>
          )}

          {status === 'done' &&
            suggestions.map((place, index) => (
              <li
                key={`${place.label}-${place.lat}-${place.lng}`}
                id={`${listboxId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                // mousedown (not click) fires before the input's blur closes
                // the list; preventDefault keeps focus in the input.
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(place);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-ink-900 ${
                  index === activeIndex ? 'bg-brand-500/10' : ''
                }`}
              >
                <MapPin size={14} className="shrink-0 text-ink-500" />
                <span className="truncate">{place.label}</span>
              </li>
            ))}

          {status === 'done' && suggestions.length > 0 && (
            // The map data is OpenStreetMap's (ODbL requires the credit), and
            // LocationIQ asks for a link when it's the one answering.
            // mousedown is cancelled so clicking the link doesn't blur the
            // input and close the list before the click registers.
            <li
              role="presentation"
              onMouseDown={(e) => e.preventDefault()}
              className="border-t border-ink-900/10 px-4 py-1.5 text-[11px] text-ink-500"
            >
              {provider === 'locationiq' && (
                <>
                  <a
                    href="https://locationiq.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Search by LocationIQ
                  </a>
                  {' · '}
                </>
              )}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                © OpenStreetMap contributors
              </a>
            </li>
          )}
        </ul>
      )}

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      )}
      {hint && !error && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}
