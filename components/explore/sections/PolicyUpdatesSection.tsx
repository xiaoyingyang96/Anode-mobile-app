import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

import { WatchlistColors } from '@/constants/theme';
import PolicyCard from '@/components/explore/cards/PolicyCard';
import { GovernmentPolicy } from '@/types/explore';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const PAGE_SIZE = 20;

export default function PolicyUpdatesSection() {
  const dark = useColorScheme() === 'dark';
  const s = makeStyles(dark);

  const [policies, setPolicies] = useState<GovernmentPolicy[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPolicies = useCallback(
    async (pageToLoad: number, reset: boolean) => {
      const setter = reset ? setLoading : setLoadingMore;
      setter(true);
      try {
        const res = await fetch(
          `${API_BASE}/api/news/feeds?locale=en&page=${pageToLoad}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as GovernmentPolicy[];

        setPolicies((prev) => (reset ? data : [...prev, ...data]));
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
    fetchPolicies(0, true);
  }, [fetchPolicies]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    fetchPolicies(page + 1, false);
  }, [hasMore, loadingMore, loading, page, fetchPolicies]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={s.footerLoader}>
        <ActivityIndicator size="small" color={WatchlistColors.primary} />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={WatchlistColors.primary} />
      </View>
    );
  }

  if (!policies.length) {
    return (
      <View style={s.centered}>
        <Text style={s.emptyText}>No policy updates available.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={policies}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <PolicyCard policy={item} />}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      contentContainerStyle={{ paddingBottom: 16 }}
      showsVerticalScrollIndicator={false}
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      ListFooterComponent={renderFooter}
    />
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
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
