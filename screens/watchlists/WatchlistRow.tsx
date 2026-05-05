// import React, { useEffect, useRef, useState } from 'react';
// import { useColorScheme } from '@/hooks/use-color-scheme';
// import {
//   View,
//   Text,
//   Animated,
//   Image,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   useWindowDimensions,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { WatchlistColors } from '@/constants/theme';
// import { Row } from '@/types/watchlist';
// import { usePriceFlash } from '@/hooks/usePriceFlash';

// interface WatchlistRowProps {
//   item: Row;
//   index: number;
//   onDelete: (ticker: string) => void;
//   isDeleting: boolean;
//   isWide?: boolean;
// }

// function formatPrice(price: number): string {
//   if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
//   if (price >= 1) return `$${price.toFixed(2)}`;
//   if (price >= 0.01) return `$${price.toFixed(4)}`;
//   return `$${price.toFixed(6)}`;
// }

// function formatPct(pct: number): string {
//   const sign = pct >= 0 ? '+' : '';
//   return `${sign}${pct.toFixed(2)}%`;
// }

// function AssetLogo({ ticker }: { ticker: string }) {
//   const [errored, setErrored] = useState(false);
//   const uri = `https://assets.coincap.io/assets/icons/${ticker.toLowerCase()}@2x.png`;

//   if (errored) {
//     return (
//       <View style={styles.logoFallback}>
//         <Text style={styles.logoFallbackText}>{ticker.slice(0, 2).toUpperCase()}</Text>
//       </View>
//     );
//   }

//   return (
//     <Image
//       source={{ uri }}
//       style={styles.logo}
//       onError={() => setErrored(true)}
//     />
//   );
// }

// export default function WatchlistRow({ item, index, onDelete, isDeleting, isWide = false }: WatchlistRowProps) {
//   const dark = useColorScheme() === 'dark';
//   const { width } = useWindowDimensions();
//   // On narrow screens hide the ticker badge to reclaim space
//   const showBadge = width >= 360;
//   const s = makeStyles(dark);

//   const isUp = item.changePct >= 0;
//   const pctColor = isUp
//     ? WatchlistColors.tickerUp[dark ? 'dark' : 'light']
//     : WatchlistColors.tickerDown[dark ? 'dark' : 'light'];

//   // Staggered pop-in on mount (AOS-equivalent: fade-up per row)
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(14)).current;
//   useEffect(() => {
//     const delay = Math.min(index * 55, 330); // stagger up to 6 rows, cap beyond that
//     Animated.parallel([
//       Animated.timing(fadeAnim, { toValue: 1, duration: 320, delay, useNativeDriver: true }),
//       Animated.timing(slideAnim, { toValue: 0, duration: 320, delay, useNativeDriver: true }),
//     ]).start();
//   }, []);

//   // Price flash animation — port of SentimentX's PriceColorPulse / useColorPulse
//   const { progress: priceProgress, dir: priceDir } = usePriceFlash(item.price);
//   const normalColor = dark ? '#EEEEEF' : '#111827';
//   const flashColor = priceProgress.interpolate({
//     inputRange: [0, 1],
//     outputRange:
//       priceDir === 'up'
//         ? [normalColor, WatchlistColors.tickerUp[dark ? 'dark' : 'light']]
//         : priceDir === 'down'
//         ? [normalColor, WatchlistColors.tickerDown[dark ? 'dark' : 'light']]
//         : [normalColor, normalColor],
//   });

//   return (
//     <Animated.View style={[s.row, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
//       <Text style={s.index}>{index + 1}</Text>

//       <View style={s.assetCell}>
//         <AssetLogo ticker={item.ticker} />
//         <View style={s.assetInfo}>
//           <Text style={s.assetName} numberOfLines={1}>
//             {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
//           </Text>
//           {showBadge && (
//             <View style={s.tickerBadge}>
//               <Text style={s.tickerText}>{item.ticker.toUpperCase()}</Text>
//             </View>
//           )}
//         </View>
//       </View>

