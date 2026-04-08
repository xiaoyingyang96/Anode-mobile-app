import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import { WatchlistColors } from '@/constants/theme';
import { DailyRecap } from '@/types/explore';

function formatRecapDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today's Recap";
  if (date.toDateString() === yesterday.toDateString())
    return "Yesterday's Recap";

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

interface DailyRecapCardProps {
  recap: DailyRecap;
  onPress?: (recap: DailyRecap) => void;
}

export default function DailyRecapCard({
  recap,
  onPress,
}: DailyRecapCardProps) {
  const dark = useColorScheme() === 'dark';
  const s = makeStyles(dark);

  const previewText =
    recap.items.length > 0
      ? recap.items[0].text
      : "No summaries available yet.";

  const numSummaries = recap.items.length;
  const cryptoTags = recap.crypto_assets
    ? Object.keys(recap.crypto_assets).slice(0, 3)
    : [];

  return (
    <TouchableOpacity
      style={s.card}
      onPress={() => onPress?.(recap)}
      activeOpacity={0.75}
    >
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.date}>{formatRecapDate(recap.date)}</Text>
          {cryptoTags.length > 0 && (
            <View style={s.tagsRow}>
              {cryptoTags.map((tag) => (
                <View key={tag} style={s.tag}>
                  <Text style={s.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={s.countBadge}>
          <Text style={s.countText}>
            {numSummaries > 99 ? '99+' : numSummaries}{' '}
            {numSummaries === 1 ? 'takeaway' : 'takeaways'}
          </Text>
        </View>
      </View>

      {/* Preview text */}
      <Text style={s.preview} numberOfLines={2}>
        {previewText}
      </Text>
    </TouchableOpacity>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    card: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      backgroundColor: dark ? '#0D1117' : '#FFFFFF',
      padding: 12,
      gap: 6,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 8,
    },
    headerLeft: {
      flex: 1,
      gap: 4,
    },
    date: {
      fontSize: 13,
      fontWeight: '700',
      color: dark ? '#EEEEEF' : '#111827',
    },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
    },
    tag: {
      backgroundColor: WatchlistColors.primaryMuted,
      borderRadius: 4,
      paddingHorizontal: 5,
      paddingVertical: 2,
    },
    tagText: {
      fontSize: 9,
      color: WatchlistColors.primary,
      fontWeight: '600',
    },
    countBadge: {
      backgroundColor: WatchlistColors.primaryMuted,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      flexShrink: 0,
    },
    countText: {
      fontSize: 10,
      color: WatchlistColors.primary,
      fontWeight: '700',
    },
    preview: {
      fontSize: 12,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      lineHeight: 17,
    },
  });
