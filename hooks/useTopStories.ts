import { useCallback, useEffect, useState } from "react";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export type NewsStory = {
  id: string;
  title: string;
  summary: string;
  publisher: string;
  published_at: string;
  url: string;
  image_url?: string;
};

export function useTopStories() {
  const [news, setNews] = useState<NewsStory[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchNews = useCallback(async (pageToLoad = 1) => {
    const setter = pageToLoad === 1 ? setIsLoading : setIsLoadingMore;
    setter(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/news/stories?locale=en-US&page=${pageToLoad}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: NewsStory[] = await res.json();
      setNews((prev) => (pageToLoad === 1 ? data : [...prev, ...data]));
      setHasMore(data.length > 0);
      setPage(pageToLoad);
    } catch (e) {
      console.error("Error fetching news:", e);
    } finally {
      setter(false);
    }
  }, []);

  useEffect(() => {
    fetchNews(1);
  }, [fetchNews]);

  const loadMore = () => {
    if (!isLoadingMore && hasMore) fetchNews(page + 1);
  };

  return { news, isLoading, isLoadingMore, hasMore, loadMore };
}