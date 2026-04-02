import React, { useMemo, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  FlatList,
  TouchableOpacity,
  Linking,
  Image,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WatchlistColors } from '@/constants/theme';
import { AssetTicker, NewsStory, Row, WatchlistOHLCVData } from '@/types/watchlist';
import { useWatchlistContent } from '@/hooks/useWatchlistContent';
import WatchlistRow from './WatchlistRow';
import { watchlistApi } from '@/utils/watchlistApi';

interface WatchlistContentProps {
  assetTickers: AssetTicker[];
  watchlistId: number;
  onRefetch: () => void;
}

function buildRows(data: WatchlistOHLCVData[]): Row[] {
  return data.map((item) => {
    const series = item.price_data?.['1d'] ?? [];
    const price = series.length > 0 ? series[series.length - 1].close : 0;
    const prevClose = series.length > 1 ? series[series.length - 2].close : price;
    const changePct = prevClose !== 0 ? ((price - prevClose) / prevClose) * 100 : 0;
    const prices = series.map((p) => p.close);
    return {
      ticker: item.ticker,
      name: item.name,
      series,
      price,
      prevClose,
      changePct,
      open24h: series.length > 0 ? series[0].open : 0,
      high24h: prices.length > 0 ? Math.max(...prices) : 0,
      low24h: prices.length > 0 ? Math.min(...prices) : 0,
      asset_pair: item.asset_pair,
    };
  });
}

function sentimentColor(naive: -1 | 0 | 1 | undefined, dark: boolean): string {
  if (naive === 1) return WatchlistColors.tickerUp[dark ? 'dark' : 'light'];
  if (naive === -1) return WatchlistColors.tickerDown[dark ? 'dark' : 'light'];
  return dark ? '#AEB0B4' : '#4B5563';
}

