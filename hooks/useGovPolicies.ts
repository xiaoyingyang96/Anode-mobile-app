import { useCallback, useEffect, useState } from "react";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export type GovernmentPolicy = {
  id: string;
  title: string;
  content: string;
  agency_short: string;
  agency_long: string;
  region: string;
  tags: string[];
  published_at: string;
  url: string;
};

export function useGovPolicies() {
  const [govPolicies, setGovPolicies] = useState<GovernmentPolicy[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchGovPolicies = useCallback(async (pageToLoad = 0) => {
    const setter = pageToLoad === 0 ? setIsLoading : setIsLoadingMore;
    setter(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/news/feeds?locale=en-US&page=${pageToLoad}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: GovernmentPolicy[] = await res.json();
      setGovPolicies((prev) => (pageToLoad === 0 ? data : [...prev, ...data]));
      setHasMore(data.length > 0);
      setPage(pageToLoad);
    } catch (e) {
      console.error("Error fetching government policies:", e);
    } finally {
      setter(false);
    }
  }, []);

  useEffect(() => {
    fetchGovPolicies(0);
  }, [fetchGovPolicies]);

  const loadMore = () => {
    if (!isLoadingMore && hasMore) fetchGovPolicies(page + 1);
  };

  return { govPolicies, isLoading, isLoadingMore, hasMore, loadMore };
}