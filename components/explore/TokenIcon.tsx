import { Image } from 'expo-image';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { WatchlistColors } from '@/constants/theme';

const LOGO_DEV_KEY = process.env.EXPO_PUBLIC_LOGO_DEV_API_KEY;

function logoUrl(symbol: string): string {
  const base = `https://img.logo.dev/crypto/${symbol.toLowerCase()}`;
  return LOGO_DEV_KEY ? `${base}?token=${LOGO_DEV_KEY}` : base;
}

interface TokenIconProps {
  /** Ticker symbol, e.g. "BTC", "ETH" */
  symbol: string;
  size?: number;
}

export default function TokenIcon({ symbol, size = 20 }: TokenIconProps) {
  const [error, setError] = useState(false);

  const initials = symbol.replace(/-USD$/, '').slice(0, 3).toUpperCase();
  const fontSize = size * 0.38;

  if (error) {
    return (
      <View
        style={[
          styles.fallback,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Text style={[styles.fallbackText, { fontSize }]}>{initials}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: logoUrl(symbol) }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      contentFit="cover"
      onError={() => setError(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: WatchlistColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: WatchlistColors.primary,
    fontWeight: '700',
  },
});
