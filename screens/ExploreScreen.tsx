import { WatchlistColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMarketData } from '@/hooks/useMarketData';
import { useWatchlists } from '@/hooks/useWatchlists';
import { Watchlist } from '@/types/watchlist';
import { watchlistApi } from '@/utils/watchlistApi';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const CandlestickChart =
  Platform.OS === 'web'
    ? null
    : require('react-native-wagmi-charts').CandlestickChart;

const UP = WatchlistColors.tickerUp;
const DOWN = WatchlistColors.tickerDown;

function deltaColor(up: boolean, dark: boolean) {
  return up ? UP[dark ? 'dark' : 'light'] : DOWN[dark ? 'dark' : 'light'];
}

// ─── LIVE CRYPTO BOARD ───────────────────────────────────────────────────────

const TICKERS = [
  { id: 'BTC',  price: '$68,420', change: '+2.3%',  up: true  },
  { id: 'ETH',  price: '$3,580',  change: '+1.8%',  up: true  },
  { id: 'USDT', price: '$1.00',   change: '+0.01%', up: true  },
  { id: 'XRP',  price: '$0.582',  change: '-0.5%',  up: false },
  { id: 'SOL',  price: '$142.30', change: '+4.2%',  up: true  },
  { id: 'USDC', price: '$1.00',   change: '+0.02%', up: true  },
  { id: 'DOGE', price: '$0.124',  change: '+8.1%',  up: true  },
  { id: 'LINK', price: '$18.45',  change: '-1.2%',  up: false },
];

const CARD_W  = 158;
const CARD_MR = 8;
const HALF_W  = TICKERS.length * (CARD_W + CARD_MR);

function TickerCard({ item, dark }: { item: typeof TICKERS[0]; dark: boolean }) {
  const logoUri = `https://assets.coincap.io/assets/icons/${item.id.toLowerCase()}@2x.png`;
  const col = deltaColor(item.up, dark);
  const cardBg = dark ? '#111827' : '#FFFFFF';
  const border = dark ? '#1F2937' : '#E5E7EB';
  return (
    <View style={[tcStyles.card, { backgroundColor: cardBg, borderColor: border, width: CARD_W, marginRight: CARD_MR }]}>
      <Image source={{ uri: logoUri }} style={tcStyles.logo} />
      <Text style={[tcStyles.symbol, { color: dark ? '#AEB0B4' : '#4B5563' }]}>{item.id}</Text>
      <View style={tcStyles.priceRow}>
        <Text style={[tcStyles.price, { color: dark ? '#EEEEEF' : '#111827' }]}>{item.price}</Text>
        <Text style={[tcStyles.change, { color: col }]}>{item.change}</Text>
      </View>
    </View>
  );
}

const tcStyles = StyleSheet.create({
  card:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  logo:     { width: 20, height: 20, borderRadius: 10 },
  symbol:   { fontSize: 11, fontWeight: '700', width: 32 },
  priceRow: { flex: 1, alignItems: 'flex-end' },
  price:    { fontSize: 12, fontWeight: '700' },
  change:   { fontSize: 11, fontWeight: '500', marginTop: 1 },
});

export function LiveCryptoBoard({ dark }: { dark: boolean }) {
  const marquee = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(marquee, { toValue: -HALF_W, duration: 60_000, easing: Easing.linear, useNativeDriver: true }),
    );
    anim.start();
    return () => anim.stop();
  }, []);
  const doubled = [...TICKERS, ...TICKERS];
  return (
    <View style={lcbStyles.wrapper}>
      <Animated.View style={[lcbStyles.track, { transform: [{ translateX: marquee }] }]}>
        {doubled.map((item, i) => <TickerCard key={`${item.id}-${i}`} item={item} dark={dark} />)}
      </Animated.View>
    </View>
  );
}

const lcbStyles = StyleSheet.create({
  wrapper: { overflow: 'hidden', paddingVertical: 6 },
  track:   { flexDirection: 'row' },
});

// ─── MARKET OVERVIEW ─────────────────────────────────────────────────────────

function DeltaBadge({ change, up, dark }: { change: string; up: boolean; dark: boolean }) {
  const col = deltaColor(up, dark);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Ionicons name={up ? 'arrow-up' : 'arrow-down'} size={10} color={col} />
      <Text style={{ fontSize: 11, color: col, fontWeight: '600', marginLeft: 1 }}>{change}</Text>
    </View>
  );
}

