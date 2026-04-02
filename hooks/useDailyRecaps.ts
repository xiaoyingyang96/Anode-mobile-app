import { useCallback, useEffect, useState } from "react";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export type RecapItem = {
  text: string;
  sources: { url: string; id: number }[];
};

export type DailyRecap = {
  date: string;
  items: RecapItem[];
  crypto_assets: Record<string, string>;
};

export function useDailyRecaps() {
  const [recaps, setRecaps] = useState<DailyRecap[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchRecaps = useCallback(async (pageToLoad = 1) => {
    const setter = pageToLoad === 1 ? setIsLoading : setIsLoadingMore;
    setter(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/news/recaps?page=${pageToLoad}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: DailyRecap[] = await res.json();
      setRecaps((prev) => (pageToLoad === 1 ? data : [...prev, ...data]));
      setHasMore(data.length > 0);
      setPage(pageToLoad);
    } catch (e) {
      console.error("Error fetching recaps:", e);
    } finally {
      setter(false);
    }
  }, []);

  useEffect(() => {
    fetchRecaps(1);
  }, [fetchRecaps]);

  const loadMore = () => {
    if (!isLoadingMore && hasMore) fetchRecaps(page + 1);
  };

  return { recaps, isLoading, isLoadingMore, hasMore, loadMore };
}