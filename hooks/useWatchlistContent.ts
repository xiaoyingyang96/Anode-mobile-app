import { useCallback, useEffect, useRef, useState } from 'react';
import { AssetTicker, WatchlistOHLCVResponse, WatchlistStoriesResponse } from '@/types/watchlist';
import { watchlistApi } from '@/utils/watchlistApi';

export function useWatchlistContent(assetTickers: AssetTicker[]) {
  const [ohlcv, setOhlcv] = useState<WatchlistOHLCVResponse | null>(null);
  const [stories, setStories] = useState<WatchlistStoriesResponse | null>(null);
  const [ohlcvLoading, setOhlcvLoading] = useState(false);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [ohlcvError, setOhlcvError] = useState<string | null>(null);
  const [storiesError, setStoriesError] = useState<string | null>(null);

  // Use a ref to avoid stale closures in the debounce
  const tickersKey = assetTickers.map((t) => t.ticker).join(',');
  const prevKeyRef = useRef<string>('');

  const fetchContent = useCallback(async (tickers: AssetTicker[]) => {
    if (tickers.length === 0) {
      setOhlcv(null);
      setStories(null);
      return;
    }

    const tickerStrings = tickers.map((t) => t.ticker);

    setOhlcvLoading(true);
    setStoriesLoading(true);
    setOhlcvError(null);
    setStoriesError(null);

    const [ohlcvResult, storiesResult] = await Promise.all([
      watchlistApi.fetchOHLCV(tickerStrings),
      watchlistApi.fetchStories(tickerStrings),
    ]);

    if (ohlcvResult.ok) {
      setOhlcv(ohlcvResult.data);
    } else {
      setOhlcvError(ohlcvResult.error);
    }

    if (storiesResult.ok) {
      setStories(storiesResult.data);
    } else {
      setStoriesError(storiesResult.error);
    }

    setOhlcvLoading(false);
    setStoriesLoading(false);
  }, []);

  useEffect(() => {
    if (tickersKey === prevKeyRef.current) return;
    prevKeyRef.current = tickersKey;

    const timer = setTimeout(() => {
      fetchContent(assetTickers);
    }, 300);

    return () => clearTimeout(timer);
  }, [tickersKey]);

  return {
    ohlcv,
    stories,
    ohlcvLoading,
    storiesLoading,
    ohlcvError,
    storiesError,
    refetch: () => fetchContent(assetTickers),
  };
}
