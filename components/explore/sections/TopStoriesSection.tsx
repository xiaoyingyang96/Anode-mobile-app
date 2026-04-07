import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';

import { WatchlistColors } from '@/constants/theme';
import NewsCard from '@/components/explore/cards/NewsCard';
import NewsDetailModal from '@/components/explore/NewsDetailModal';
import { NewsStory } from '@/types/explore';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const PAGE_SIZE = 20;

export default function TopStoriesSection() {
  const dark = useColorScheme() === 'dark';
  const s = makeStyles(dark);

  const [stories, setStories] = useState<NewsStory[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<NewsStory | null>(null);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef(search);
  searchRef.current = search;

  const fetchStories = useCallback(
    async (pageToLoad: number, keyword: string, reset: boolean) => {
      const setter = reset ? setLoading : setLoadingMore;
      setter(true);
      try {
        let query = `locale=en&page=${pageToLoad}`;
        if (keyword) query += `&keyword=${encodeURIComponent(keyword)}`;

        const res = await fetch(`${API_BASE}/api/news/stories?${query}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as NewsStory[];

        setStories((prev) => (reset ? data : [...prev, ...data]));
        setHasMore(data.length >= PAGE_SIZE);
        setPage(pageToLoad);
      } catch {
        setHasMore(false);
      } finally {
        setter(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchStories(1, '', true);
  }, [fetchStories]);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchStories(1, searchRef.current, true);
    }, 400);
  };

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    fetchStories(page + 1, searchRef.current, false);
  }, [hasMore, loadingMore, loading, page, fetchStories]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={s.footerLoader}>
        <ActivityIndicator size="small" color={WatchlistColors.primary} />
      </View>
    );
  };

  return (
    <View style={s.container}>
      {/* Search bar */}
      <View style={s.searchContainer}>
        <TextInput
          style={s.searchInput}
          placeholder="Search news..."
          placeholderTextColor={
            WatchlistColors.textSecondary[dark ? 'dark' : 'light']
          }
          value={search}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={WatchlistColors.primary} />
        </View>
      ) : stories.length === 0 ? (
        <View style={s.centered}>
          <Text style={s.emptyText}>No stories found.</Text>
        </View>
      ) : (
        <FlatList
          data={stories}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <NewsCard
              story={item}
              selected={selected?.id === item.id}
              onPress={setSelected}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
        />
      )}

      {/* Article detail modal */}
      <NewsDetailModal story={selected} onClose={() => setSelected(null)} />
    </View>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, gap: 10 },
    searchContainer: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      backgroundColor: dark ? '#0D1117' : '#FFFFFF',
      overflow: 'hidden',
    },
    searchInput: {
      height: 40,
      paddingHorizontal: 14,
      fontSize: 14,
      color: dark ? '#EEEEEF' : '#111827',
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontSize: 13,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
    },
    footerLoader: {
      paddingVertical: 16,
      alignItems: 'center',
    },
  });
