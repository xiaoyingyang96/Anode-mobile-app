import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import { WatchlistColors } from '@/constants/theme';
import { GovernmentPolicy } from '@/types/explore';

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface PolicyCardProps {
  policy: GovernmentPolicy;
  onPress?: (policy: GovernmentPolicy) => void;
}

export default function PolicyCard({ policy, onPress }: PolicyCardProps) {
  const dark = useColorScheme() === 'dark';
  const s = makeStyles(dark);

  const metaParts = [
    policy.agency_short || policy.agency_long,
    policy.region,
    formatDate(policy.published_at),
  ].filter(Boolean);

  return (
    <TouchableOpacity
      style={s.card}
      onPress={() => onPress?.(policy)}
      activeOpacity={0.75}
    >
      <Text style={s.title} numberOfLines={2}>
        {policy.title}
      </Text>
      {metaParts.length > 0 && (
        <Text style={s.meta} numberOfLines={1}>
          {metaParts.join(' · ')}
        </Text>
      )}
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
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 5,
      minHeight: 70,
      justifyContent: 'center',
    },
    title: {
      fontSize: 12,
      fontWeight: '700',
      color: dark ? '#EEEEEF' : '#111827',
      lineHeight: 16,
    },
    meta: {
      fontSize: 11,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      letterSpacing: 0.2,
    },
  });