function StatCard({ label, value, change, up, dark, children, index = 0 }: {
  label: string; value?: string; change?: string; up?: boolean; dark: boolean;
  children?: React.ReactNode; index?: number;
}) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  useEffect(() => {
    const delay = index * 80;
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 300, delay, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, delay, useNativeDriver: true, bounciness: 4, speed: 14 }),
    ]).start();
  }, []);
  const bg     = dark ? '#0D1117' : '#F9FAFB';
  const border = dark ? '#1F2937' : '#E5E7EB';
  return (
    <Animated.View style={[moStyles.card, { backgroundColor: bg, borderColor: border }, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <Text style={[moStyles.label, { color: dark ? '#AEB0B4' : '#4B5563' }]}>{label}</Text>
      {value ? (
        <View style={moStyles.row}>
          <Text style={[moStyles.value, { color: dark ? '#EEEEEF' : '#111827' }]}>{value}</Text>
          {change !== undefined && up !== undefined && <DeltaBadge change={change} up={up} dark={dark} />}
        </View>
      ) : null}
      {children}
    </Animated.View>
  );
}

const PLACEHOLDER_MARKET = {
  cap:    { value: '$2.85T', change: '+1.2%', up: true  },
  volume: { value: '$142B',  change: '+3.4%', up: true  },
  btcDom: { value: '54.2%', change: '+0.3%', up: true  },
  ethDom: { value: '17.1%', change: '-0.2%', up: false },
};

export function MarketOverview({ dark }: { dark: boolean }) {
  const m = PLACEHOLDER_MARKET;
  return (
    <View style={moStyles.row3}>
      <StatCard index={0} label="Marketcap" value={m.cap.value}    change={m.cap.change}    up={m.cap.up}    dark={dark} />
      <StatCard index={1} label="Vol (24h)"  value={m.volume.value} change={m.volume.change} up={m.volume.up} dark={dark} />
      <StatCard index={2} label="Dominance"  dark={dark}>
        <View style={{ gap: 3, marginTop: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Image source={{ uri: 'https://assets.coincap.io/assets/icons/btc@2x.png' }} style={{ width: 12, height: 12, borderRadius: 6 }} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: dark ? '#EEEEEF' : '#111827' }}>{m.btcDom.value}</Text>
            <DeltaBadge change={m.btcDom.change} up={m.btcDom.up} dark={dark} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Image source={{ uri: 'https://assets.coincap.io/assets/icons/eth@2x.png' }} style={{ width: 12, height: 12, borderRadius: 6 }} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: dark ? '#EEEEEF' : '#111827' }}>{m.ethDom.value}</Text>
            <DeltaBadge change={m.ethDom.change} up={m.ethDom.up} dark={dark} />
          </View>
        </View>
      </StatCard>
    </View>
  );
}

const moStyles = StyleSheet.create({
  row3:  { flexDirection: 'row', gap: 6 },
  card:  { flex: 1, borderRadius: 10, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 7 },
  label: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },
  row:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  value: { fontSize: 14, fontWeight: '700' },
});

// ─── ADD TO WATCHLIST MODAL ──────────────────────────────────────────────────

