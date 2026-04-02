/**
 * ExploreScreen — port of SentimentX's MobileView (Explore page).
 *
 * Layout (top → bottom, matches SentimentX mobile layout exactly):
 *   LiveCryptoBoard   — scrolling marquee of 8 top tickers
 *   MarketOverview    — 3 KPI cards (Marketcap, Volume, Dominance)
 *   SectionTabs       — Assets | Top Stories | Daily Recaps | Policy Updates
 *   Section content   — placeholder UI for each tab
 *
 * Animations:
 *   - LiveCryptoBoard: infinite marquee (Animated.loop)
 *   - MarketOverview cards: staggered fade+scale pop-in on mount
 *   - AssetRow: staggered fade+slide-up on mount (index-based delay)
 *   - NewsCard / RecapCard / PolicyCard: spring scale press-lift
 *   - Section content: fade-in on tab switch
 *
 * All data is static placeholder — API wiring is left for a future pass.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  Easing,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WatchlistColors } from '@/constants/theme';

// ─── Shared helpers ───────────────────────────────────────────────────────────

const UP   = WatchlistColors.tickerUp;
const DOWN = WatchlistColors.tickerDown;

function deltaColor(up: boolean, dark: boolean) {
  return up ? UP[dark ? 'dark' : 'light'] : DOWN[dark ? 'dark' : 'light'];
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. LIVE CRYPTO BOARD
// Port of LiveCryptoBoard.tsx — CSS @keyframes marquee → Animated.loop
// ─────────────────────────────────────────────────────────────────────────────

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

const CARD_W   = 158;
const CARD_MR  = 8;
const PER_CARD = CARD_W + CARD_MR;
const HALF_W   = TICKERS.length * PER_CARD;

function TickerCard({ item, dark }: { item: typeof TICKERS[0]; dark: boolean }) {
  const logoUri = `https://assets.coincap.io/assets/icons/${item.id.toLowerCase()}@2x.png`;
  const col = deltaColor(item.up, dark);
  const cardBg = dark ? '#111827' : '#FFFFFF';
  const border  = dark ? '#1F2937' : '#E5E7EB';
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  logo:     { width: 20, height: 20, borderRadius: 10 },
  symbol:   { fontSize: 11, fontWeight: '700', width: 32 },
  priceRow: { flex: 1, alignItems: 'flex-end' },
  price:    { fontSize: 12, fontWeight: '700' },
  change:   { fontSize: 11, fontWeight: '500', marginTop: 1 },
});

function LiveCryptoBoard({ dark }: { dark: boolean }) {
  const marquee = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(marquee, {
        toValue: -HALF_W,
        duration: 60_000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const doubled = [...TICKERS, ...TICKERS];

  return (
    <View style={lcbStyles.wrapper}>
      <Animated.View style={[lcbStyles.track, { transform: [{ translateX: marquee }] }]}>
        {doubled.map((item, i) => (
          <TickerCard key={`${item.id}-${i}`} item={item} dark={dark} />
        ))}
      </Animated.View>
    </View>
  );
}

const lcbStyles = StyleSheet.create({
  wrapper: { overflow: 'hidden', paddingVertical: 6 },
  track:   { flexDirection: 'row' },
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. MARKET OVERVIEW
// Port of MobileMarketOverview.tsx — 3 KPI stat cards with staggered pop-in
// ─────────────────────────────────────────────────────────────────────────────

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
    <Animated.View style={[
      moStyles.card,
      { backgroundColor: bg, borderColor: border },
      { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
    ]}>
      <Text style={[moStyles.label, { color: dark ? '#AEB0B4' : '#4B5563' }]}>{label}</Text>
      {value ? (
        <View style={moStyles.row}>
          <Text style={[moStyles.value, { color: dark ? '#EEEEEF' : '#111827' }]}>{value}</Text>
          {change !== undefined && up !== undefined && (
            <DeltaBadge change={change} up={up} dark={dark} />
          )}
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

function MarketOverview({ dark }: { dark: boolean }) {
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

// ─────────────────────────────────────────────────────────────────────────────
// 3. SECTION TABS
// Port of MobileSectionTabs.tsx — horizontal scrollable tab bar with indicator
// ─────────────────────────────────────────────────────────────────────────────

type SectionId = 'assets' | 'top_stories' | 'daily_recaps' | 'policy_updates';

const SECTIONS: { id: SectionId; label: string; icon: string }[] = [
  { id: 'assets',          label: 'Assets',         icon: 'bar-chart-outline'    },
  { id: 'top_stories',     label: 'Top Stories',    icon: 'newspaper-outline'    },
  { id: 'daily_recaps',    label: 'Daily Recaps',   icon: 'calendar-outline'     },
  { id: 'policy_updates',  label: 'Policy Updates', icon: 'document-text-outline'},
];

function SectionTabs({
  active, onSelect, dark,
}: { active: SectionId; onSelect: (id: SectionId) => void; dark: boolean }) {
  const border = dark ? '#1F2937' : '#E5E7EB';
  return (
    <View style={[stStyles.wrapper, { borderBottomColor: border }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={stStyles.track}>
        {SECTIONS.map((s) => {
          const isActive = s.id === active;
          return (
            <TouchableOpacity
              key={s.id}
              onPress={() => onSelect(s.id)}
              style={[stStyles.tab, isActive && { borderBottomColor: WatchlistColors.primary, borderBottomWidth: 2 }]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={s.icon as any}
                size={14}
                color={isActive ? WatchlistColors.primary : (dark ? '#AEB0B4' : '#4B5563')}
              />
              <Text style={[
                stStyles.label,
                { color: isActive ? WatchlistColors.primary : (dark ? '#AEB0B4' : '#4B5563') },
                isActive && { fontWeight: '700' },
              ]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const stStyles = StyleSheet.create({
  wrapper: { borderBottomWidth: StyleSheet.hairlineWidth },
  track:   { paddingHorizontal: 4, gap: 4 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  label: { fontSize: 13 },
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. ASSETS SECTION
// Port of MobileAssetsSection — staggered fade+slide row pop-in on mount
// ─────────────────────────────────────────────────────────────────────────────

const PLACEHOLDER_ASSETS = [
  { id: 'BTC',   name: 'Bitcoin',   price: '$68,420', change: '+2.30%', up: true  },
  { id: 'ETH',   name: 'Ethereum',  price: '$3,580',  change: '+1.80%', up: true  },
  { id: 'BNB',   name: 'BNB',       price: '$578',    change: '-0.90%', up: false },
  { id: 'SOL',   name: 'Solana',    price: '$142.30', change: '+4.20%', up: true  },
  { id: 'XRP',   name: 'XRP',       price: '$0.582',  change: '-0.50%', up: false },
  { id: 'DOGE',  name: 'Dogecoin',  price: '$0.124',  change: '+8.10%', up: true  },
  { id: 'ADA',   name: 'Cardano',   price: '$0.441',  change: '-1.30%', up: false },
  { id: 'AVAX',  name: 'Avalanche', price: '$36.40',  change: '+3.20%', up: true  },
  { id: 'LINK',  name: 'Chainlink', price: '$18.45',  change: '-1.20%', up: false },
  { id: 'MATIC', name: 'Polygon',   price: '$0.710',  change: '+2.10%', up: true  },
];

function AssetRow({ item, index, dark }: { item: typeof PLACEHOLDER_ASSETS[0]; index: number; dark: boolean }) {
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
  const col     = deltaColor(item.up, dark);
  const uri     = `https://assets.coincap.io/assets/icons/${item.id.toLowerCase()}@2x.png`;

  return (
    <Animated.View style={[
      asStyles.row,
      { backgroundColor: surface, borderBottomColor: border },
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
    ]}>
      <Text style={[asStyles.num, { color: dark ? '#AEB0B4' : '#4B5563' }]}>{index + 1}</Text>
      <Image source={{ uri }} style={asStyles.logo} />
      <View style={asStyles.nameCol}>
        <Text style={[asStyles.name, { color: dark ? '#EEEEEF' : '#111827' }]}>{item.name}</Text>
        <Text style={[asStyles.ticker, { color: dark ? '#AEB0B4' : '#4B5563' }]}>{item.id}</Text>
      </View>
      <View style={asStyles.priceCol}>
        <Text style={[asStyles.price, { color: dark ? '#EEEEEF' : '#111827' }]}>{item.price}</Text>
        <Text style={[asStyles.change, { color: col }]}>{item.change}</Text>
      </View>
    </Animated.View>
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
});

function AssetsSection({ dark }: { dark: boolean }) {
  const hdr     = dark ? '#0D1117' : '#F3F4F6';
  const hdrText = dark ? '#AEB0B4' : '#4B5563';
  return (
    <ScrollView>
      <View style={[asStyles.row, { backgroundColor: hdr, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: dark ? '#1F2937' : '#E5E7EB' }]}>
        <Text style={{ width: 22, fontSize: 11, fontWeight: '700', color: hdrText, textTransform: 'uppercase', letterSpacing: 0.4 }}>#</Text>
        <View style={{ width: 32 + 16 }} />
        <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: hdrText, textTransform: 'uppercase', letterSpacing: 0.4 }}>Asset</Text>
        <Text style={{ fontSize: 11, fontWeight: '700', color: hdrText, textTransform: 'uppercase', letterSpacing: 0.4 }}>Price / 24h</Text>
      </View>
      {PLACEHOLDER_ASSETS.map((a, i) => (
        <AssetRow key={a.id} item={a} index={i} dark={dark} />
      ))}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. TOP STORIES SECTION
// Port of MobileTopStoriesSection — news cards with sentiment accent + press-lift
// ─────────────────────────────────────────────────────────────────────────────

const PLACEHOLDER_STORIES = [
  { id: 1, title: 'Bitcoin Surpasses $68K as Institutional Demand Accelerates', publisher: 'CoinDesk', time: '2h ago', sentiment: 1 as -1|0|1, image: true  },
  { id: 2, title: 'Ethereum Layer 2 Ecosystem Sees Record $45B in TVL',          publisher: 'The Block', time: '4h ago', sentiment: 1 as -1|0|1, image: false },
  { id: 3, title: 'SEC Reviews New Crypto Custody Rules for Institutional Investors', publisher: 'Reuters', time: '6h ago', sentiment: 0 as -1|0|1, image: true  },
  { id: 4, title: 'Solana Network Experiences Brief Congestion During NFT Mint',  publisher: 'Decrypt', time: '8h ago', sentiment: -1 as -1|0|1, image: false },
  { id: 5, title: 'BlackRock Bitcoin ETF Surpasses $20B in Assets Under Management', publisher: 'Bloomberg', time: '10h ago', sentiment: 1 as -1|0|1, image: true  },
  { id: 6, title: 'Ripple vs SEC: Court Orders Document Disclosure in Ongoing Case', publisher: 'CoinTelegraph', time: '12h ago', sentiment: 0 as -1|0|1, image: false },
];

function sentimentAccent(s: -1|0|1, dark: boolean) {
  if (s === 1)  return UP[dark ? 'dark' : 'light'];
  if (s === -1) return DOWN[dark ? 'dark' : 'light'];
  return '#B45309';
}

function NewsCard({ item, dark, index = 0 }: { item: typeof PLACEHOLDER_STORIES[0]; dark: boolean; index?: number }) {
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
  const accent  = sentimentAccent(item.sentiment, dark);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale }, { translateY: slideAnim }] }}>
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={[ncStyles.card, { backgroundColor: surface }]}
      >
        <View style={[ncStyles.accentTop, { backgroundColor: accent }]} />
        {item.image && (
          <View style={[ncStyles.imagePlaceholder, { backgroundColor: dark ? '#1F2937' : '#E5E7EB' }]}>
            <Ionicons name="image-outline" size={28} color={dark ? '#374151' : '#D1D5DB'} />
          </View>
        )}
        <View style={ncStyles.body}>
          <Text style={[ncStyles.title, { color: dark ? '#EEEEEF' : '#111827' }]} numberOfLines={2}>{item.title}</Text>
          <View style={ncStyles.meta}>
            <Text style={[ncStyles.publisher, { color: dark ? '#AEB0B4' : '#4B5563' }]}>{item.publisher}</Text>
            <Text style={[ncStyles.time,      { color: dark ? '#AEB0B4' : '#4B5563' }]}>{item.time}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const ncStyles = StyleSheet.create({
  card:             { borderRadius: 12, marginBottom: 10, overflow: 'hidden' },
  accentTop:        { height: 4 },
  imagePlaceholder: { height: 130, alignItems: 'center', justifyContent: 'center' },
  body:             { padding: 12 },
  title:            { fontSize: 14, fontWeight: '600', lineHeight: 20, marginBottom: 8 },
  meta:             { flexDirection: 'row', justifyContent: 'space-between' },
  publisher:        { fontSize: 11 },
  time:             { fontSize: 11 },
});

function TopStoriesSection({ dark }: { dark: boolean }) {
  return (
    <ScrollView contentContainerStyle={{ padding: 12 }}>
      {PLACEHOLDER_STORIES.map((s, i) => <NewsCard key={s.id} item={s} index={i} dark={dark} />)}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. DAILY RECAPS SECTION
// Port of MobileDailyRecapsSection — summary cards with press-lift
// ─────────────────────────────────────────────────────────────────────────────

const PLACEHOLDER_RECAPS = [
  {
    id: 1, date: 'Today — Apr 1, 2026',
    summary: 'Bitcoin broke above $68K on strong institutional inflows. Ethereum L2 TVL hit a new record. Federal Reserve signaled rate stability.',
    bullets: ['BTC +2.3% — record ETF inflows', 'ETH L2 TVL surpasses $45B', 'Fed holds rates, crypto reacts positively'],
  },
  {
    id: 2, date: 'Yesterday — Mar 31, 2026',
    summary: 'Markets consolidated after last week\'s rally. Solana saw brief network congestion during a major NFT launch.',
    bullets: ['SOL congestion during Tensor launch', 'DeFi TVL steady at $180B', 'SEC reviewed new custody rules'],
  },
  {
    id: 3, date: 'Mar 30, 2026',
    summary: 'Positive momentum across altcoins. DOGE surged 8% on renewed retail interest. BNB dropped on regulatory concerns.',
    bullets: ['DOGE +8.1% on retail surge', 'BNB -2.1% amid regulatory news', 'Ripple case update: new document disclosure'],
  },
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
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={[rcStyles.card, { backgroundColor: surface, borderColor: border }]}
      >
        <View style={rcStyles.header}>
          <Ionicons name="calendar-outline" size={14} color={WatchlistColors.primary} />
          <Text style={[rcStyles.date, { color: WatchlistColors.primary }]}>{item.date}</Text>
        </View>
        <Text style={[rcStyles.summary, { color: dark ? '#AEB0B4' : '#4B5563' }]} numberOfLines={2}>
          {item.summary}
        </Text>
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

function DailyRecapsSection({ dark }: { dark: boolean }) {
  return (
    <ScrollView contentContainerStyle={{ padding: 12 }}>
      {PLACEHOLDER_RECAPS.map((r, i) => <RecapCard key={r.id} item={r} index={i} dark={dark} />)}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. POLICY UPDATES SECTION
// Port of MobilePolicyUpdatesSection — government policy cards with press-lift
// ─────────────────────────────────────────────────────────────────────────────

const PLACEHOLDER_POLICIES = [
  {
    id: 1, country: '🇺🇸 United States',
    title: 'SEC Proposes New Crypto Custody Framework for Registered Advisers',
    description: 'The SEC issued a proposed rule requiring registered investment advisers to use qualified custodians for digital asset holdings.',
    impact: 'Neutral', date: 'Mar 28, 2026',
  },
  {
    id: 2, country: '🇪🇺 European Union',
    title: 'MiCA Regulation: Stablecoin Issuers Must Hold 30% in Cash',
    description: 'Under MiCA\'s updated reserve requirements, stablecoin issuers operating in the EU must maintain 30% of reserves in unencumbered cash deposits.',
    impact: 'Positive', date: 'Mar 25, 2026',
  },
  {
    id: 3, country: '🇸🇬 Singapore',
    title: 'MAS Grants Full License to Two Crypto Exchanges',
    description: 'The Monetary Authority of Singapore awarded full Digital Payment Token service licenses to two major exchanges, expanding the regulated crypto landscape.',
    impact: 'Positive', date: 'Mar 22, 2026',
  },
  {
    id: 4, country: '🇨🇳 China',
    title: 'PBOC Expands Digital Yuan Pilot to 26 Cities',
    description: 'China\'s central bank announced an expansion of its CBDC pilot program, adding 26 new cities and enabling interoperability with major payment platforms.',
    impact: 'Neutral', date: 'Mar 20, 2026',
  },
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
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={[pcStyles.card, { backgroundColor: surface, borderColor: border }]}
      >
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

function PolicyUpdatesSection({ dark }: { dark: boolean }) {
  return (
    <ScrollView contentContainerStyle={{ padding: 12 }}>
      {PLACEHOLDER_POLICIES.map((p, i) => <PolicyCard key={p.id} item={p} index={i} dark={dark} />)}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. MAIN EXPLORE SCREEN
// Mirrors Explore.tsx + MobileView.tsx structure
// Section content fades in on tab switch (mirrors WatchlistDashboard's contentAnim)
// ─────────────────────────────────────────────────────────────────────────────

export default function ExploreScreen() {
  const dark = useColorScheme() === 'dark';
  const [activeSection, setActiveSection] = useState<SectionId>('assets');

  const contentAnim = useRef(new Animated.Value(1)).current;

  const handleSelect = (id: SectionId) => {
    contentAnim.setValue(0);
    setActiveSection(id);
    Animated.timing(contentAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  };

  const bg     = dark ? '#050B14' : '#F3F4F6';
  const border = dark ? '#1F2937' : '#E5E7EB';

  return (
    <View style={[xStyles.root, { backgroundColor: bg }]}>

      {/* ── Live Crypto Board marquee ── */}
      <View style={[xStyles.strip, { borderBottomColor: border }]}>
        <LiveCryptoBoard dark={dark} />
      </View>

      {/* ── Market Overview KPI cards ── */}
      <View style={[xStyles.section, { borderBottomColor: border }]}>
        <MarketOverview dark={dark} />
      </View>

      {/* ── Section Tabs ── */}
      <SectionTabs active={activeSection} onSelect={handleSelect} dark={dark} />

      {/* ── Active section content with fade-in on switch ── */}
      <Animated.View style={[xStyles.content, { opacity: contentAnim }]}>
        {activeSection === 'assets'         && <AssetsSection        dark={dark} />}
        {activeSection === 'top_stories'    && <TopStoriesSection    dark={dark} />}
        {activeSection === 'daily_recaps'   && <DailyRecapsSection   dark={dark} />}
        {activeSection === 'policy_updates' && <PolicyUpdatesSection dark={dark} />}
      </Animated.View>

    </View>
  );
}

const xStyles = StyleSheet.create({
  root:    { flex: 1 },
  strip:   { paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  section: { paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  content: { flex: 1 },
});
