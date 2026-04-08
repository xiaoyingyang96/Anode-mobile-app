import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

import { WatchlistColors } from '@/constants/theme';
import { MarketOverviewData } from '@/types/explore';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

function formatCompact(value?: number): string {
  if (typeof value !== 'number') return '—';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(0)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
  return `$${value.toFixed(0)}`;
}

function formatPct(value?: number, decimals = 2): string {
  if (typeof value !== 'number') return '—';
  const abs = Math.abs(value).toFixed(decimals);
  return `${abs}%`;
}

function Delta({ value, dark }: { value?: number; dark: boolean }) {
  const isUp = (value ?? 0) >= 0;
  const color = isUp
    ? WatchlistColors.tickerUp[dark ? 'dark' : 'light']
    : WatchlistColors.tickerDown[dark ? 'dark' : 'light'];
  const arrow = isUp ? '▲' : '▼';
  return (
    <Text style={{ fontSize: 10, color, fontWeight: '600' }}>
      {arrow} {formatPct(value)}
    </Text>
  );
}

function KpiCard({
  label,
  value,
  delta,
  dark,
  children,
}: {
  label: string;
  value?: string;
  delta?: number;
  dark: boolean;
  children?: React.ReactNode;
}) {
  const s = makeStyles(dark);
  return (
    <View style={s.kpiCard}>
      <Text style={s.kpiLabel}>{label}</Text>
      {children ?? (
        <View style={s.kpiValueRow}>
          <Text style={s.kpiValue} numberOfLines={1}>
            {value ?? '—'}
          </Text>
          {delta !== undefined && <Delta value={delta} dark={dark} />}
        </View>
      )}
    </View>
  );
}

export default function MarketOverviewBar() {
  const dark = useColorScheme() === 'dark';
  const s = makeStyles(dark);
  const [data, setData] = useState<MarketOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/product/market-overview`, {
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as MarketOverviewData;
        setData(json);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  if (loading) {
    return (
      <View style={s.loadingRow}>
        <ActivityIndicator size="small" color={WatchlistColors.primary} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={s.loadingRow}>
        <Text style={s.errorText}>Failed to load market overview.</Text>
      </View>
    );
  }

  return (
    <View style={s.row}>
      <KpiCard
        label="Marketcap"
        value={formatCompact(data.total_market_cap)}
        delta={data.total_market_cap_change_24h}
        dark={dark}
      />
      <KpiCard
        label="Volume (24h)"
        value={formatCompact(data.total_volume_24h)}
        delta={data.total_volume_24h_change}
        dark={dark}
      />
      <KpiCard label="Dominance" dark={dark}>
        <View style={{ gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={makeStyles(dark).kpiValue}>
              BTC {formatPct(data.bitcoin_dominance, 1)}
            </Text>
            <Delta value={data.bitcoin_dominance_24h_change} dark={dark} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={makeStyles(dark).kpiValue}>
              ETH {formatPct(data.ethereum_dominance, 1)}
            </Text>
            <Delta value={data.ethereum_dominance_24h_change} dark={dark} />
          </View>
        </View>
      </KpiCard>
    </View>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: 6,
    },
    loadingRow: {
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorText: {
      fontSize: 12,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
    },
    kpiCard: {
      flex: 1,
      backgroundColor: dark ? '#0D1117' : '#F9FAFB',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      paddingHorizontal: 8,
      paddingVertical: 7,
      gap: 3,
    },
    kpiLabel: {
      fontSize: 10,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      fontWeight: '500',
    },
    kpiValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    kpiValue: {
      fontSize: 13,
      fontWeight: '700',
      color: dark ? '#EEEEEF' : '#111827',
      flexShrink: 1,
    },
  });