function AddToWatchlistModal({ visible, onClose, dark, ticker, name }: {
  visible: boolean; onClose: () => void; dark: boolean; ticker: string; name: string;
}) {
  const { user } = useAuth();
  const { watchlists } = useWatchlists();
  const [adding, setAdding] = useState<number | null>(null);
  const [added, setAdded] = useState<Set<number>>(new Set());

  const sheetBg  = dark ? '#0D1117' : '#FFFFFF';
  const textMain = dark ? '#EEEEEF' : '#111827';
  const textSub  = dark ? '#AEB0B4' : '#4B5563';
  const border   = dark ? '#1F2937' : '#E5E7EB';

  const handleAdd = async (watchlist: Watchlist) => {
    if (added.has(watchlist.id)) return;
    setAdding(watchlist.id);
    const result = await watchlistApi.addAssetsBatch(watchlist.id, [{ ticker, name }]);
    setAdding(null);
    if (result.ok) setAdded(prev => new Set(prev).add(watchlist.id));
  };

  const handleClose = () => { setAdded(new Set()); onClose(); };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' }} />
      </TouchableWithoutFeedback>
      <View style={[wlStyles.sheet, { backgroundColor: sheetBg }]}>
        <View style={wlStyles.handleRow}>
          <View style={[wlStyles.handle, { backgroundColor: dark ? '#374151' : '#D1D5DB' }]} />
        </View>
        <View style={[wlStyles.header, { borderBottomColor: border }]}>
          <View>
            <Text style={[wlStyles.title, { color: textMain }]}>Add to Watchlist</Text>
            <Text style={[wlStyles.subtitle, { color: textSub }]}>{name} ({ticker.toUpperCase()})</Text>
          </View>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={20} color={textSub} />
          </TouchableOpacity>
        </View>
        {!user ? (
          <View style={wlStyles.emptyState}>
            <Ionicons name="lock-closed-outline" size={36} color={textSub} />
            <Text style={[wlStyles.emptyText, { color: textSub }]}>Sign in to use watchlists</Text>
          </View>
        ) : !watchlists || watchlists.length === 0 ? (
          <View style={wlStyles.emptyState}>
            <Ionicons name="bookmark-outline" size={36} color={textSub} />
            <Text style={[wlStyles.emptyText, { color: textSub }]}>No watchlists yet</Text>
          </View>
        ) : (
          <ScrollView style={{ maxHeight: 320 }}>
            {watchlists.map((wl) => {
              const isAlready = wl.asset_tickers.some(t => t.ticker.toLowerCase() === ticker.toLowerCase());
              const isAdded = added.has(wl.id);
              const isAdding = adding === wl.id;
              return (
                <TouchableOpacity
                  key={wl.id}
                  onPress={() => !isAlready && !isAdded && handleAdd(wl)}
                  disabled={isAlready || isAdded || isAdding}
                  style={[wlStyles.row, { borderBottomColor: border }]}
                  activeOpacity={0.7}
                >
                  <View style={[wlStyles.iconWrap, { backgroundColor: `${WatchlistColors.primary}20` }]}>
                    <Ionicons name="bookmark" size={16} color={WatchlistColors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[wlStyles.wlName, { color: textMain }]}>{wl.name}</Text>
                    <Text style={[wlStyles.wlCount, { color: textSub }]}>{wl.assets_count} assets</Text>
                  </View>
                  {isAdding ? (
                    <ActivityIndicator size="small" color={WatchlistColors.primary} />
                  ) : isAlready || isAdded ? (
                    <View style={wlStyles.addedBadge}>
                      <Text style={wlStyles.addedText}>{isAlready ? 'Already added' : 'Added ✓'}</Text>
                    </View>
                  ) : (
                    <Ionicons name="add-circle-outline" size={22} color={WatchlistColors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const wlStyles = StyleSheet.create({
  sheet:      { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 24 },
  handleRow:  { paddingTop: 10, paddingBottom: 4, alignItems: 'center' },
  handle:     { width: 40, height: 4, borderRadius: 999 },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  title:      { fontSize: 16, fontWeight: '700' },
  subtitle:   { fontSize: 12, marginTop: 2 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 12 },
  emptyText:  { fontSize: 14 },
  row:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  iconWrap:   { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  wlName:     { fontSize: 14, fontWeight: '600' },
  wlCount:    { fontSize: 12, marginTop: 2 },
  addedBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: `${WatchlistColors.primary}20` },
  addedText:  { fontSize: 11, fontWeight: '600', color: WatchlistColors.primary },
});

// ─── ASSET DETAIL MODAL (Candlestick) ────────────────────────────────────────

function AssetDetailModal({ visible, onClose, dark, ticker, name }: {
  visible: boolean; onClose: () => void; dark: boolean; ticker: string; name: string;
}) {
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const bg = dark ? '#0D1117' : '#FFFFFF';
  const textMain = dark ? '#EEEEEF' : '#111827';
  const textSub = dark ? '#AEB0B4' : '#4B5563';
  const border = dark ? '#1F2937' : '#E5E7EB';

  useEffect(() => {
    if (!visible || !ticker) return;
    setLoading(true);
    setSeries([]);
    watchlistApi.fetchOHLCV([ticker])
      .then(result => {
        if (result.ok && result.data?.data?.[0]?.price_data?.['1d']) {
          setSeries(result.data.data[0].price_data['1d']);
        }
      })
      .finally(() => setLoading(false));
  }, [visible, ticker]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' }} />
      </TouchableWithoutFeedback>
      <View style={[adStyles.sheet, { backgroundColor: bg }]}>
        <View style={adStyles.handleRow}>
          <View style={[adStyles.handle, { backgroundColor: border }]} />
        </View>
        <View style={[adStyles.header, { borderBottomColor: border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image
              source={{ uri: `https://assets.coincap.io/assets/icons/${ticker.toLowerCase()}@2x.png` }}
              style={{ width: 32, height: 32, borderRadius: 16 }}
            />
            <View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: textMain }}>{name}</Text>
              <Text style={{ fontSize: 12, color: textSub }}>{ticker.toUpperCase()}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={20} color={textSub} />
          </TouchableOpacity>
        </View>
        <View style={{ padding: 16, alignItems: 'center' }}>
          {loading ? (
            <ActivityIndicator size="large" color={WatchlistColors.primary} style={{ marginTop: 40 }} />
          ) : series.length >= 2 ? (
            CandlestickChart ? (
              <CandlestickChart.Provider
                data={series.map(p => ({
                  timestamp: new Date(p.datetime).getTime(),
                  open: p.open,
                  high: p.high,
                  low: p.low,
                  close: p.close,
                }))}
              >
                <CandlestickChart height={200} width={320}>
                  <CandlestickChart.Candles />
                  <CandlestickChart.Crosshair>
                    <CandlestickChart.Tooltip />
                  </CandlestickChart.Crosshair>
                </CandlestickChart>
              </CandlestickChart.Provider>
            ) : (
              <Text style={{ color: textSub, marginTop: 40 }}>Chart preview is unavailable on web.</Text>
            )
          ) : (
            <Text style={{ color: textSub, marginTop: 40 }}>No chart data available.</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const adStyles = StyleSheet.create({
  sheet:     { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 24 },
  handleRow: { paddingTop: 10, paddingBottom: 4, alignItems: 'center' },
  handle:    { width: 40, height: 4, borderRadius: 999 },
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
});

// ─── ASSETS SECTION (Real Data) ──────────────────────────────────────────────

function RealAssetRow({ item, index, dark, onAddToWatchlist, onPress }: {
  item: { symbol: string; name?: string; price: number; changePct: number };
  index: number;
  dark: boolean;
  onAddToWatchlist: (ticker: string, name: string) => void;
  onPress: (ticker: string, name: string) => void;
}) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    const delay = Math.min(index * 45, 300);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 300, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const surface = dark ? '#111827' : '#FFFFFF';
  const border  = dark ? '#1F2937' : '#E5E7EB';
  const isUp    = item.changePct >= 0;
  const col     = deltaColor(isUp, dark);
  const cleanSymbol = item.symbol.replace(/-USD$/, '').toLowerCase();
  const uri = `https://assets.coincap.io/assets/icons/${cleanSymbol}@2x.png`;
  const priceStr = item.price < 1
    ? `$${item.price.toFixed(6)}`
    : `$${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const changeStr = `${isUp ? '+' : ''}${item.changePct.toFixed(2)}%`;

  return (
    <TouchableOpacity onPress={() => onPress(item.symbol.replace(/-USD$/, ''), item.name ?? item.symbol)} activeOpacity={0.7}>
      <Animated.View style={[asStyles.row, { backgroundColor: surface, borderBottomColor: border }, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={[asStyles.num, { color: dark ? '#AEB0B4' : '#4B5563' }]}>{index + 1}</Text>
        <Image source={{ uri }} style={asStyles.logo} />
        <View style={asStyles.nameCol}>
          <Text style={[asStyles.name, { color: dark ? '#EEEEEF' : '#111827' }]}>{item.name ?? item.symbol}</Text>
          <Text style={[asStyles.ticker, { color: dark ? '#AEB0B4' : '#4B5563' }]}>{item.symbol.toUpperCase()}</Text>
        </View>
        <View style={asStyles.priceCol}>
          <Text style={[asStyles.price, { color: dark ? '#EEEEEF' : '#111827' }]}>{priceStr}</Text>
          <Text style={[asStyles.change, { color: col }]}>{changeStr}</Text>
        </View>
        <TouchableOpacity
          onPress={() => onAddToWatchlist(item.symbol.replace(/-USD$/, ''), item.name ?? item.symbol)}
          style={asStyles.addBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={22} color={WatchlistColors.primary} />
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
  );
}

const asStyles = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  num:      { width: 22, fontSize: 12 },
  logo:     { width: 32, height: 32, borderRadius: 16, marginHorizontal: 8 },
  nameCol:  { flex: 1 },
  name:     { fontSize: 14, fontWeight: '600' },
  ticker:   { fontSize: 11, marginTop: 1 },
  priceCol: { alignItems: 'flex-end' },
  price:    { fontSize: 14, fontWeight: '600' },
  change:   { fontSize: 12, fontWeight: '600', marginTop: 2 },
  addBtn:   { paddingLeft: 8, paddingVertical: 4 },
});

export function AssetsSection({ dark }: { dark: boolean }) {
  const { rows, isLoading, error } = useMarketData('1d');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [chartVisible, setChartVisible] = useState(false);
  const [chartTicker, setChartTicker] = useState('');
  const [chartName, setChartName] = useState('');

  const hdr     = dark ? '#0D1117' : '#F3F4F6';
  const hdrText = dark ? '#AEB0B4' : '#4B5563';

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={WatchlistColors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: dark ? '#AEB0B4' : '#4B5563' }}>Failed to load assets.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView>
        <View style={[asStyles.row, { backgroundColor: hdr, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: dark ? '#1F2937' : '#E5E7EB' }]}>
          <Text style={{ width: 22, fontSize: 11, fontWeight: '700', color: hdrText, textTransform: 'uppercase', letterSpacing: 0.4 }}>#</Text>
          <View style={{ width: 32 + 16 }} />
          <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: hdrText, textTransform: 'uppercase', letterSpacing: 0.4 }}>Asset</Text>
          <Text style={{ fontSize: 11, fontWeight: '700', color: hdrText, textTransform: 'uppercase', letterSpacing: 0.4 }}>Price / 24h</Text>
          <View style={{ width: 30 }} />
        </View>
        {rows.map((a, i) => (
          <RealAssetRow
            key={a.symbol}
            item={a}
            index={i}
            dark={dark}
            onAddToWatchlist={(ticker, name) => {
              setSelectedTicker(ticker);
              setSelectedName(name);
              setModalVisible(true);
            }}
            onPress={(ticker, name) => {
              setChartTicker(ticker);
              setChartName(name);
              setChartVisible(true);
            }}
          />
        ))}
      </ScrollView>
      <AddToWatchlistModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        dark={dark}
        ticker={selectedTicker}
        name={selectedName}
      />
      <AssetDetailModal
        visible={chartVisible}
        onClose={() => setChartVisible(false)}
        dark={dark}
        ticker={chartTicker}
        name={chartName}
      />
    </>
  );
}

// ─── NEWS DETAIL MODAL ───────────────────────────────────────────────────────

interface NewsItem {
  id: number;
  title: string;
  url: string;
  image_url: string;
  publisher: string;
  published_at: string;
  summary: string;
  naive_class: -1 | 0 | 1;
  takeaways: string[];
  tags: string[];
  sources: string[];
}

function NewsDetailModal({ item, visible, onClose, dark }: {
  item: NewsItem | null; visible: boolean; onClose: () => void; dark: boolean;
}) {
  const slideAnim = useRef(new Animated.Value(800)).current;
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 0, speed: 18 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: 800, duration: 260, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!item) return null;

  const accent   = item.naive_class === 1 ? UP[dark ? 'dark' : 'light'] : item.naive_class === -1 ? DOWN[dark ? 'dark' : 'light'] : '#B45309';
  const sheetBg  = dark ? '#0D1117' : '#FFFFFF';
  const surface  = dark ? '#111827' : '#F9FAFB';
  const border   = dark ? '#1F2937' : '#E5E7EB';
  const textMain = dark ? '#EEEEEF' : '#111827';
  const textSub  = dark ? '#AEB0B4' : '#4B5563';

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' }} />
      </TouchableWithoutFeedback>
      <Animated.View style={[ndStyles.sheet, { backgroundColor: sheetBg, transform: [{ translateY: slideAnim }] }]}>
        <View style={ndStyles.handleRow}>
          <View style={[ndStyles.handle, { backgroundColor: dark ? '#374151' : '#D1D5DB' }]} />
        </View>
        <TouchableOpacity onPress={onClose} style={ndStyles.closeBtn} activeOpacity={0.7}>
          <Ionicons name="close" size={20} color={textSub} />
        </TouchableOpacity>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ndStyles.scroll}>
          <View style={ndStyles.publisherRow}>
            <View style={[ndStyles.dot, { backgroundColor: accent }]} />
            <Text style={[ndStyles.publisher, { color: textSub }]}>{item.publisher}</Text>
          </View>
          <Text style={[ndStyles.title, { color: textMain }]}>{item.title}</Text>
          <Text style={[ndStyles.time, { color: textSub }]}>
            Published: {new Date(item.published_at.replace(' +0000 UTC', 'Z').replace(' ', 'T')).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
          </Text>
          {item.image_url ? <Image source={{ uri: item.image_url }} style={ndStyles.image} resizeMode="cover" /> : null}
          {item.takeaways?.length > 0 && (
            <View style={[ndStyles.section, { backgroundColor: surface, borderColor: border }]}>
              <View style={ndStyles.sectionHeader}>
                <View style={[ndStyles.accentBar, { backgroundColor: WatchlistColors.primary }]} />
                <Text style={[ndStyles.sectionTitle, { color: textMain }]}>Key Takeaways</Text>
              </View>
              {item.takeaways.map((t, i) => (
                <View key={i} style={ndStyles.takeawayRow}>
                  <View style={[ndStyles.takeawayNum, { backgroundColor: WatchlistColors.primary }]}>
                    <Text style={ndStyles.takeawayNumText}>{i + 1}</Text>
                  </View>
                  <Text style={[ndStyles.takeawayText, { color: textMain }]}>{t}</Text>
                </View>
              ))}
            </View>
          )}
          {item.summary && (
            <View style={[ndStyles.section, { backgroundColor: surface, borderColor: border }]}>
              <View style={ndStyles.sectionHeader}>
                <View style={[ndStyles.accentBar, { backgroundColor: WatchlistColors.primary }]} />
                <Text style={[ndStyles.sectionTitle, { color: textMain }]}>Summary</Text>
              </View>
              <Text style={[ndStyles.summaryText, { color: textSub }]}>{item.summary}</Text>
            </View>
          )}
          {item.tags?.length > 0 && (
            <View style={ndStyles.tagsSection}>
              <Text style={[ndStyles.sectionTitle, { color: textMain, marginBottom: 8 }]}>Related Tags</Text>
              <View style={ndStyles.tagsRow}>
                {item.tags.map((tag, i) => (
                  <View key={i} style={[ndStyles.tag, { borderColor: WatchlistColors.primary, backgroundColor: `${WatchlistColors.primary}15` }]}>
                    <Text style={[ndStyles.tagText, { color: WatchlistColors.primary }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {item.sources?.length > 0 && (
            <View style={[ndStyles.section, { backgroundColor: surface, borderColor: border }]}>
              <View style={ndStyles.sectionHeader}>
                <View style={[ndStyles.accentBar, { backgroundColor: WatchlistColors.primary }]} />
                <Text style={[ndStyles.sectionTitle, { color: textMain }]}>Reference Sources</Text>
              </View>
              {item.sources.map((src, i) => {
                const domain = src.replace(/https?:\/\//, '').split('/')[0];
                return (
                  <TouchableOpacity key={i} onPress={() => Linking.openURL(src)} style={ndStyles.sourceRow} activeOpacity={0.7}>
                    <Ionicons name="open-outline" size={14} color={WatchlistColors.primary} />
                    <Text style={[ndStyles.sourceText, { color: WatchlistColors.primary }]} numberOfLines={1}>{domain}: {src}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          <TouchableOpacity onPress={() => Linking.openURL(item.url)} style={[ndStyles.readBtn, { borderColor: WatchlistColors.primary }]} activeOpacity={0.8}>
            <Ionicons name="open-outline" size={16} color={WatchlistColors.primary} />
            <Text style={[ndStyles.readBtnText, { color: WatchlistColors.primary }]}>Read Full Article</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const ndStyles = StyleSheet.create({
  sheet:           { position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '92%', borderTopLeftRadius: 20, borderTopRightRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 24 },
  handleRow:       { paddingTop: 10, paddingBottom: 4, alignItems: 'center' },
  handle:          { width: 40, height: 4, borderRadius: 999 },
  closeBtn:        { position: 'absolute', top: 12, right: 16, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  scroll:          { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8 },
  publisherRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  dot:             { width: 8, height: 8, borderRadius: 4 },
  publisher:       { fontSize: 12, fontWeight: '600' },
  title:           { fontSize: 20, fontWeight: '700', lineHeight: 28, marginBottom: 6 },
  time:            { fontSize: 12, marginBottom: 14 },
  image:           { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },
  section:         { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 14 },
  sectionHeader:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  accentBar:       { width: 3, height: 16, borderRadius: 2 },
  sectionTitle:    { fontSize: 15, fontWeight: '700' },
  takeawayRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  takeawayNum:     { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  takeawayNumText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  takeawayText:    { flex: 1, fontSize: 13, lineHeight: 19 },
  summaryText:     { fontSize: 13, lineHeight: 20 },
  tagsSection:     { marginBottom: 14 },
  tagsRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag:             { borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  tagText:         { fontSize: 12, fontWeight: '600' },
  sourceRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  sourceText:      { fontSize: 12, flex: 1 },
  readBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderRadius: 12, paddingVertical: 14, marginTop: 4 },
  readBtnText:     { fontSize: 15, fontWeight: '700' },
});

// ─── TOP STORIES SECTION ─────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const cleaned = dateStr.replace(' +0000 UTC', 'Z').replace(' ', 'T');
  const diff = Date.now() - new Date(cleaned).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function NewsCard({ item, dark, index = 0, onPress }: {
  item: NewsItem; dark: boolean; index?: number; onPress: () => void;
}) {
  const scale     = useRef(new Animated.Value(1)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    const delay = Math.min(index * 60, 300);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 320, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 320, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  const onPressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 60, bounciness: 0 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 40, bounciness: 5 }).start();
  const surface = dark ? '#111827' : '#FFFFFF';
  const accent  = item.naive_class === 1 ? UP[dark ? 'dark' : 'light'] : item.naive_class === -1 ? DOWN[dark ? 'dark' : 'light'] : '#B45309';
  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale }, { translateY: slideAnim }] }}>
      <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1} style={[ncStyles.card, { backgroundColor: surface }]}>
        <View style={[ncStyles.accentTop, { backgroundColor: accent }]} />
        {item.image_url ? <Image source={{ uri: item.image_url }} style={ncStyles.image} resizeMode="cover" /> : null}
        <View style={ncStyles.body}>
          <Text style={[ncStyles.title, { color: dark ? '#EEEEEF' : '#111827' }]} numberOfLines={2}>{item.title}</Text>
          <View style={ncStyles.meta}>
            <Text style={[ncStyles.publisher, { color: dark ? '#AEB0B4' : '#4B5563' }]}>{item.publisher}</Text>
            <Text style={[ncStyles.time,      { color: dark ? '#AEB0B4' : '#4B5563' }]}>{timeAgo(item.published_at)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const ncStyles = StyleSheet.create({
  card:      { borderRadius: 12, marginBottom: 10, overflow: 'hidden' },
  accentTop: { height: 4 },
  image:     { height: 160, width: '100%' },
  body:      { padding: 12 },
  title:     { fontSize: 14, fontWeight: '600', lineHeight: 20, marginBottom: 8 },
  meta:      { flexDirection: 'row', justifyContent: 'space-between' },
  publisher: { fontSize: 11 },
  time:      { fontSize: 11 },
});

const TS_TAGS = [
  { id: 'regulation', label: 'Regulation' },
  { id: 'defi', label: 'DeFi' },
  { id: 'nft', label: 'NFT' },
  { id: 'market', label: 'Market' },
  { id: 'blockchain', label: 'Blockchain' },
  { id: 'adoption', label: 'Adoption' },
  { id: 'security', label: 'Security' },
  { id: 'mining', label: 'Mining' },
];

export function TopStoriesSection({ dark }: { dark: boolean }) {
  const [stories, setStories] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<NewsItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchStories = useCallback(async (keyword: string, tags: string[]) => {
    setIsLoading(true);
    try {
      let query = 'page=1';
      if (keyword) query += `&keyword=${encodeURIComponent(keyword)}`;
      if (tags.length > 0) query += `&tags=${tags.map(t => t.replace(/\s+/g, '+')).join('-')}`;
      const res = await fetch(`https://pinkpenguin.anode.news/api/news/stories?${query}`);
      const data = await res.json();
      setStories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories('', []);
  }, [fetchStories]);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchStories(text, activeTags);
    }, 400);
  };

  const toggleTag = (tagId: string) => {
    const next = activeTags.includes(tagId)
      ? activeTags.filter(t => t !== tagId)
      : activeTags.length >= 2 ? activeTags : [...activeTags, tagId];
    setActiveTags(next);
    fetchStories(search, next);
  };

  const clearFilters = () => {
    setActiveTags([]);
    setSearch('');
    fetchStories('', []);
  };

  const hasFilters = activeTags.length > 0 || search.length > 0;
  const border = dark ? '#1F2937' : '#E5E7EB';
  const textSub = dark ? '#AEB0B4' : '#4B5563';

  return (
    <>
      {/* Search bar */}
      <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: border, backgroundColor: dark ? '#0D1117' : '#FFFFFF', height: 42 }}>
          <Ionicons name="search-outline" size={16} color={textSub} style={{ marginLeft: 12 }} />
          <TextInput
            style={{ flex: 1, height: 42, paddingHorizontal: 10, fontSize: 14, color: dark ? '#EEEEEF' : '#111827' }}
            placeholder="Search news..."
            placeholderTextColor={textSub}
            value={search}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')} hitSlop={8} style={{ marginRight: 12 }}>
              <Ionicons name="close-circle" size={16} color={textSub} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tag filters */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {TS_TAGS.map(tag => {
            const isActive = activeTags.includes(tag.id);
            return (
              <TouchableOpacity
                key={tag.id}
                onPress={() => toggleTag(tag.id)}
                activeOpacity={0.7}
                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: isActive ? WatchlistColors.primary : border, backgroundColor: isActive ? WatchlistColors.primaryMuted : (dark ? '#0D1117' : '#FFFFFF') }}
              >
                <Text style={{ fontSize: 12, fontWeight: isActive ? '700' : '500', color: isActive ? WatchlistColors.primary : textSub }}>
                  {tag.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {hasFilters && (
          <TouchableOpacity onPress={clearFilters} style={{ paddingLeft: 10 }}>
            <Text style={{ fontSize: 12, color: WatchlistColors.primary, fontWeight: '600' }}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stories */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={WatchlistColors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 12 }}>
          {stories.map((s, i) => (
            <NewsCard key={s.id} item={s} index={i} dark={dark} onPress={() => { setSelectedStory(s); setModalVisible(true); }} />
          ))}
        </ScrollView>
      )}
      <NewsDetailModal item={selectedStory} visible={modalVisible} onClose={() => setModalVisible(false)} dark={dark} />
    </>
  );
}

// ─── DAILY RECAPS SECTION ────────────────────────────────────────────────────

const PLACEHOLDER_RECAPS = [
  { id: 1, date: 'Today — Apr 1, 2026', summary: 'Bitcoin broke above $68K on strong institutional inflows. Ethereum L2 TVL hit a new record. Federal Reserve signaled rate stability.', bullets: ['BTC +2.3% — record ETF inflows', 'ETH L2 TVL surpasses $45B', 'Fed holds rates, crypto reacts positively'] },
  { id: 2, date: 'Yesterday — Mar 31, 2026', summary: "Markets consolidated after last week's rally. Solana saw brief network congestion during a major NFT launch.", bullets: ['SOL congestion during Tensor launch', 'DeFi TVL steady at $180B', 'SEC reviewed new custody rules'] },
  { id: 3, date: 'Mar 30, 2026', summary: 'Positive momentum across altcoins. DOGE surged 8% on renewed retail interest. BNB dropped on regulatory concerns.', bullets: ['DOGE +8.1% on retail surge', 'BNB -2.1% amid regulatory news', 'Ripple case update: new document disclosure'] },
];

function RecapCard({ item, dark, index = 0 }: { item: typeof PLACEHOLDER_RECAPS[0]; dark: boolean; index?: number }) {
  const scale     = useRef(new Animated.Value(1)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    const delay = Math.min(index * 70, 280);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 320, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 320, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  const onPressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 60, bounciness: 0 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 40, bounciness: 5 }).start();
  const surface = dark ? '#111827' : '#FFFFFF';
  const border  = dark ? '#1F2937' : '#E5E7EB';
  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale }, { translateY: slideAnim }], marginBottom: 10 }}>
      <TouchableOpacity onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1} style={[rcStyles.card, { backgroundColor: surface, borderColor: border }]}>
        <View style={rcStyles.header}>
          <Ionicons name="calendar-outline" size={14} color={WatchlistColors.primary} />
          <Text style={[rcStyles.date, { color: WatchlistColors.primary }]}>{item.date}</Text>
        </View>
        <Text style={[rcStyles.summary, { color: dark ? '#AEB0B4' : '#4B5563' }]} numberOfLines={2}>{item.summary}</Text>
        <View style={rcStyles.bullets}>
          {item.bullets.map((b, i) => (
            <View key={i} style={rcStyles.bulletRow}>
              <View style={[rcStyles.dot, { backgroundColor: WatchlistColors.primary }]} />
              <Text style={[rcStyles.bulletText, { color: dark ? '#EEEEEF' : '#111827' }]}>{b}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const rcStyles = StyleSheet.create({
  card:       { borderRadius: 12, borderWidth: 1, padding: 14 },
  header:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  date:       { fontSize: 12, fontWeight: '700' },
  summary:    { fontSize: 13, lineHeight: 19, marginBottom: 10 },
  bullets:    { gap: 6 },
  bulletRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  dot:        { width: 6, height: 6, borderRadius: 3, marginTop: 5 },
  bulletText: { flex: 1, fontSize: 13, lineHeight: 18 },
});

export function DailyRecapsSection({ dark }: { dark: boolean }) {
  return (
    <ScrollView contentContainerStyle={{ padding: 12 }}>
      {PLACEHOLDER_RECAPS.map((r, i) => <RecapCard key={r.id} item={r} index={i} dark={dark} />)}
    </ScrollView>
  );
}

// ─── POLICY UPDATES SECTION ──────────────────────────────────────────────────

const PLACEHOLDER_POLICIES = [
  { id: 1, country: '🇺🇸 United States', title: 'SEC Proposes New Crypto Custody Framework for Registered Advisers', description: 'The SEC issued a proposed rule requiring registered investment advisers to use qualified custodians for digital asset holdings.', impact: 'Neutral',  date: 'Mar 28, 2026' },
  { id: 2, country: '🇪🇺 European Union', title: 'MiCA Regulation: Stablecoin Issuers Must Hold 30% in Cash',          description: "Under MiCA's updated reserve requirements, stablecoin issuers operating in the EU must maintain 30% of reserves in unencumbered cash deposits.", impact: 'Positive', date: 'Mar 25, 2026' },
  { id: 3, country: '🇸🇬 Singapore',      title: 'MAS Grants Full License to Two Crypto Exchanges',                     description: 'The Monetary Authority of Singapore awarded full Digital Payment Token service licenses to two major exchanges, expanding the regulated crypto landscape.', impact: 'Positive', date: 'Mar 22, 2026' },
  { id: 4, country: '🇨🇳 China',          title: 'PBOC Expands Digital Yuan Pilot to 26 Cities',                        description: "China's central bank announced an expansion of its CBDC pilot program, adding 26 new cities and enabling interoperability with major payment platforms.", impact: 'Neutral',  date: 'Mar 20, 2026' },
];

function impactColor(impact: string, dark: boolean) {
  if (impact === 'Positive') return UP[dark ? 'dark' : 'light'];
  if (impact === 'Negative') return DOWN[dark ? 'dark' : 'light'];
  return dark ? '#AEB0B4' : '#4B5563';
}

function PolicyCard({ item, dark, index = 0 }: { item: typeof PLACEHOLDER_POLICIES[0]; dark: boolean; index?: number }) {
  const scale     = useRef(new Animated.Value(1)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    const delay = Math.min(index * 70, 280);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 320, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 320, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  const onPressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 60, bounciness: 0 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 40, bounciness: 5 }).start();
  const surface = dark ? '#111827' : '#FFFFFF';
  const border  = dark ? '#1F2937' : '#E5E7EB';
  const col     = impactColor(item.impact, dark);
  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale }, { translateY: slideAnim }], marginBottom: 10 }}>
      <TouchableOpacity onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1} style={[pcStyles.card, { backgroundColor: surface, borderColor: border }]}>
        <View style={pcStyles.topRow}>
          <Text style={[pcStyles.country, { color: dark ? '#AEB0B4' : '#4B5563' }]}>{item.country}</Text>
          <View style={[pcStyles.impactBadge, { backgroundColor: `${col}22`, borderColor: `${col}44` }]}>
            <Text style={[pcStyles.impactText, { color: col }]}>{item.impact}</Text>
          </View>
        </View>
        <Text style={[pcStyles.title, { color: dark ? '#EEEEEF' : '#111827' }]}>{item.title}</Text>
        <Text style={[pcStyles.desc,  { color: dark ? '#AEB0B4' : '#4B5563' }]} numberOfLines={3}>{item.description}</Text>
        <Text style={[pcStyles.date,  { color: dark ? '#4B5563' : '#9CA3AF' }]}>{item.date}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const pcStyles = StyleSheet.create({
  card:        { borderRadius: 12, borderWidth: 1, padding: 14 },
  topRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  country:     { fontSize: 12, fontWeight: '600' },
  impactBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  impactText:  { fontSize: 11, fontWeight: '700' },
  title:       { fontSize: 14, fontWeight: '700', lineHeight: 20, marginBottom: 6 },
  desc:        { fontSize: 13, lineHeight: 19, marginBottom: 8 },
  date:        { fontSize: 11 },
});

export function PolicyUpdatesSection({ dark }: { dark: boolean }) {
  return (
    <ScrollView contentContainerStyle={{ padding: 12 }}>
      {PLACEHOLDER_POLICIES.map((p, i) => <PolicyCard key={p.id} item={p} index={i} dark={dark} />)}
    </ScrollView>
  );
}

// ─── MAIN EXPLORE SCREEN ─────────────────────────────────────────────────────

export default function ExploreScreen() {
  const dark   = useColorScheme() === 'dark';
  const bg     = dark ? '#050B14' : '#F3F4F6';
  const border = dark ? '#1F2937' : '#E5E7EB';
  return (
    <View style={[xStyles.root, { backgroundColor: bg }]}>
      <View style={[xStyles.strip, { borderBottomColor: border }]}>
        <LiveCryptoBoard dark={dark} />
      </View>
      <View style={[xStyles.section, { borderBottomColor: border }]}>
        <MarketOverview dark={dark} />
      </View>
      <AssetsSection dark={dark} />
    </View>
  );
}

const xStyles = StyleSheet.create({
  root:    { flex: 1 },
  strip:   { paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  section: { paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
});