//       {isWide && (
//         <Text style={s.ohlcCell}>{formatPrice(item.open24h)}</Text>
//       )}
//       {isWide && (
//         <Text style={[s.ohlcCell, { color: WatchlistColors.tickerUp[dark ? 'dark' : 'light'] }]}>
//           {formatPrice(item.high24h)}
//         </Text>
//       )}
//       {isWide && (
//         <Text style={[s.ohlcCell, { color: WatchlistColors.tickerDown[dark ? 'dark' : 'light'] }]}>
//           {formatPrice(item.low24h)}
//         </Text>
//       )}

//       <View style={s.priceCell}>
//         <Animated.Text style={[s.price, { color: flashColor }]}>
//           {formatPrice(item.price)}
//         </Animated.Text>
//         <Text style={[s.changePct, { color: pctColor }]}>{formatPct(item.changePct)}</Text>
//       </View>

//       <TouchableOpacity
//         onPress={() => onDelete(item.ticker)}
//         disabled={isDeleting}
//         style={s.deleteBtn}
//         hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//       >
//         {isDeleting ? (
//           <ActivityIndicator size={16} color={WatchlistColors.deleteRed} />
//         ) : (
//           <Ionicons name="trash-outline" size={18} color={WatchlistColors.deleteRed} />
//         )}
//       </TouchableOpacity>
//     </Animated.View>
//   );
// }

// const styles = StyleSheet.create({
//   logo: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//   },
//   logoFallback: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: WatchlistColors.primaryMuted,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   logoFallbackText: {
//     fontSize: 10,
//     fontWeight: '700',
//     color: WatchlistColors.primary,
//   },
// });

// const makeStyles = (dark: boolean) =>
//   StyleSheet.create({
//     row: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       paddingHorizontal: 16,
//       paddingVertical: 12,
//       borderBottomWidth: StyleSheet.hairlineWidth,
//       borderBottomColor: WatchlistColors.border[dark ? 'dark' : 'light'],
//       backgroundColor: WatchlistColors.surface[dark ? 'dark' : 'light'],
//     },
//     index: {
//       width: 24,
//       fontSize: 12,
//       color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
//       marginRight: 8,
//     },
//     assetCell: {
//       flex: 1,
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: 10,
//     },
//     assetInfo: {
//       flex: 1,
//     },
//     assetName: {
//       fontSize: 14,
//       fontWeight: '600',
//       color: dark ? '#EEEEEF' : '#111827',
//       marginBottom: 2,
//     },
//     tickerBadge: {
//       alignSelf: 'flex-start',
//       borderWidth: 1,
//       borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
//       borderRadius: 4,
//       paddingHorizontal: 5,
//       paddingVertical: 1,
//     },
//     tickerText: {
//       fontSize: 10,
//       color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
//       fontWeight: '500',
//     },
//     ohlcCell: {
//       width: 80,
//       textAlign: 'right',
//       fontSize: 13,
//       fontWeight: '500',
//       color: dark ? '#EEEEEF' : '#111827',
//       marginRight: 4,
//     },
//     priceCell: {
//       alignItems: 'flex-end',
//       marginRight: 12,
//     },
//     price: {
//       fontSize: 14,
//       fontWeight: '600',
//     },
//     changePct: {
//       fontSize: 12,
//       fontWeight: '600',
//       marginTop: 2,
//     },
//     deleteBtn: {
//       width: 32,
//       alignItems: 'center',
//       justifyContent: 'center',
//     },
//   });
import { WatchlistColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePriceFlash } from '@/hooks/usePriceFlash';
import { Row } from '@/types/watchlist';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { Platform } from 'react-native';

const CandlestickChart =
  Platform.OS === 'web'
    ? null
    : require('react-native-wagmi-charts').CandlestickChart;

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
    <Image source={{ uri }} style={styles.logo} onError={() => setErrored(true)} />
  );
}

