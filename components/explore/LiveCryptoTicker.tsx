import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

import { WatchlistColors } from '@/constants/theme';
import { CoinbaseTicker } from '@/types/explore';

const PRODUCT_IDS = [
  'BTC-USD',
  'ETH-USD',
  'USDT-USD',
  'XRP-USD',
  'SOL-USD',
  'USDC-USD',
  'DOGE-USD',
  'LINK-USD',
];

const CARD_WIDTH = 130;
const CARD_MARGIN = 8;
const ITEM_WIDTH = CARD_WIDTH + CARD_MARGIN;
const SINGLE_SET_WIDTH = PRODUCT_IDS.length * ITEM_WIDTH;
const SCROLL_DURATION = 30_000;

async function fetchTicker(pid: string): Promise<CoinbaseTicker | null> {
  try {
    const res = await fetch(
      `https://api.exchange.coinbase.com/products/${pid}/stats`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const price = parseFloat(data.last);
    const open = parseFloat(data.open);
    const change24hPct = open !== 0 ? ((price - open) / open) * 100 : 0;
    return { pid, price, change24hPct };
  } catch {
    return null;
  }
}

function formatPrice(price: number): string {
  if (price >= 1000) {
    return `$${price.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  }
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
}

export default function LiveCryptoTicker() {
  const dark = useColorScheme() === 'dark';
  const s = makeStyles(dark);
  const [tickers, setTickers] = useState<Record<string, CoinbaseTicker>>({});
  const translateX = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      const results = await Promise.all(PRODUCT_IDS.map(fetchTicker));
      const map: Record<string, CoinbaseTicker> = {};
      results.forEach((t) => {
        if (t) map[t.pid] = t;
      });
      setTickers(map);
    };
    fetchAll();
    const interval = setInterval(fetchAll, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    animRef.current?.stop();
    translateX.setValue(0);
    animRef.current = Animated.loop(
      Animated.timing(translateX, {
        toValue: -SINGLE_SET_WIDTH,
        duration: SCROLL_DURATION,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animRef.current.start();
    return () => {
      animRef.current?.stop();
    };
  }, [translateX]);

  const renderCard = (pid: string, keyPrefix: string) => {
    const ticker = tickers[pid];
    const symbol = pid.split('-')[0];
    const price = ticker?.price ?? null;
    const change = ticker?.change24hPct ?? null;
    const isUp = (change ?? 0) >= 0;
    const changeColor = isUp
      ? WatchlistColors.tickerUp[dark ? 'dark' : 'light']
      : WatchlistColors.tickerDown[dark ? 'dark' : 'light'];

    return (
      <View key={`${keyPrefix}-${pid}`} style={s.card}>
        <Text style={s.symbol}>{symbol}</Text>
        <View style={s.priceRow}>
          <Text style={s.price} numberOfLines={1}>
            {price !== null ? formatPrice(price) : '—'}
          </Text>
          <Text style={[s.change, { color: changeColor }]}>
            {change !== null
              ? `${isUp ? '+' : ''}${change.toFixed(2)}%`
              : '—'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={s.wrapper}>
      <Animated.View
        style={[s.track, { transform: [{ translateX }] }]}
      >
        {/* Render twice for seamless loop */}
        {PRODUCT_IDS.map((pid) => renderCard(pid, 'a'))}
        {PRODUCT_IDS.map((pid) => renderCard(pid, 'b'))}
      </Animated.View>
    </View>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    wrapper: {
      height: 50,
      overflow: 'hidden',
    },
    track: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 50,
    },
    card: {
      width: CARD_WIDTH,
      marginRight: CARD_MARGIN,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      backgroundColor: WatchlistColors.cardBg[dark ? 'dark' : 'light'],
      justifyContent: 'center',
    },
    symbol: {
      fontSize: 11,
      fontWeight: '700',
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      marginBottom: 2,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    price: {
      fontSize: 13,
      fontWeight: '700',
      color: dark ? '#EEEEEF' : '#111827',
      flex: 1,
      marginRight: 4,
    },
    change: {
      fontSize: 11,
      fontWeight: '600',
    },
  });
