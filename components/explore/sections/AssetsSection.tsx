import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import { WatchlistColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useWatchlists } from '@/hooks/useWatchlists';
import {
  AssetPriceSeries,
  AssetRow,
  ListMode,
  MarketGraphResponse,
} from '@/types/explore';
import { watchlistApi } from '@/utils/watchlistApi';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

const LIST_MODES: ListMode[] = ['Top Assets', 'US Stock', 'Watchlist'];

// ── Coinbase public ticker for live price updates ──────────────────────────
async function fetchCoinbasePrice(symbol: string): Promise<number | null> {
  try {
    const pid = symbol.includes('-') ? symbol : `${symbol}-USD`;
    const res = await fetch(
      `https://api.exchange.coinbase.com/products/${pid}/ticker`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return parseFloat(data.price) || null;
  } catch {
    return null;
  }
}

function formatPrice(price: number): string {
  if (price >= 1000)
    return `$${price.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
}

// ── Asset avatar (text initials fallback) ───────────────────────────────────
function AssetAvatar({
  symbol,
  size = 28,
  dark,
}: {
  symbol: string;
  size?: number;
  dark: boolean;
}) {
  const initials = symbol.replace(/-USD$/, '').slice(0, 3);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: WatchlistColors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: size * 0.38,
          fontWeight: '700',
          color: WatchlistColors.primary,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function AssetsSection() {
  const dark = useColorScheme() === 'dark';
  const s = makeStyles(dark);
  const { user } = useAuth();

  const [listMode, setListMode] = useState<ListMode>('Top Assets');
  const [rows, setRows] = useState<AssetRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For live Coinbase prices (replace stale OHLCV close)
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});

  // Watchlist state
  const { watchlists, isLoading: watchlistsLoading } = useWatchlists();
  const [activeWatchlistId, setActiveWatchlistId] = useState<number | null>(
    null
  );

  const activeWatchlist = useMemo(
    () =>
      watchlists?.find((w) =>
        activeWatchlistId !== null ? w.id === activeWatchlistId : w.is_default
      ) ?? watchlists?.[0] ?? null,
    [watchlists, activeWatchlistId]
  );

  // ── Fetch market data (Top Assets / US Stock) ─────────────────────────
  useEffect(() => {
    if (listMode === 'Watchlist') return;
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `${API_BASE}/api/product/markets/graph-data?range=1d`,
          { signal: ac.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as MarketGraphResponse;

        const series: AssetPriceSeries[] =
          listMode === 'Top Assets'
            ? (json.crypto ?? [])
            : (json.us_stock ?? []);

        const built: AssetRow[] = series
          .map((s): AssetRow | null => {
            const sorted = [...(s.ohlcv ?? [])].sort(
              (a, b) =>
                new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
            );
            if (!sorted.length) return null;
            const first = sorted[0];
            const last = sorted[sorted.length - 1];
            const price = last.close;
            const changePct =
              first.close !== 0
                ? ((last.close - first.close) / first.close) * 100
                : 0;
            return { symbol: s.asset_id, name: s.name, price, changePct };
          })
          .filter(Boolean) as AssetRow[];

        setRows(built);
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          setError((err as Error)?.message ?? 'Failed to load data');
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [listMode]);

  // ── Build rows from watchlist OHLCV ──────────────────────────────────
  useEffect(() => {
    if (listMode !== 'Watchlist' || !activeWatchlist) {
      if (listMode === 'Watchlist') setRows([]);
      return;
    }

    const tickers = activeWatchlist.asset_tickers;
    if (!tickers.length) {
      setRows([]);
      return;
    }

    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch OHLCV for all watchlist assets
        const tickerList = tickers.map((t) => t.ticker).join(',');
        const res = await fetch(
          `${API_BASE}/api/product/markets/graph-data?range=1d&tickers=${tickerList}`,
          { signal: ac.signal }
        );

        if (res.ok) {
          const json = (await res.json()) as MarketGraphResponse;
          const allSeries = [...(json.crypto ?? []), ...(json.us_stock ?? [])];

          const built: AssetRow[] = tickers
            .map((t): AssetRow | null => {
              const series = allSeries.find((s) => s.asset_id === t.ticker);
              if (!series?.ohlcv?.length)
                return { symbol: t.ticker, name: t.name, price: 0, changePct: 0 };
              const sorted = [...series.ohlcv].sort(
                (a, b) =>
                  new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
              );
              const first = sorted[0];
              const last = sorted[sorted.length - 1];
              const price = last.close;
              const changePct =
                first.close !== 0
                  ? ((last.close - first.close) / first.close) * 100
                  : 0;
              return { symbol: t.ticker, name: t.name, price, changePct };
            })
            .filter(Boolean) as AssetRow[];

          setRows(built);
        } else {
          // Fallback: show assets without prices
          setRows(
            tickers.map((t) => ({
              symbol: t.ticker,
              name: t.name,
              price: 0,
              changePct: 0,
            }))
          );
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          setRows(
            tickers.map((t) => ({
              symbol: t.ticker,
              name: t.name,
              price: 0,
              changePct: 0,
            }))
          );
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [listMode, activeWatchlist]);

  // ── Refresh live prices from Coinbase ─────────────────────────────────
  useEffect(() => {
    if (!rows.length) return;
    // Only poll for crypto (Top Assets / Watchlist) - skip US Stock
    if (listMode === 'US Stock') return;

    const refresh = async () => {
      const entries = await Promise.all(
        rows.map(async (r) => {
          const price = await fetchCoinbasePrice(r.symbol);
          return price !== null ? [r.symbol, price] : null;
        })
      );
      const map: Record<string, number> = {};
      entries.forEach((e) => {
        if (e) map[e[0] as string] = e[1] as number;
      });
      setLivePrices(map);
    };

    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [rows, listMode]);

  // ── Watchlist selector (if multiple watchlists) ───────────────────────
  const renderWatchlistSelector = () => {
    if (!watchlists || watchlists.length <= 1) return null;
    return (
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={watchlists}
        keyExtractor={(w) => String(w.id)}
        style={{ marginBottom: 8 }}
        contentContainerStyle={{ gap: 6, paddingHorizontal: 2 }}
        renderItem={({ item: w }) => {
          const isActive =
            activeWatchlist?.id === w.id ||
            (activeWatchlistId === null && w.is_default);
          return (
            <TouchableOpacity
              style={[s.wlTab, isActive && s.wlTabActive]}
              onPress={() => setActiveWatchlistId(w.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[s.wlTabText, isActive && s.wlTabTextActive]}
                numberOfLines={1}
              >
                {w.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    );
  };

  // ── Row renderer ──────────────────────────────────────────────────────
  const renderRow = useCallback(
    ({ item, index }: { item: AssetRow; index: number }) => {
      const livePrice = livePrices[item.symbol];
      const displayPrice = livePrice ?? item.price;
      const isUp = item.changePct >= 0;
      const changeColor = isUp
        ? WatchlistColors.tickerUp[dark ? 'dark' : 'light']
        : WatchlistColors.tickerDown[dark ? 'dark' : 'light'];

      return (
        <View style={s.assetRow}>
          <Text style={s.rank}>{index + 1}</Text>
          <AssetAvatar symbol={item.symbol} dark={dark} />
          <View style={s.nameCol}>
            <Text style={s.assetSymbol} numberOfLines={1}>
              {item.symbol.replace(/-USD$/, '')}
            </Text>
            {item.name ? (
              <Text style={s.assetName} numberOfLines={1}>
                {item.name}
              </Text>
            ) : null}
          </View>
          <View style={s.priceCol}>
            <Text style={s.assetPrice} numberOfLines={1}>
              {displayPrice > 0 ? formatPrice(displayPrice) : '—'}
            </Text>
            <Text style={[s.assetChange, { color: changeColor }]}>
              {isUp ? '+' : ''}
              {item.changePct.toFixed(2)}%
            </Text>
          </View>
        </View>
      );
    },
    [livePrices, dark, s]
  );

  // ── Body content ──────────────────────────────────────────────────────
  const renderBody = () => {
    if (listMode === 'Watchlist' && !user) {
      return (
        <View style={s.centered}>
          <Text style={s.emptyTitle}>Sign in to view your watchlists</Text>
          <Text style={s.emptySubtitle}>
            Track your favorite assets across sessions.
          </Text>
        </View>
      );
    }

    if (loading || (listMode === 'Watchlist' && watchlistsLoading)) {
      return (
        <View style={s.centered}>
          <ActivityIndicator size="small" color={WatchlistColors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={s.centered}>
          <Text style={s.errorText}>{error}</Text>
        </View>
      );
    }

    if (
      listMode === 'Watchlist' &&
      activeWatchlist &&
      activeWatchlist.asset_tickers.length === 0
    ) {
      return (
        <View style={s.centered}>
          <Text style={s.emptyTitle}>No assets in this watchlist</Text>
          <Text style={s.emptySubtitle}>
            Add assets from the Watchlists tab.
          </Text>
        </View>
      );
    }

    if (!rows.length) {
      return (
        <View style={s.centered}>
          <Text style={s.emptySubtitle}>No data available.</Text>
        </View>
      );
    }

    return (
      <>
        {listMode === 'Watchlist' && renderWatchlistSelector()}
        {/* Table header */}
        <View style={s.tableHeader}>
          <Text style={[s.headerCell, { width: 28 }]}>#</Text>
          <Text style={[s.headerCell, { flex: 1 }]}>Asset</Text>
          <Text style={[s.headerCell, { textAlign: 'right', width: 110 }]}>
            Price / 1D
          </Text>
        </View>
        <FlatList
          data={rows}
          keyExtractor={(r) => r.symbol}
          renderItem={renderRow}
          ItemSeparatorComponent={() => <View style={s.separator} />}
          showsVerticalScrollIndicator={false}
        />
      </>
    );
  };

  return (
    <View style={s.container}>
      {/* Mode selector */}
      <View style={s.modeRow}>
        {LIST_MODES.map((mode) => {
          const isActive = mode === listMode;
          return (
            <TouchableOpacity
              key={mode}
              style={[s.modeBtn, isActive && s.modeBtnActive]}
              onPress={() => setListMode(mode)}
              activeOpacity={0.7}
            >
              <Text
                style={[s.modeBtnText, isActive && s.modeBtnTextActive]}
              >
                {mode}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Table */}
      <View style={s.tableCard}>{renderBody()}</View>
    </View>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, gap: 8 },
    modeRow: { flexDirection: 'row', gap: 6 },
    modeBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
    },
    modeBtnActive: {
      backgroundColor: WatchlistColors.primaryMuted,
      borderColor: WatchlistColors.primary,
    },
    modeBtnText: {
      fontSize: 12,
      fontWeight: '500',
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
    },
    modeBtnTextActive: {
      color: WatchlistColors.primary,
      fontWeight: '700',
    },
    tableCard: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      backgroundColor: dark ? '#0D1117' : '#FFFFFF',
      overflow: 'hidden',
    },
    tableHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: WatchlistColors.border[dark ? 'dark' : 'light'],
    },
    headerCell: {
      fontSize: 11,
      fontWeight: '600',
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
    },
    assetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 10,
    },
    rank: {
      width: 18,
      fontSize: 11,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      textAlign: 'center',
    },
    nameCol: { flex: 1, minWidth: 0, gap: 2 },
    assetSymbol: {
      fontSize: 13,
      fontWeight: '700',
      color: dark ? '#EEEEEF' : '#111827',
    },
    assetName: {
      fontSize: 11,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
    },
    priceCol: { width: 110, alignItems: 'flex-end', gap: 2 },
    assetPrice: {
      fontSize: 13,
      fontWeight: '700',
      color: dark ? '#EEEEEF' : '#111827',
    },
    assetChange: { fontSize: 11, fontWeight: '600' },
    separator: {
      height: 1,
      backgroundColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      marginHorizontal: 12,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: dark ? '#EEEEEF' : '#111827',
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 12,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      textAlign: 'center',
    },
    errorText: {
      fontSize: 12,
      color: dark ? '#FA3364' : '#DC2626',
      textAlign: 'center',
    },
    wlTab: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
    },
    wlTabActive: {
      backgroundColor: WatchlistColors.primaryMuted,
      borderColor: WatchlistColors.primary,
    },
    wlTabText: {
      fontSize: 11,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      fontWeight: '500',
    },
    wlTabTextActive: {
      color: WatchlistColors.primary,
      fontWeight: '700',
    },
  });
