import React, { useEffect, useRef, useState } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WatchlistColors } from '@/constants/theme';

// MUI md breakpoint equivalent
const WIDE_BREAKPOINT = 600;

/* ---------- Static data ---------- */
const FAQ_ITEMS = [
  {
    q: 'What is a crypto watchlist?',
    a: 'A personalized list to track selected coins/tokens with live price, 24h change, volume, market cap, etc.',
  },
  {
    q: 'How many watchlists can I create?',
    a: 'Free includes one simple watchlist (up to 10 assets). Professional and Advanced support multiple, larger lists.',
  },
  {
    q: 'How often does data refresh?',
    a: 'Prices update in near real time. Free refreshes periodically; paid plans refresh more frequently and add live signals.',
  },
  {
    q: 'Where do prices come from?',
    a: 'From aggregated market data across major exchanges and liquidity sources.',
  },
];

const WATCHLIST_NEWS_FEATURES = [
  'Smart matching across tickers & asset aliases (BTC ↔ Bitcoin, SOL ↔ Solana)',
  'Clear story summaries + key takeaways at a glance',
  'Sentiment tagging (positive · neutral · negative) to read faster',
  'Filters out noise — keeps only impactful and time-sensitive updates',
];

/* ---------- Animated browser mockup ---------- */
const GRADIENT_COLORS = ['#26AFFF', '#7dd3fc', '#9e8aef', '#26AFFF'];

interface MockupProps {
  dark: boolean;
  mockupWidth: number;
}

