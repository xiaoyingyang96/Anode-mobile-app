import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import { WatchlistColors } from '@/constants/theme';
import TokenIcon from '@/components/explore/TokenIcon';
import { NewsStory } from '@/types/explore';

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface NewsCardProps {
  story: NewsStory;
  selected?: boolean;
  onPress?: (story: NewsStory) => void;
}

export default function NewsCard({
  story,
  selected = false,
  onPress,
}: NewsCardProps) {
  const dark = useColorScheme() === 'dark';
  const s = makeStyles(dark);

  // sentiment color: 1 positive, 0 neutral, -1 negative
  const sentiment = story.naive_class ?? 0;
  const sentimentColor =
    sentiment === 1
      ? dark
        ? '#07CDA5'
        : '#059669'
      : sentiment === -1
        ? dark
          ? '#FA3364'
          : '#DC2626'
        : dark
          ? '#F59E0B'
          : '#D97706';

  // crypto_assets: { "bitcoin": "BTC", "ethereum": "ETH" }
  const tokenSymbols = story.crypto_assets
    ? Object.values(story.crypto_assets).slice(0, 5)
    : [];

  const timeAndPublisher = [
    formatRelativeTime(story.published_at),
    story.publisher,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <TouchableOpacity
      style={[
        s.card,
        { borderLeftColor: sentimentColor },
        selected && s.cardSelected,
      ]}
      onPress={() => onPress?.(story)}
      activeOpacity={0.75}
    >
      {/* Title */}
      <Text style={s.title} numberOfLines={2}>
        {story.title}
      </Text>

      {/* Footer: time/publisher + token icons + tags */}
      <View style={s.footer}>
        <View style={s.footerLeft}>
          {/* Time & publisher */}
          {timeAndPublisher ? (
            <Text style={s.meta} numberOfLines={1}>
              {timeAndPublisher}
            </Text>
          ) : null}

          {/* Token icons */}
          {tokenSymbols.length > 0 && (
            <View style={s.tokens}>
              {tokenSymbols.map((symbol, i) => (
                <View
                  key={symbol}
                  style={[s.tokenWrapper, { marginLeft: i === 0 ? 0 : -6 }]}
                >
                  <TokenIcon symbol={symbol} size={16} />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <View style={s.tagsRow}>
            {story.tags.slice(0, 2).map((tag) => (
              <View key={tag} style={s.tag}>
                <Text style={s.tagText} numberOfLines={1}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    card: {
      borderRadius: 10,
      borderWidth: 1,
      borderLeftWidth: 3,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      backgroundColor: dark ? '#0D1117' : '#F9FAFB',
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 6,
      justifyContent: 'space-between',
    },
    cardSelected: {
      backgroundColor: WatchlistColors.tabActiveBg[dark ? 'dark' : 'light'],
    },
    title: {
      fontSize: 13,
      fontWeight: '700',
      color: dark ? '#EEEEEF' : '#111827',
      lineHeight: 18,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    footerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
      minWidth: 0,
    },
    meta: {
      fontSize: 11,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      flexShrink: 1,
    },
    tokens: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    tokenWrapper: {
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: dark ? '#050B14' : '#F3F4F6',
    },
    tagsRow: {
      flexDirection: 'row',
      gap: 4,
      flexShrink: 0,
    },
    tag: {
      backgroundColor: WatchlistColors.primaryMuted,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      maxWidth: 80,
    },
    tagText: {
      fontSize: 10,
      color: WatchlistColors.primary,
      fontWeight: '600',
    },
  });
