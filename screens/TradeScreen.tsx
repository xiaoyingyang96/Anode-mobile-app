import { WatchlistColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import ZenQuestionsModal from '@/screens/ZenQuestionsModal';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native';
import { CandlestickChart } from 'react-native-wagmi-charts';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const RANGES = ['1d', '5d', '1mo', '3mo', '1y'];

const ASSETS = [
  { id: 'BTC-USD', label: 'BTC' },
  { id: 'ETH-USD', label: 'ETH' },
  { id: 'SOL-USD', label: 'SOL' },
  { id: 'XRP-USD', label: 'XRP' },
  { id: 'DOGE-USD', label: 'DOGE' },
  { id: 'AVAX-USD', label: 'AVAX' },
];

type TradeSide = 'buy' | 'sell';
type OHLCV = { timestamp: number; open: number; high: number; low: number; close: number };
type OrderBookEntry = { price: number; size: number; total: number };
type TradeEntry = { id: string; price: number; size: number; side: 'BUY' | 'SELL'; time: string };

// ─── Asset Selector ───────────────────────────────────────────────────────────
function AssetSelector({ selectedId, onSelect, dark }: {
  selectedId: string; onSelect: (id: string) => void; dark: boolean;
}) {
  const border = dark ? '#1F2937' : '#E5E7EB';
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 8 }}
    style={{ flexGrow: 0 }}>
      {ASSETS.map(a => {
        const isActive = a.id === selectedId;
        return (
          <TouchableOpacity key={a.id} onPress={() => onSelect(a.id)}
            style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, height: 36, justifyContent: 'center', borderColor: isActive ? WatchlistColors.primary : border, backgroundColor: isActive ? WatchlistColors.primaryMuted : 'transparent' }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: isActive ? WatchlistColors.primary : (dark ? '#AEB0B4' : '#4B5563') }}>{a.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── Chart + Price Summary Panel ─────────────────────────────────────────────
function ChartPanel({ selectedId, dark }: { selectedId: string; dark: boolean }) {
  const [range, setRange] = useState('1d');
  const [chartData, setChartData] = useState<OHLCV[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ price: 0, changePct: 0, high: 0, low: 0, volume: 0 });
  const { width } = useWindowDimensions();
  const border = dark ? '#1F2937' : '#E5E7EB';
  const textSub = dark ? '#AEB0B4' : '#4B5563';

  useEffect(() => {
    if (!selectedId) return;
    const controller = new AbortController();
    setLoading(true);
    fetch(`${API_BASE}/api/product/markets/graph-data?range=${range}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        const market = data.crypto?.find((m: any) => m.asset_id === selectedId);
        if (!market) { setChartData([]); return; }
        const raw = market.ohlcv ?? [];
        const normalized: OHLCV[] = raw.map((p: any) => ({
          timestamp: new Date(p.datetime).getTime(),
          open: Number(p.open), high: Number(p.high), low: Number(p.low), close: Number(p.close),
        }));
        setChartData(normalized);
        if (normalized.length >= 2) {
          const first = normalized[0];
          const last = normalized[normalized.length - 1];
          const high = Math.max(...normalized.map(p => p.high));
          const low = Math.min(...normalized.map(p => p.low));
          const volume = raw.reduce((s: number, p: any) => s + (Number(p.volume) || 0), 0);
          const changePct = first.open > 0 ? ((last.close - first.open) / first.open * 100) : 0;
          setStats({ price: last.close, changePct, high, low, volume });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [selectedId, range]);

  const isUp = stats.changePct >= 0;
  const changeColor = isUp ? WatchlistColors.tickerUp[dark ? 'dark' : 'light'] : WatchlistColors.tickerDown[dark ? 'dark' : 'light'];
  const ticker = selectedId.split('-')[0];

  const fmt = (n: number) => n >= 1000 ? `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : `$${n.toFixed(4)}`;
  const fmtCompact = (n: number) => n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${n.toFixed(2)}`;

  return (
    <View style={{ backgroundColor: dark ? '#0D1117' : '#FFFFFF', borderBottomWidth: 1, borderBottomColor: border }}>
      {/* Price summary */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: textSub, marginBottom: 6 }}>{selectedId}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: dark ? '#EEEEEF' : '#111827' }}>
            {stats.price > 0 ? fmt(stats.price) : '--'}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '700', color: changeColor }}>
            {isUp ? '+' : ''}{stats.changePct.toFixed(2)}%
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          {[
            { label: '24H Volume', value: fmtCompact(stats.volume) },
            { label: '24H High', value: fmt(stats.high) },
            { label: '24H Low', value: fmt(stats.low) },
          ].map(s => (
            <View key={s.label}>
              <Text style={{ fontSize: 11, color: textSub, fontWeight: '600', marginBottom: 2 }}>{s.label}</Text>
              <Text style={{ fontSize: 13, fontWeight: '500', color: dark ? '#EEEEEF' : '#111827' }}>{s.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Range selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4, paddingHorizontal: 12, paddingBottom: 8 }}>
        {RANGES.map(r => {
          const isActive = r === range;
          return (
            <TouchableOpacity key={r} onPress={() => setRange(r)}
              style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, backgroundColor: isActive ? (dark ? '#1F2937' : '#F3F4F6') : 'transparent' }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: isActive ? (dark ? '#EEEEEF' : '#111827') : textSub }}>{r.toUpperCase()}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Chart */}
      <View style={{ paddingHorizontal: 4 }}>
        {loading ? (
          <View style={{ height: 260, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="small" color={WatchlistColors.primary} />
          </View>
        ) : chartData.length >= 2 ? (
          <>
            <CandlestickChart.Provider data={chartData}>
              <CandlestickChart height={240} width={width - 8}>
                <CandlestickChart.Candles />
                <CandlestickChart.Crosshair>
                  <CandlestickChart.Tooltip />
                </CandlestickChart.Crosshair>
              </CandlestickChart>
              <CandlestickChart.DatetimeText
                style={{ color: dark ? '#AEB0B4' : '#4B5563', fontSize: 11, textAlign: 'center', marginTop: 4 }}
              />
            </CandlestickChart.Provider>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, marginTop: 4 }}>
              {[0, Math.floor(chartData.length / 3), Math.floor(chartData.length * 2 / 3), chartData.length - 1].map(i => (
                <Text key={i} style={{ fontSize: 10, color: dark ? '#AEB0B4' : '#4B5563' }}>
                  {range === '1d'
                    ? new Date(chartData[i].timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : new Date(chartData[i].timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  }
                </Text>
              ))}
            </View>
          </>
        ) : (
          <View style={{ height: 260, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: textSub }}>No data available</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Order Book ───────────────────────────────────────────────────────────────
function OrderBook({ selectedId, dark }: { selectedId: string; dark: boolean }) {
  const [activeTab, setActiveTab] = useState<'orderbook' | 'trades'>('orderbook');
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const asksMapRef = useRef<Map<number, number>>(new Map());
  const bidsMapRef = useRef<Map<number, number>>(new Map());
  const tradesBufferRef = useRef<TradeEntry[]>([]);
  const border = dark ? '#1F2937' : '#E5E7EB';
  const textSub = dark ? '#AEB0B4' : '#4B5563';
  const textMain = dark ? '#EEEEEF' : '#111827';

  useEffect(() => {
    if (!selectedId) return;
    asksMapRef.current = new Map();
    bidsMapRef.current = new Map();
    tradesBufferRef.current = [];

    const ws = new WebSocket('wss://advanced-trade-ws.coinbase.com');
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', product_ids: [selectedId], channel: 'level2' }));
      ws.send(JSON.stringify({ type: 'subscribe', product_ids: [selectedId], channel: 'market_trades' }));
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (!payload?.events) return;
        for (const evt of payload.events) {
          if ((evt.type === 'snapshot' || evt.type === 'update') && Array.isArray(evt.updates)) {
            for (const u of evt.updates) {
              const side = String(u.side ?? '').toLowerCase();
              const price = Number(u.price_level ?? u.price);
              const size = Number(u.new_quantity ?? u.size ?? 0);
              if (isNaN(price) || isNaN(size)) continue;
              if (side === 'bid') { size <= 0 ? bidsMapRef.current.delete(price) : bidsMapRef.current.set(price, size); }
              if (side === 'offer' || side === 'ask') { size <= 0 ? asksMapRef.current.delete(price) : asksMapRef.current.set(price, size); }
            }
          }
          if (Array.isArray(evt.trades)) {
            const mapped = evt.trades.map((t: any, i: number) => ({
              id: String(t.trade_id ?? `${t.price}-${i}`),
              price: Number(t.price), size: Number(t.size),
              side: String(t.side).toUpperCase() === 'BUY' ? 'BUY' : 'SELL', time: t.time,
            })).filter((t: TradeEntry) => !isNaN(t.price) && !isNaN(t.size));
            tradesBufferRef.current = [...mapped, ...tradesBufferRef.current].slice(0, 40);
          }
        }
      } catch {}
    };

    const interval = setInterval(() => {
      // Build asks (ascending)
      const asksArr = Array.from(asksMapRef.current.entries())
        .sort(([a], [b]) => a - b).slice(0, 12);
      let total = 0;
      const builtAsks = asksArr.map(([price, size]) => { total += size; return { price, size, total }; });

      // Build bids (descending)
      const bidsArr = Array.from(bidsMapRef.current.entries())
        .sort(([a], [b]) => b - a).slice(0, 12);
      total = 0;
      const builtBids = bidsArr.map(([price, size]) => { total += size; return { price, size, total }; });

      setAsks(builtAsks);
      setBids(builtBids);
      setTrades([...tradesBufferRef.current]);
    }, 300);

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, [selectedId]);

  const baseAsset = selectedId.split('-')[0];

  const fmtPrice = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtSize = (n: number) => n.toFixed(4);

  const bestAsk = asks[0]?.price;
  const bestBid = bids[0]?.price;
  const spread = bestAsk && bestBid ? (bestAsk - bestBid).toFixed(2) : '--';

  return (
    <View style={{ flex: 1, backgroundColor: dark ? '#0D1117' : '#FFFFFF' }}>
      {/* Tabs */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: border }}>
        {(['orderbook', 'trades'] as const).map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
            style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === tab ? WatchlistColors.primary : 'transparent' }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: activeTab === tab ? WatchlistColors.primary : textSub }}>
              {tab === 'orderbook' ? 'Order Book' : 'Recent Trades'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'orderbook' ? (
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: border }}>
            <Text style={{ flex: 1, fontSize: 11, fontWeight: '600', color: textSub }}>Price (USDC)</Text>
            <Text style={{ flex: 1, fontSize: 11, fontWeight: '600', color: textSub, textAlign: 'right' }}>Size ({baseAsset})</Text>
            <Text style={{ flex: 1, fontSize: 11, fontWeight: '600', color: textSub, textAlign: 'right' }}>Total</Text>
          </View>

          {/* Asks */}
          {asks.slice().reverse().map((row, i) => (
            <View key={`ask-${i}`} style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 4 }}>
              <Text style={{ flex: 1, fontSize: 12, color: WatchlistColors.tickerDown[dark ? 'dark' : 'light'], fontWeight: '600' }}>{fmtPrice(row.price)}</Text>
              <Text style={{ flex: 1, fontSize: 12, color: textMain, textAlign: 'right' }}>{fmtSize(row.size)}</Text>
              <Text style={{ flex: 1, fontSize: 12, color: textSub, textAlign: 'right' }}>{fmtSize(row.total)}</Text>
            </View>
          ))}

          {/* Spread */}
          <View style={{ paddingHorizontal: 16, paddingVertical: 6, borderTopWidth: 1, borderBottomWidth: 1, borderColor: border }}>
            <Text style={{ fontSize: 12, color: textSub }}>Spread: {spread}</Text>
          </View>

          {/* Bids */}
          {bids.map((row, i) => (
            <View key={`bid-${i}`} style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 4 }}>
              <Text style={{ flex: 1, fontSize: 12, color: WatchlistColors.tickerUp[dark ? 'dark' : 'light'], fontWeight: '600' }}>{fmtPrice(row.price)}</Text>
              <Text style={{ flex: 1, fontSize: 12, color: textMain, textAlign: 'right' }}>{fmtSize(row.size)}</Text>
              <Text style={{ flex: 1, fontSize: 12, color: textSub, textAlign: 'right' }}>{fmtSize(row.total)}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: border }}>
            <Text style={{ flex: 1, fontSize: 11, fontWeight: '600', color: textSub }}>Price (USDC)</Text>
            <Text style={{ flex: 1, fontSize: 11, fontWeight: '600', color: textSub, textAlign: 'right' }}>Size ({baseAsset})</Text>
            <Text style={{ flex: 1, fontSize: 11, fontWeight: '600', color: textSub, textAlign: 'right' }}>Time</Text>
          </View>
          <ScrollView>
            {trades.map(item => (
              <View key={item.id} style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 4 }}>
                <Text style={{ flex: 1, fontSize: 12, fontWeight: '600', color: item.side === 'BUY' ? WatchlistColors.tickerUp[dark ? 'dark' : 'light'] : WatchlistColors.tickerDown[dark ? 'dark' : 'light'] }}>
                  {fmtPrice(item.price)}
                </Text>
                <Text style={{ flex: 1, fontSize: 12, color: textMain, textAlign: 'right' }}>{fmtSize(item.size)}</Text>
                <Text style={{ flex: 1, fontSize: 12, color: textSub, textAlign: 'right' }}>
                  {item.time ? new Date(item.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--'}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ─── Trade Panel ──────────────────────────────────────────────────────────────
function TradePanel({ side, selectedId, dark, onClose }: {
  side: TradeSide; selectedId: string; dark: boolean; onClose: () => void;
}) {
  const [limitPrice, setLimitPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [sliderValue, setSliderValue] = useState(0);
  const bg = dark ? '#0D1117' : '#FFFFFF';
  const border = dark ? '#1F2937' : '#E5E7EB';
  const textMain = dark ? '#EEEEEF' : '#111827';
  const textSub = dark ? '#AEB0B4' : '#4B5563';
  const isUp = side === 'buy';
  const actionColor = isUp ? WatchlistColors.tickerUp[dark ? 'dark' : 'light'] : WatchlistColors.tickerDown[dark ? 'dark' : 'light'];
  const baseAsset = selectedId.split('-')[0];

  const estimatedBtc = limitPrice && amount ? (Number(amount) / Number(limitPrice)).toFixed(6) : '0.000000';
  const fee = amount ? (Number(amount) * 0.004).toFixed(2) : '--';
  const total = amount ? (Number(amount) + Number(amount) * 0.004).toFixed(2) : '--';
  const SLIDER_STEPS = [0, 25, 50, 75, 100];

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: border }}>
        <Text style={{ fontSize: 17, fontWeight: '700', color: textMain }}>{side === 'buy' ? `Buy ${baseAsset}` : `Sell ${baseAsset}`}</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={22} color={textSub} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 12, color: textSub }}>Available (USDC)</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: textMain }}>2,020.22</Text>
        </View>
        <View style={{ borderWidth: 1, borderColor: border, borderRadius: 10, backgroundColor: dark ? '#111827' : '#F9FAFB', paddingHorizontal: 14, paddingVertical: 10 }}>
          <Text style={{ fontSize: 11, color: textSub, marginBottom: 4 }}>Limit price (USDC)</Text>
          <TextInput style={{ fontSize: 16, fontWeight: '600', color: textMain }} placeholder="0.00" placeholderTextColor={textSub} value={limitPrice} onChangeText={setLimitPrice} keyboardType="numeric" />
        </View>
        <View style={{ borderWidth: 1, borderColor: border, borderRadius: 10, backgroundColor: dark ? '#111827' : '#F9FAFB', paddingHorizontal: 14, paddingVertical: 10 }}>
          <Text style={{ fontSize: 11, color: textSub, marginBottom: 4 }}>Amount ({side === 'buy' ? 'USDC' : baseAsset})</Text>
          <TextInput style={{ fontSize: 16, fontWeight: '600', color: textMain }} placeholder="0.00" placeholderTextColor={textSub} value={amount} onChangeText={setAmount} keyboardType="numeric" />
          <Text style={{ fontSize: 11, color: textSub, marginTop: 4 }}>≈ {estimatedBtc} {baseAsset}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
          {SLIDER_STEPS.map(step => (
            <TouchableOpacity key={step} onPress={() => setSliderValue(step)} style={{ alignItems: 'center', gap: 4 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: sliderValue >= step ? WatchlistColors.primary : (dark ? '#1F2937' : '#E5E7EB') }} />
              <Text style={{ fontSize: 10, color: textSub }}>{step}%</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ gap: 8, borderTopWidth: 1, borderTopColor: border, paddingTop: 12 }}>
          {[{ label: 'Subtotal', value: amount || '--' }, { label: 'Fee (0.4%)', value: fee }, { label: 'Total', value: total, bold: true }].map(row => (
            <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: row.bold ? 15 : 13, fontWeight: row.bold ? '700' : '400', color: row.bold ? textMain : textSub }}>{row.label}</Text>
              <Text style={{ fontSize: row.bold ? 15 : 13, fontWeight: row.bold ? '700' : '400', color: textMain }}>{row.value}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={{ backgroundColor: `${actionColor}22`, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: actionColor }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: actionColor }}>{side === 'buy' ? `Buy ${baseAsset}` : `Sell ${baseAsset}`}</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 11, color: textSub, textAlign: 'center', lineHeight: 16 }}>Crypto markets are unique. Order fills cannot be reversed.</Text>
        <View style={{ borderTopWidth: 1, borderTopColor: border, paddingTop: 12, gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: textMain }}>Trading balance</Text>
          {[{ label: 'USD', value: '$0.00' }, { label: 'USDC', value: '2,020.22' }, { label: baseAsset, value: '0.00695962' }].map(row => (
            <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: textSub }}>{row.label}</Text>
              <Text style={{ fontSize: 13, fontWeight: '500', color: textMain }}>{row.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function TradeScreen() {
  const dark = useColorScheme() === 'dark';
  const [selectedId, setSelectedId] = useState('BTC-USD');
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeSide, setTradeSide] = useState<TradeSide>('buy');
  const [zenVisible, setZenVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setZenVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);
  const border = dark ? '#1F2937' : '#E5E7EB';

  const openTrade = (side: TradeSide) => {
    setTradeSide(side);
    setTradeModalOpen(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: dark ? '#050B14' : '#F3F4F6' }}>
      <AssetSelector selectedId={selectedId} onSelect={setSelectedId} dark={dark} />
      
      <ScrollView style={{ flex: 1 }}>
        <ChartPanel selectedId={selectedId} dark={dark} />
        <OrderBook selectedId={selectedId} dark={dark} />
      </ScrollView>

      {/* Buy / Sell buttons */}
      <View style={{ flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: border, backgroundColor: dark ? '#0D1117' : '#FFFFFF' }}>
        <TouchableOpacity onPress={() => openTrade('buy')}
          style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: `${WatchlistColors.tickerUp[dark ? 'dark' : 'light']}22`, borderWidth: 1, borderColor: WatchlistColors.tickerUp[dark ? 'dark' : 'light'] }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: WatchlistColors.tickerUp[dark ? 'dark' : 'light'] }}>Buy</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openTrade('sell')}
          style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: `${WatchlistColors.tickerDown[dark ? 'dark' : 'light']}22`, borderWidth: 1, borderColor: WatchlistColors.tickerDown[dark ? 'dark' : 'light'] }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: WatchlistColors.tickerDown[dark ? 'dark' : 'light'] }}>Sell</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={tradeModalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setTradeModalOpen(false)}>
        <TradePanel side={tradeSide} selectedId={selectedId} dark={dark} onClose={() => setTradeModalOpen(false)} />
      </Modal>
      <ZenQuestionsModal visible={zenVisible} onClose={() => setZenVisible(false)} />
    </View>
  );
}