// ── Mini sparkline ──────────────────────────────────────────────────────────
function MiniSparkline({ series, isUp }: { series: { close: number }[]; isUp: boolean }) {
  const W = 60, H = 28;
  if (!series || series.length < 2) {
    return <View style={{ width: W, height: H }} />;
  }
  const prices = series.map(p => p.close);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const points = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * W;
    const y = H - ((p - min) / range) * H;
    return `${x},${y}`;
  }).join(' ');
  const color = isUp ? '#00E5A0' : '#FF3B30';
  return (
    <Svg width={W} height={H}>
      <Polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}

// ── Detail Modal ────────────────────────────────────────────────────────────
function DetailModal({ item, visible, onClose, dark }: {
  item: Row; visible: boolean; onClose: () => void; dark: boolean;
}) {
  const isUp = item.changePct >= 0;
  const pctColor = isUp ? WatchlistColors.tickerUp[dark ? 'dark' : 'light'] : WatchlistColors.tickerDown[dark ? 'dark' : 'light'];
  const bg = dark ? '#0D1117' : '#FFFFFF';
  const textMain = dark ? '#EEEEEF' : '#111827';
  const textSub = dark ? '#AEB0B4' : '#4B5563';
  const border = dark ? '#1F2937' : '#E5E7EB';

  // Full-size sparkline
  const W = 300, H = 120;
  const prices = item.series?.map(p => p.close) ?? [];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const points = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * W;
    const y = H - ((p - min) / range) * H;
    return `${x},${y}`;
  }).join(' ');
  const lineColor = isUp ? '#00E5A0' : '#FF3B30';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={dmStyles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={[dmStyles.sheet, { backgroundColor: bg }]}>
        {/* Handle */}
        <View style={dmStyles.handleRow}>
          <View style={[dmStyles.handle, { backgroundColor: border }]} />
        </View>

        {/* Header */}
        <View style={[dmStyles.header, { borderBottomColor: border }]}>
          <View style={dmStyles.headerLeft}>
            <AssetLogo ticker={item.ticker} />
            <View>
              <Text style={[dmStyles.name, { color: textMain }]}>{item.name}</Text>
              <Text style={[dmStyles.ticker, { color: textSub }]}>{item.ticker.toUpperCase()}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={20} color={textSub} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={dmStyles.body}>
          {/* Price */}
          <Text style={[dmStyles.price, { color: textMain }]}>{formatPrice(item.price)}</Text>
          <Text style={[dmStyles.pct, { color: pctColor }]}>{formatPct(item.changePct)} (24h)</Text>

          {/* Candlestick chart */}
          {item.series && item.series.length >= 2 && (
            <View style={[dmStyles.chartWrap, { borderColor: border }]}>
              {CandlestickChart ? (
                <CandlestickChart.Provider
                  data={item.series.map(p => ({
                    timestamp: new Date(p.datetime).getTime(),
                    open: p.open,
                    high: p.high ?? p.close,
                    low: p.low ?? p.close,
                    close: p.close,
                  }))}
                >
                  <CandlestickChart height={160} width={300}>
                    <CandlestickChart.Candles />
                    <CandlestickChart.Crosshair>
                      <CandlestickChart.Tooltip />
                    </CandlestickChart.Crosshair>
                  </CandlestickChart>
                </CandlestickChart.Provider>
              ) : (
                <Text style={{ color: textSub }}>Chart preview is unavailable on web.</Text>
              )}
            </View>
          )}

          {/* OHLC stats */}
          <View style={[dmStyles.statsGrid, { borderColor: border }]}>
            {[
              { label: 'Open', value: formatPrice(item.open24h) },
              { label: 'High', value: formatPrice(item.high24h), color: WatchlistColors.tickerUp[dark ? 'dark' : 'light'] },
              { label: 'Low', value: formatPrice(item.low24h), color: WatchlistColors.tickerDown[dark ? 'dark' : 'light'] },
              { label: 'Prev Close', value: formatPrice(item.prevClose) },
            ].map(stat => (
              <View key={stat.label} style={[dmStyles.statItem, { borderColor: border }]}>
                <Text style={[dmStyles.statLabel, { color: textSub }]}>{stat.label}</Text>
                <Text style={[dmStyles.statValue, { color: stat.color ?? textMain }]}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const dmStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40, maxHeight: '80%' },
  handleRow: { paddingTop: 10, paddingBottom: 4, alignItems: 'center' },
  handle: { width: 40, height: 4, borderRadius: 999 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { fontSize: 16, fontWeight: '700' },
  ticker: { fontSize: 12, marginTop: 2 },
  body: { padding: 16, gap: 12 },
  price: { fontSize: 28, fontWeight: '800' },
  pct: { fontSize: 14, fontWeight: '600' },
  chartWrap: { borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  statItem: { width: '50%', padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderRightWidth: StyleSheet.hairlineWidth },
  statLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  statValue: { fontSize: 14, fontWeight: '700' },
});

// ── Main Row ─────────────────────────────────────────────────────────────────
export default function WatchlistRow({ item, index, onDelete, isDeleting, isWide = false }: WatchlistRowProps) {
  const dark = useColorScheme() === 'dark';
  const { width } = useWindowDimensions();
  const showBadge = width >= 360;
  const s = makeStyles(dark);
  const [modalVisible, setModalVisible] = useState(false);

  const isUp = item.changePct >= 0;
  const pctColor = isUp
    ? WatchlistColors.tickerUp[dark ? 'dark' : 'light']
    : WatchlistColors.tickerDown[dark ? 'dark' : 'light'];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    const delay = Math.min(index * 55, 330);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 320, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 320, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const { progress: priceProgress, dir: priceDir } = usePriceFlash(item.price);
  const normalColor = dark ? '#EEEEEF' : '#111827';
  const flashColor = priceProgress.interpolate({
    inputRange: [0, 1],
    outputRange:
      priceDir === 'up'
        ? [normalColor, WatchlistColors.tickerUp[dark ? 'dark' : 'light']]
        : priceDir === 'down'
        ? [normalColor, WatchlistColors.tickerDown[dark ? 'dark' : 'light']]
        : [normalColor, normalColor],
  });

  return (
    <>
      <Animated.View style={[s.row, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
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

        {/* Sparkline — tap to open detail modal */}
        <TouchableOpacity onPress={() => setModalVisible(true)} style={s.sparklineBtn}>
          <MiniSparkline series={item.series} isUp={isUp} />
        </TouchableOpacity>

        <View style={s.priceCell}>
          <Animated.Text style={[s.price, { color: flashColor }]}>
            {formatPrice(item.price)}
          </Animated.Text>
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
      </Animated.View>

      <DetailModal
        item={item}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        dark={dark}
      />
    </>
  );
}

const styles = StyleSheet.create({
  logo: { width: 32, height: 32, borderRadius: 16 },
  logoFallback: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: WatchlistColors.primaryMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  logoFallbackText: { fontSize: 10, fontWeight: '700', color: WatchlistColors.primary },
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
      width: 24, fontSize: 12,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      marginRight: 8,
    },
    assetCell: {
      flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    },
    assetInfo: { flex: 1 },
    assetName: {
      fontSize: 14, fontWeight: '600',
      color: dark ? '#EEEEEF' : '#111827', marginBottom: 2,
    },
    tickerBadge: {
      alignSelf: 'flex-start', borderWidth: 1,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1,
    },
    tickerText: {
      fontSize: 10,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      fontWeight: '500',
    },
    sparklineBtn: { marginHorizontal: 8 },
    priceCell: { alignItems: 'flex-end', marginRight: 12 },
    price: { fontSize: 14, fontWeight: '600' },
    changePct: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    deleteBtn: { width: 32, alignItems: 'center', justifyContent: 'center' },
  });
