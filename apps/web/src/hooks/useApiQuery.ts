import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isAxiosError } from 'axios';

import type { ApiErrorResponse } from '../types/apiReqRes';

type RequestFn<TRes, TArgs extends unknown[] = []> = (
  ...args: TArgs
) => Promise<TRes>;

interface UseApiQueryOptions<TRes> {
  enabled?: boolean;
  initialData?: TRes;
  onSuccess?: (data: TRes) => void;
  onError?: (error: string) => void;
  cacheKey?: string | null;
  staleTime?: number;
}

interface CacheEntry<TRes> {
  data: TRes;
  timestamp: number;
}

const queryCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();

function getCached<TRes>(key: string): CacheEntry<TRes> | undefined {
  return queryCache.get(key) as CacheEntry<TRes> | undefined;
}

function setCached<TRes>(key: string, data: TRes) {
  queryCache.set(key, { data, timestamp: Date.now() });
}

export function invalidateQuery(key: string) {
  queryCache.delete(key);
}

export function useApiQuery<TRes, TArgs extends unknown[] = []>(
  request: RequestFn<TRes, TArgs>,
  defaultErrorMessage = 'Request failed',
  options?: UseApiQueryOptions<TRes>,
) {
  const {
    enabled = true,
    initialData,
    onSuccess,
    onError,
    cacheKey = null,
    staleTime = 30_000,
  } = options ?? {};

  const hasInitialData = initialData !== undefined;

  const cached = cacheKey ? getCached<TRes>(cacheKey) : undefined;
  const seedData = cached?.data ?? initialData ?? null;

  const [data, setData] = useState<TRes | null>(seedData);
  const [loading, setLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(hasInitialData || Boolean(cached));
  const [isFetched, setIsFetched] = useState(hasInitialData || Boolean(cached));

  const mountedRef = useRef(false);
  const fetchingRef = useRef(false);

  // Tracks the cacheKey we last rendered with. When it changes (e.g. the
  // user paginates), we're rendering for a *different* query than the one
  // `data` currently holds — re-sync `data` to match the new key's cache
  // entry immediately, during render, rather than waiting for an effect.
  // This is what prevents the previous page's items from lingering on
  // screen when switching pages.
  const lastCacheKeyRef = useRef(cacheKey);

  if (cacheKey !== lastCacheKeyRef.current) {
    lastCacheKeyRef.current = cacheKey;

    const nextCached = cacheKey ? getCached<TRes>(cacheKey) : undefined;

    setData(nextCached?.data ?? null);
    setSuccess(Boolean(nextCached));
    setIsFetched(Boolean(nextCached));
    setError(null);
  }

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(
    async (...args: TArgs): Promise<TRes> => {
      if (fetchingRef.current) {
        return Promise.reject(new Error('Request already in progress'));
      }

      fetchingRef.current = true;

      const isBackgroundRefetch = Boolean(cacheKey) && data !== null;

      try {
        if (mountedRef.current) {
          if (isBackgroundRefetch) {
            setIsRefetching(true);
          } else {
            setLoading(true);
          }
          setError(null);
        }

        let resultPromise: Promise<TRes>;

        if (cacheKey && inFlightRequests.has(cacheKey)) {
          resultPromise = inFlightRequests.get(cacheKey) as Promise<TRes>;
        } else {
          resultPromise = request(...args);
          if (cacheKey) {
            inFlightRequests.set(cacheKey, resultPromise);
          }
        }

        const result = await resultPromise;

        if (cacheKey) {
          setCached(cacheKey, result);
        }

        if (mountedRef.current) {
          setData(result);
          setSuccess(true);
          setIsFetched(true);
        }

        onSuccess?.(result);

        return result;
      } catch (err) {
        let message = defaultErrorMessage;

        if (isAxiosError(err)) {
          const errData = err.response?.data as ApiErrorResponse;

          message =
            errData?.error ??
            errData?.message ??
            err.message ??
            defaultErrorMessage;
        } else if (err instanceof Error) {
          message = err.message;
        }

        if (mountedRef.current) {
          setError(message);
          setSuccess(false);
        }

        onError?.(message);

        throw err;
      } finally {
        fetchingRef.current = false;
        if (cacheKey) {
          inFlightRequests.delete(cacheKey);
        }

        if (mountedRef.current) {
          if (isBackgroundRefetch) {
            setIsRefetching(false);
          } else {
            setLoading(false);
          }
        }
      }
    },
    [request, defaultErrorMessage, onSuccess, onError, cacheKey, data],
  );

  useEffect(() => {
    if (!enabled) return;

    const isStale =
      !cacheKey || !cached || Date.now() - cached.timestamp > staleTime;

    if (!isStale) return;

    void fetchData(...([] as unknown as TArgs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, cacheKey]);

  const reset = useCallback(() => {
    if (cacheKey) {
      queryCache.delete(cacheKey);
    }
    setData(initialData ?? null);
    setLoading(false);
    setIsRefetching(false);
    setError(null);
    setSuccess(hasInitialData);
    setIsFetched(hasInitialData);
  }, [initialData, hasInitialData, cacheKey]);

  const invalidate = useCallback(() => {
    if (!cacheKey) return;
    queryCache.delete(cacheKey);
  }, [cacheKey]);

  return useMemo(
    () => ({
      data,
      loading,
      isRefetching,
      error,
      success,
      isFetched,
      refetch: fetchData,
      setData,
      reset,
      invalidate,
    }),
    [
      data,
      loading,
      isRefetching,
      error,
      success,
      isFetched,
      fetchData,
      reset,
      invalidate,
    ],
  );
}