function NewsCard({ story, dark }: { story: NewsStory; dark: boolean }) {
  const s = newsStyles(dark);
  const accentColor = sentimentColor(story.naive_class, dark);

  // Press-lift animation — port of SentimentX's card hover (translateY(-2px) + shadow, all .18s ease)
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 60, bounciness: 0 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 5 }).start();

  const handlePress = () => {
    if (story.url) Linking.openURL(story.url).catch(() => {});
  };

  return (
    <Animated.View style={[s.card, { transform: [{ scale }] }]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={s.cardInner}
      >
        <View style={[s.accentBar, { backgroundColor: accentColor }]} />
        {story.image_url ? (
          <Image source={{ uri: story.image_url }} style={s.image} resizeMode="cover" />
        ) : null}
        <View style={s.cardBody}>
          <Text style={s.title} numberOfLines={2}>{story.title}</Text>
          <View style={s.meta}>
            {story.publisher ? <Text style={s.publisher}>{story.publisher}</Text> : null}
            {story.published_at ? (
              <Text style={s.time}>
                {new Date(story.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function WatchlistContent({
  assetTickers,
  watchlistId,
  onRefetch,
}: WatchlistContentProps) {
  const dark = useColorScheme() === 'dark';
  const { width } = useWindowDimensions();
  const isWide = width >= 600;
  const s = makeStyles(dark, isWide);

  const { ohlcv, stories, ohlcvLoading, storiesLoading, ohlcvError } = useWatchlistContent(assetTickers);

  const rows = useMemo<Row[]>(() => {
    if (!ohlcv?.data) return [];
    return buildRows(ohlcv.data);
  }, [ohlcv]);

  const allStories = useMemo<NewsStory[]>(() => {
    if (!stories?.data) return [];
    const seen = new Set<string | number>();
    return stories.data.flatMap((a) => a.related_stories).filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [stories]);

  const handleDeleteAsset = async (ticker: string) => {
    const result = await watchlistApi.removeAsset(watchlistId, ticker);
    if (!result.ok) {
      Alert.alert('Error', result.error || 'Failed to remove asset.');
    } else {
      onRefetch();
    }
  };

  if (ohlcvLoading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={WatchlistColors.primary} />
        <Text style={s.loadingText}>Loading assets...</Text>
      </View>
    );
  }

  if (ohlcvError) {
    return (
      <View style={s.centered}>
        <Ionicons name="alert-circle-outline" size={40} color={WatchlistColors.deleteRed} />
        <Text style={s.errorText}>Failed to load assets.</Text>
      </View>
    );
  }

  const ListHeader = () => (
    <>
      {/* Unsupported tickers warning */}
      {(ohlcv?.unsupported_tickers?.length ?? 0) > 0 && (
        <View style={s.alertWarn}>
          <Ionicons name="warning-outline" size={14} color="#B45309" />
          <Text style={s.alertText}>
            Unsupported: {ohlcv!.unsupported_tickers.map((t) => t.toUpperCase()).join(', ')}
          </Text>
        </View>
      )}
      {/* Table header */}
      <View style={s.tableHeader}>
        <Text style={[s.headerCell, { width: 32 }]}>#</Text>
        <Text style={[s.headerCell, { flex: 1 }]}>Asset</Text>
        {isWide && <Text style={[s.headerCell, { width: 80, textAlign: 'right' }]}>Open</Text>}
        {isWide && <Text style={[s.headerCell, { width: 80, textAlign: 'right' }]}>High</Text>}
        {isWide && <Text style={[s.headerCell, { width: 80, textAlign: 'right' }]}>Low</Text>}
        <Text style={[s.headerCell, { textAlign: 'right', marginRight: 44 }]}>Price / 24h</Text>
      </View>
    </>
  );

  const newsColumns: NewsStory[][] = isWide
    ? allStories.reduce<NewsStory[][]>(
        (cols, story, i) => { cols[i % 2].push(story); return cols; },
        [[], []]
      )
    : [allStories];

  const ListFooter = () => (
    <View style={s.newsSection}>
      <Text style={s.sectionTitle}>Related News</Text>
      {storiesLoading ? (
        <ActivityIndicator size="small" color={WatchlistColors.primary} style={{ marginTop: 12 }} />
      ) : allStories.length === 0 ? (
        <Text style={s.emptyNews}>No related stories found.</Text>
      ) : isWide ? (
        <View style={s.newsGrid}>
          {newsColumns.map((col, ci) => (
            <View key={ci} style={s.newsCol}>
              {col.map((story) => (
                <NewsCard key={story.id} story={story} dark={dark} />
              ))}
            </View>
          ))}
        </View>
      ) : (
        allStories.map((story) => (
          <NewsCard key={story.id} story={story} dark={dark} />
        ))
      )}
    </View>
  );

  return (
    <FlatList
      data={rows}
      keyExtractor={(item) => item.ticker}
      renderItem={({ item, index }) => (
        <WatchlistRow
          item={item}
          index={index}
          onDelete={handleDeleteAsset}
          isDeleting={false}
          isWide={isWide}
        />
      )}
      ListHeaderComponent={<ListHeader />}
      ListFooterComponent={<ListFooter />}
      contentContainerStyle={s.listContent}
    />
  );
}

const makeStyles = (dark: boolean, _isWide: boolean) =>
  StyleSheet.create({
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 60,
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
    },
    errorText: {
      fontSize: 14,
      color: WatchlistColors.deleteRed,
    },
    listContent: {
      paddingBottom: 40,
    },
    alertWarn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: dark ? '#2D1F00' : '#FFFBEB',
      borderWidth: 1,
      borderColor: '#B45309',
      borderRadius: 8,
      padding: 10,
      marginHorizontal: 16,
      marginBottom: 8,
    },
    alertText: {
      fontSize: 13,
      color: '#B45309',
      flex: 1,
    },
    tableHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: dark ? '#0D1117' : '#F3F4F6',
    },
    headerCell: {
      fontSize: 11,
      fontWeight: '700',
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    newsSection: {
      paddingHorizontal: 16,
      paddingTop: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: dark ? '#EEEEEF' : '#111827',
      marginBottom: 12,
    },
    emptyNews: {
      fontSize: 13,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      textAlign: 'center',
      marginTop: 8,
    },
    newsGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    newsCol: {
      flex: 1,
    },
  });

const newsStyles = (dark: boolean) =>
  StyleSheet.create({
    card: {
      borderRadius: 12,
      marginBottom: 10,
      // shadow visible during scale-up press animation
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: dark ? 0.35 : 0.12,
      shadowRadius: 8,
      elevation: 3,
    },
    cardInner: {
      flexDirection: 'row',
      backgroundColor: dark ? '#111827' : '#FFFFFF',
      borderRadius: 12,
      overflow: 'hidden',
    },
    accentBar: {
      width: 4,
    },
    image: {
      width: 80,
      height: 80,
    },
    cardBody: {
      flex: 1,
      padding: 10,
      justifyContent: 'space-between',
    },
    title: {
      fontSize: 13,
      fontWeight: '600',
      color: dark ? '#EEEEEF' : '#111827',
      lineHeight: 18,
    },
    meta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 6,
    },
    publisher: {
      fontSize: 11,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
    },
    time: {
      fontSize: 11,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
    },
  });