function AnimatedBorderMockup({ dark, mockupWidth }: MockupProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 8000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ).start();
  }, []);

  const borderColor = progress.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: GRADIENT_COLORS,
  });

  // Scale the table image height proportionally to its width
  const imageHeight = Math.round(mockupWidth * 0.52);

  return (
    <View style={{ width: mockupWidth, alignSelf: 'center', position: 'relative' }}>
      {/* Stacked plates behind */}
      <View
        style={[
          styles.plate,
          {
            backgroundColor: dark ? '#1E2938' : '#D1D5DB',
            transform: [{ rotate: '7deg' }, { translateY: 6 }],
            opacity: 0.5,
          },
        ]}
      />
      <View
        style={[
          styles.plate,
          {
            backgroundColor: dark ? '#1E2938' : '#D1D5DB',
            transform: [{ rotate: '-7deg' }],
            opacity: 0.7,
          },
        ]}
      />

      {/* Animated border card */}
      <Animated.View
        style={[
          styles.borderRing,
          {
            borderColor,
            backgroundColor: dark ? '#000000' : '#FFFFFF',
          },
        ]}
      >
        {/* Browser chrome */}
        <View
          style={[
            styles.browserChrome,
            {
              borderBottomColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            },
          ]}
        >
          <View style={styles.trafficLights}>
            <View style={[styles.dot, { backgroundColor: '#ff5f57' }]} />
            <View style={[styles.dot, { backgroundColor: '#ffbd2e' }]} />
            <View style={[styles.dot, { backgroundColor: '#28c840' }]} />
          </View>
          <View
            style={[
              styles.urlBar,
              { borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
            ]}
          >
            <Text
              style={[styles.urlText, { color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'] }]}
              numberOfLines={1}
            >
              https://beta.anode.news/watchlists
            </Text>
          </View>
        </View>

        <Image
          source={require('../../assets/watchlists/watchlist-table.png')}
          style={{ width: '100%', height: imageHeight }}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Live badge */}
      <View
        style={[
          styles.badge,
          {
            backgroundColor: dark ? 'rgba(7,205,165,0.15)' : 'rgba(5,150,105,0.12)',
            borderColor: dark ? 'rgba(7,205,165,0.4)' : 'rgba(5,150,105,0.35)',
          },
        ]}
      >
        <View
          style={[
            styles.badgeDot,
            { backgroundColor: WatchlistColors.tickerUp[dark ? 'dark' : 'light'] },
          ]}
        />
        <Text style={[styles.badgeText, { color: WatchlistColors.tickerUp[dark ? 'dark' : 'light'] }]}>
          Watchlist · Realtime
        </Text>
      </View>
    </View>
  );
}

/* ---------- FAQ accordion item — animated expand/collapse ---------- */
function FaqItem({ q, a, dark }: { q: string; a: string; dark: boolean }) {
  const [open, setOpen] = useState(false);
  const heightAnim  = useRef(new Animated.Value(0)).current;
  const rotateAnim  = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    const toVal = next ? 1 : 0;
    // Height uses JS driver (layout property); rotation uses native driver
    Animated.timing(heightAnim, {
      toValue: toVal,
      duration: 260,
      useNativeDriver: false,
    }).start();
    Animated.timing(rotateAnim, {
      toValue: toVal,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const maxHeight = heightAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 200] });
  const rotate    = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View
      style={[
        styles.faqItem,
        {
          backgroundColor: dark ? '#0D1117' : '#FFFFFF',
          borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
        },
      ]}
    >
      <TouchableOpacity
        onPress={toggle}
        style={styles.faqSummary}
        activeOpacity={0.75}
      >
        <Text style={[styles.faqQuestion, { color: dark ? '#EEEEEF' : '#111827' }]}>
          {q}
        </Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons
            name="chevron-down"
            size={18}
            color={WatchlistColors.textSecondary[dark ? 'dark' : 'light']}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Content is always mounted; maxHeight drives open/close */}
      <Animated.View style={{ overflow: 'hidden', maxHeight }}>
        <View style={styles.faqDetails}>
          <Text style={[styles.faqAnswer, { color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'] }]}>
            {a}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

/* ---------- News image card ---------- */
function NewsCard({
  source,
  title,
  subtitle,
  dark,
  style,
}: {
  source: any;
  title: string;
  subtitle: string;
  dark: boolean;
  style?: any;
}) {
  return (
    <View
      style={[
        styles.newsImageCard,
        {
          backgroundColor: dark ? '#111827' : '#FFFFFF',
          borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
        },
        style,
      ]}
    >
      <Image source={source} style={styles.newsImage} resizeMode="cover" />
      <View
        style={[
          styles.newsCaption,
          { borderTopColor: WatchlistColors.border[dark ? 'dark' : 'light'] },
        ]}
      >
        <Text style={[styles.newsCaptionTitle, { color: dark ? '#EEEEEF' : '#111827' }]}>
          {title}
        </Text>
        <Text style={[styles.newsCaptionSub, { color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'] }]}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

/* ---------- Main component ---------- */
export default function WatchlistLanding() {
  const dark = useColorScheme() === 'dark';
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;

  const px = isWide ? 40 : 20;
  const mockupWidth = isWide ? Math.min(width * 0.45, 480) : width - 40;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: dark ? '#050B14' : '#F3F4F6' }}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HERO ── */}
      <View
        style={[
          styles.heroSection,
          { paddingHorizontal: px },
          isWide && styles.heroSectionWide,
        ]}
      >
        {/* Left: text + CTA */}
        <View style={[styles.heroLeft, isWide && styles.heroLeftWide]}>
          <Text
            style={[
              styles.heroTitle,
              { color: dark ? '#EEEEEF' : '#111827' },
              isWide && styles.heroTitleWide,
              !isWide && { textAlign: 'center' },
            ]}
          >
            Make Crucial Investment Decisions with{' '}
            <Text style={{ color: WatchlistColors.primary }}>Watchlists</Text>
          </Text>

          <Text
            style={[
              styles.heroSubtitle,
              { color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'] },
              !isWide && { textAlign: 'center', alignSelf: 'center' },
            ]}
          >
            Track the coins you care about—real-time price, 24h change, volume, market
            cap, and news alerts in one clean list.
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/login')}
            style={[styles.ctaButton, !isWide && { alignSelf: 'center' }]}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>

        {/* Right: browser mockup */}
        <View style={[styles.heroRight, isWide && styles.heroRightWide]}>
          <AnimatedBorderMockup dark={dark} mockupWidth={mockupWidth} />
        </View>
      </View>

      {/* ── NEWS INTELLIGENCE ── */}
      <View
        style={[
          styles.newsSection,
          { paddingHorizontal: px, backgroundColor: dark ? '#0D1117' : '#FFFFFF' },
          isWide && styles.newsSectionWide,
        ]}
      >
        {/* Left: copy + feature list */}
        <View style={[styles.newsCopy, isWide && styles.newsCopyWide]}>
          <Text style={styles.sectionOverline}>Watchlist · Intelligence</Text>
          <Text style={[styles.sectionTitle, { color: dark ? '#EEEEEF' : '#111827' }]}>
            News that actually matters to your coins
          </Text>
          <Text
            style={[
              styles.sectionSubtitle,
              { color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'] },
            ]}
          >
            We summarize the most relevant stories from top sources, group duplicates,
            highlight sentiment shifts, and surface the critical events that can move
            markets.
          </Text>

          <View style={styles.featureList}>
            {WATCHLIST_NEWS_FEATURES.map((feature, i) => (
              <View key={i} style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={WatchlistColors.tickerUp[dark ? 'dark' : 'light']}
                />
                <Text style={[styles.featureText, { color: dark ? '#EEEEEF' : '#111827' }]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Right: news screenshots */}
        <View style={[styles.newsImages, isWide && styles.newsImagesWide]}>
          <NewsCard
            source={require('../../assets/watchlists/watchlist-news.png')}
            title="Related News & Analysis"
            subtitle="Auto-curated for your watchlist"
            dark={dark}
          />
          <NewsCard
            source={require('../../assets/watchlists/watchlist-news2.png')}
            title="Summaries · Takeaways · Sentiment"
            subtitle="Good · Neutral · Bad"
            dark={dark}
            style={isWide ? { marginTop: 0, marginLeft: 0 } : { marginTop: 12 }}
          />
        </View>
      </View>

      {/* ── FAQ ── */}
      <View style={[styles.faqSection, { paddingHorizontal: px }]}>
        <Text style={[styles.faqTitle, { color: dark ? '#EEEEEF' : '#111827' }]}>
          Frequently asked questions
        </Text>
        {/* On wide screens, render FAQ in two columns */}
        {isWide ? (
          <View style={styles.faqGrid}>
            <View style={styles.faqCol}>
              {FAQ_ITEMS.slice(0, 2).map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} dark={dark} />
              ))}
            </View>
            <View style={styles.faqCol}>
              {FAQ_ITEMS.slice(2).map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} dark={dark} />
              ))}
            </View>
          </View>
        ) : (
          FAQ_ITEMS.map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} dark={dark} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

/* ---------- Static styles (not dark-mode dependent) ---------- */
const styles = StyleSheet.create({
  /* Hero */
  heroSection: {
    paddingTop: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },
  heroSectionWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 32,
  },
  heroLeft: {
    width: '100%',
    alignItems: 'flex-start',
  },
  heroLeftWide: {
    flex: 1,
    alignItems: 'flex-start',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 36,
    marginBottom: 12,
  },
  heroTitleWide: {
    fontSize: 34,
    lineHeight: 44,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 400,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WatchlistColors.primary,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 13,
    marginBottom: 36,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  heroRight: {
    width: '100%',
    alignItems: 'center',
  },
  heroRightWide: {
    flex: 1,
    alignItems: 'flex-end',
  },

  /* Mockup */
  plate: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  borderRing: {
    borderWidth: 3,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: WatchlistColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
  browserChrome: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  trafficLights: {
    flexDirection: 'row',
    gap: 5,
    marginRight: 10,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  urlBar: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  urlText: {
    fontSize: 10,
  },
  badge: {
    position: 'absolute',
    top: 28,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  /* News section */
  newsSection: {
    paddingVertical: 40,
  },
  newsSectionWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 32,
  },
  newsCopy: {
    width: '100%',
  },
  newsCopyWide: {
    flex: 1,
  },
  sectionOverline: {
    fontSize: 11,
    fontWeight: '700',
    color: WatchlistColors.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 24,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  newsImages: {
    marginTop: 28,
    gap: 12,
  },
  newsImagesWide: {
    flex: 1,
    marginTop: 0,
  },
  newsImageCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  newsImage: {
    width: '100%',
    height: 160,
  },
  newsCaption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  newsCaptionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  newsCaptionSub: {
    fontSize: 11,
  },

  /* FAQ */
  faqSection: {
    paddingVertical: 40,
  },
  faqTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  faqGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  faqCol: {
    flex: 1,
    gap: 8,
  },
  faqItem: {
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  faqSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
    lineHeight: 20,
  },
  faqDetails: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 21,
  },
});
