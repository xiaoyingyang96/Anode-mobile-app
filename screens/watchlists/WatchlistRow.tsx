import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WatchlistColors } from '@/constants/theme';
import { Row } from '@/types/watchlist';

interface WatchlistRowProps {
  item: Row;
  index: number;
  onDelete: (ticker: string) => void;
  isDeleting: boolean;
  isWide?: boolean;
}

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

function formatPct(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

function AssetLogo({ ticker }: { ticker: string }) {
  const [errored, setErrored] = useState(false);
  const uri = `https://assets.coincap.io/assets/icons/${ticker.toLowerCase()}@2x.png`;

  if (errored) {
    return (
      <View style={styles.logoFallback}>
        <Text style={styles.logoFallbackText}>{ticker.slice(0, 2).toUpperCase()}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={styles.logo}
      onError={() => setErrored(true)}
    />
  );
}

export default function WatchlistRow({ item, index, onDelete, isDeleting, isWide = false }: WatchlistRowProps) {
  const dark = useColorScheme() === 'dark';
  const { width } = useWindowDimensions();
  // On narrow screens hide the ticker badge to reclaim space
  const showBadge = width >= 360;
  const s = makeStyles(dark);

  const isUp = item.changePct >= 0;
  const pctColor = isUp
    ? WatchlistColors.tickerUp[dark ? 'dark' : 'light']
    : WatchlistColors.tickerDown[dark ? 'dark' : 'light'];

  return (
    <View style={s.row}>
      <Text style={s.index}>{index + 1}</Text>

      <View style={s.assetCell}>
        <AssetLogo ticker={item.ticker} />
        <View style={s.assetInfo}>
          <Text style={s.assetName} numberOfLines={1}>
            {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
          </Text>
          {showBadge && (
            <View style={s.tickerBadge}>
              <Text style={s.tickerText}>{item.ticker.toUpperCase()}</Text>
            </View>
          )}
        </View>
      </View>

      {isWide && (
        <Text style={s.ohlcCell}>{formatPrice(item.open24h)}</Text>
      )}
      {isWide && (
        <Text style={[s.ohlcCell, { color: WatchlistColors.tickerUp[dark ? 'dark' : 'light'] }]}>
          {formatPrice(item.high24h)}
        </Text>
      )}
      {isWide && (
        <Text style={[s.ohlcCell, { color: WatchlistColors.tickerDown[dark ? 'dark' : 'light'] }]}>
          {formatPrice(item.low24h)}
        </Text>
      )}

      <View style={s.priceCell}>
        <Text style={s.price}>{formatPrice(item.price)}</Text>
        <Text style={[s.changePct, { color: pctColor }]}>{formatPct(item.changePct)}</Text>
      </View>

      <TouchableOpacity
        onPress={() => onDelete(item.ticker)}
        disabled={isDeleting}
        style={s.deleteBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {isDeleting ? (
          <ActivityIndicator size={16} color={WatchlistColors.deleteRed} />
        ) : (
          <Ionicons name="trash-outline" size={18} color={WatchlistColors.deleteRed} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  logoFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: WatchlistColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFallbackText: {
    fontSize: 10,
    fontWeight: '700',
    color: WatchlistColors.primary,
  },
});

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      backgroundColor: WatchlistColors.surface[dark ? 'dark' : 'light'],
    },
    index: {
      width: 24,
      fontSize: 12,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      marginRight: 8,
    },
    assetCell: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    assetInfo: {
      flex: 1,
    },
    assetName: {
      fontSize: 14,
      fontWeight: '600',
      color: dark ? '#EEEEEF' : '#111827',
      marginBottom: 2,
    },
    tickerBadge: {
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      borderRadius: 4,
      paddingHorizontal: 5,
      paddingVertical: 1,
    },
    tickerText: {
      fontSize: 10,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      fontWeight: '500',
    },
    ohlcCell: {
      width: 80,
      textAlign: 'right',
      fontSize: 13,
      fontWeight: '500',
      color: dark ? '#EEEEEF' : '#111827',
      marginRight: 4,
    },
    priceCell: {
      alignItems: 'flex-end',
      marginRight: 12,
    },
    price: {
      fontSize: 14,
      fontWeight: '600',
      color: dark ? '#EEEEEF' : '#111827',
    },
    changePct: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 2,
    },
    deleteBtn: {
      width: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
