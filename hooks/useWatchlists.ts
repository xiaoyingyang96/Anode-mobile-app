import { useCallback, useEffect, useState } from 'react';
import { Watchlist } from '@/types/watchlist';
import { watchlistApi } from '@/utils/watchlistApi';

export function useWatchlists() {
  const [watchlists, setWatchlists] = useState<Watchlist[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlists = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await watchlistApi.fetchAll();
    if (result.ok) {
      setWatchlists(result.data);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchWatchlists();
  }, [fetchWatchlists]);

  return { watchlists, isLoading, error, refetch: fetchWatchlists };
}
