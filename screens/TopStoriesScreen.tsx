import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import NewsCard from '@/components/explore/cards/NewsCard';
import NewsDetailModal from '@/components/explore/NewsDetailModal';
import { Colors, WatchlistColors } from '@/constants/theme';
import { NewsStory } from '@/types/explore';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const PAGE_SIZE = 20;

export default function TopStoriesScreen() {
  const dark = useColorScheme() === 'dark';
  const s = makeStyles(dark);

  const [stories, setStories] = useState<NewsStory[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [activePublisher, setActivePublisher] = useState<string | null>(null);
  const [selected, setSelected] = useState<NewsStory | null>(null);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef(search);
  const publisherRef = useRef(activePublisher);

  searchRef.current = search;
  publisherRef.current = activePublisher;

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchStories = useCallback(
    async (
      pageToLoad: number,
      keyword: string,
      publisher: string | null,
      reset: boolean
    ) => {
      const setter = reset ? setLoading : setLoadingMore;
      setter(true);
      try {
        // let query = `locale=en&page=${pageToLoad}`;
        let query = `page=${pageToLoad}`;
        if (keyword) query += `&keyword=${encodeURIComponent(keyword)}`;
        if (publisher) query += `&publisher=${encodeURIComponent(publisher)}`;

        const res = await fetch(`${API_BASE}/api/news/stories?${query}`);
        console.log('fetch URL:', `${API_BASE}/api/news/stories?${query}`);
        console.log('status:', res.status);
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
    fetchStories(1, search, activePublisher, true);
  }, [fetchStories]); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(() => {
    fetchStories(
      1,
      searchRef.current,
      publisherRef.current,
      true
    );
  }, [fetchStories]);

  // ── Search (debounced) ─────────────────────────────────────────────────
  const handleSearch = (text: string) => {
    setSearch(text);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchStories(1, text, publisherRef.current, true);
    }, 400);
  };

  // ── Clear all filters ──────────────────────────────────────────────────
  const clearFilters = () => {
    setActivePublisher(null);
    fetchStories(1, searchRef.current, null, true);
  };

  const hasFilters =!!activePublisher;

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    fetchStories(
      page + 1,
      searchRef.current,
      publisherRef.current,
      false
    );
  }, [hasMore, loadingMore, loading, page, fetchStories]);

  // ── Render ─────────────────────────────────────────────────────────────
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={s.footerLoader}>
        <ActivityIndicator size="small" color={WatchlistColors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>
        {/* Search bar */}
        <View style={s.searchRow}>
          <View style={s.searchBox}>
            <Ionicons
              name="search-outline"
              size={16}
              color={WatchlistColors.textSecondary[dark ? 'dark' : 'light']}
              style={{ marginLeft: 12 }}
            />
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
            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => handleSearch('')}
                hitSlop={8}
                style={{ marginRight: 12 }}
              >
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={
                    WatchlistColors.textSecondary[dark ? 'dark' : 'light']
                  }
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* Feed */}
        {loading ? (
          <View style={s.centered}>
            <ActivityIndicator size="large" color={WatchlistColors.primary} />
          </View>
        ) : stories.length === 0 ? (
          <View style={s.centered}>
            <Ionicons
              name="newspaper-outline"
              size={48}
              color={WatchlistColors.textSecondary[dark ? 'dark' : 'light']}
            />
            <Text style={s.emptyTitle}>No stories found</Text>
            {hasFilters && (
              <TouchableOpacity onPress={clearFilters}>
                <Text style={s.clearFiltersLink}>Clear filters</Text>
              </TouchableOpacity>
            )}
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
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
          />
        )}
      </View>

      {/* Article detail modal */}
      <NewsDetailModal story={selected} onClose={() => setSelected(null)} />
    </SafeAreaView>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: Colors[dark ? 'dark' : 'light'].background,
    },
    container: {
      flex: 1,
      paddingHorizontal: 12,
      paddingTop: 8,
      gap: 10,
    },
    titleRow: {
      paddingBottom: 2,
    },
    pageTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: dark ? '#EEEEEF' : '#111827',
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    searchBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      backgroundColor: dark ? '#0D1117' : '#FFFFFF',
      height: 42,
    },
    searchInput: {
      flex: 1,
      height: 42,
      paddingHorizontal: 10,
      fontSize: 14,
      color: dark ? '#EEEEEF' : '#111827',
    },
    filtersRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    pillsContent: {
      gap: 6,
      paddingRight: 4,
    },
    pill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      backgroundColor: dark ? '#0D1117' : '#FFFFFF',
    },
    pillActive: {
      backgroundColor: WatchlistColors.primaryMuted,
      borderColor: WatchlistColors.primary,
    },
    pillText: {
      fontSize: 12,
      fontWeight: '500',
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
    },
    pillTextActive: {
      color: WatchlistColors.primary,
      fontWeight: '700',
    },
    clearBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    clearText: {
      fontSize: 12,
      color: WatchlistColors.primary,
      fontWeight: '600',
    },
    activeFilters: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    activeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: WatchlistColors.primaryMuted,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    activeChipText: {
      fontSize: 12,
      color: WatchlistColors.primary,
      fontWeight: '600',
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: dark ? '#EEEEEF' : '#111827',
    },
    clearFiltersLink: {
      fontSize: 13,
      color: WatchlistColors.primary,
      fontWeight: '600',
    },
    footerLoader: {
      paddingVertical: 16,
      alignItems: 'center',
    },
  });
