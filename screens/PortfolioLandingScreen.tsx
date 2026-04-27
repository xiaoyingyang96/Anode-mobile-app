import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

import { Colors, WatchlistColors } from '@/constants/theme';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

// ─── Copy (matches en-us.json) ───────────────────────────────────────────────

const COPY = {
  hero: {
    heading: "Let's get started with your first portfolio!",
    subheading: 'Track profits, losses and valuation all in one place.',
  },
  options: [
    {
      id: 'coinbase',
      title: 'Connect Coinbase Account',
      description:
        'Securely sync assets from your Coinbase account without using API key.',
      icon: 'logo-bitcoin' as const,
      iconBg: '#0052FF',
      available: true,
    },
    {
      id: 'wallet',
      title: 'Connect Your Wallet',
      description:
        "Simply enter your wallet address (no signature needed!) and we'll sync it right away.",
      icon: 'wallet-outline' as const,
      iconBg: WatchlistColors.primary,
      available: false,
    },
    {
      id: 'manual',
      title: 'Add Transactions Manually',
      description:
        'Enter all transaction details at your own pace to track your portfolio.',
      icon: 'add-circle-outline' as const,
      iconBg: '#059669',
      available: false,
    },
  ],
  preview: {
    emphasis: 'One Dashboard.',
    rest: 'All Of Your Crypto Holdings.',
    description:
      'Connect wallets and exchanges, monitor live balances, and visualize PnL and allocation—all from one secure dashboard.',
    button: 'Start with Coinbase',
  },
  analytics: {
    title: 'Unlock Advanced Analytics',
    subtitle:
      'Real-time insights on allocation, PnL, and wallet activity—so you can act with confidence.',
    button: 'Start with Coinbase',
    totalValue: '$5,201,314',
    performance: '+5.20%',
    chartTitle: 'Maximize Your Investment Potential',
    chartDescription:
      'Turn signals into strategy. Track performance trends, run health checks, and spot top movers.',
    walletTitle: 'Advanced Wallet Analysis',
    features: [
      'Compare activity across chains instantly',
      'Monitor allocations with dynamic, visual breakdowns',
      'Understand wallet flow for enhanced performance',
    ],
  },
  faq: {
    title: 'Get the Answers to All Your Questions',
    subtitle:
      'Everything you need to know about connecting accounts, security, and how syncing works.',
    items: [
      {
        q: 'Is connecting my Coinbase account read-only?',
        a: "Yes. We request OAuth scopes required to read balances and transactions only. We can't move funds or trade on your behalf.",
      },
      {
        q: 'What can I connect today?',
        a: 'Coinbase accounts via OAuth are supported now. Wallet connections and manual entries are on the way.',
      },
      {
        q: 'How often does my portfolio sync?',
        a: 'We refresh on connect and periodically in the background. You can also trigger a manual refresh from the dashboard.',
      },
      {
        q: 'Can I disconnect later?',
        a: `Absolutely. You can revoke the connection from our settings and from Coinbase's "Connected Apps." We remove cached tokens immediately.`,
      },
      {
        q: 'Do you store my API keys or private keys?',
        a: 'No private keys. For exchanges we use OAuth tokens stored securely; for wallets we read on-chain data from public addresses.',
      },
      {
        q: 'Will this affect my trading on Coinbase?',
        a: 'No. Tracking is separate from trading and does not interfere with your existing setup.',
      },
    ],
  },
};

// ─── Donut data ───────────────────────────────────────────────────────────────

const DONUT_DATA = [
  { label: 'BTC', value: 42, color: '#F59E0B' },
  { label: 'ETH', value: 28, color: '#8B5CF6' },
  { label: 'SOL', value: 12, color: '#60A5FA' },
  { label: 'USDC', value: 8, color: '#F472B6' },
  { label: 'Others', value: 10, color: '#A3A3A3' },
];

// ─── Mini SVG line chart ──────────────────────────────────────────────────────

function MiniLineChart() {
  return (
    <Svg width="100%" height={140} viewBox="0 0 320 120">
      <Defs>
        <LinearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#36D1C4" />
          <Stop offset="100%" stopColor="#185ADB" />
        </LinearGradient>
        <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="rgba(24,90,219,0.35)" />
          <Stop offset="100%" stopColor="rgba(54,209,196,0.03)" />
        </LinearGradient>
      </Defs>
      <Path
        d="M0,120 L0,90 C40,100 60,110 80,90 C100,70 120,60 140,80 C160,100 180,90 200,60 C220,40 240,55 260,40 C280,30 300,35 320,30 L320,120 Z"
        fill="url(#areaGrad)"
      />
      <Path
        d="M0,90 C40,100 60,110 80,90 C100,70 120,60 140,80 C160,100 180,90 200,60 C220,40 240,55 260,40 C280,30 300,35 320,30"
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── Allocation donut ─────────────────────────────────────────────────────────

function AllocationDonut({ dark }: { dark: boolean }) {
  const SIZE = 180;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const R_OUTER = 72;
  const R_INNER = 46;

  // Build pie slices manually (no recharts on RN)
  const total = DONUT_DATA.reduce((s, d) => s + d.value, 0);
  let startAngle = -Math.PI / 2;

  function polarToXY(angle: number, r: number) {
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  }

  function slicePath(startA: number, endA: number, ro: number, ri: number) {
    const s1 = polarToXY(startA, ro);
    const e1 = polarToXY(endA, ro);
    const s2 = polarToXY(endA, ri);
    const e2 = polarToXY(startA, ri);
    const large = endA - startA > Math.PI ? 1 : 0;
    return `M ${s1.x} ${s1.y} A ${ro} ${ro} 0 ${large} 1 ${e1.x} ${e1.y} L ${s2.x} ${s2.y} A ${ri} ${ri} 0 ${large} 0 ${e2.x} ${e2.y} Z`;
  }

  const slices = DONUT_DATA.map((d) => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const end = startAngle + sweep - 0.03; // small gap
    const path = slicePath(startAngle, end, R_OUTER, R_INNER);
    startAngle += sweep;
    return { ...d, path };
  });

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={SIZE} height={SIZE}>
        {slices.map((s) => (
          <Path key={s.label} d={s.path} fill={s.color} />
        ))}
      </Svg>
      {/* Legend */}
      <View style={donutStyles.legend}>
        {DONUT_DATA.map((d) => (
          <View key={d.label} style={donutStyles.legendItem}>
            <View style={[donutStyles.dot, { backgroundColor: d.color }]} />
            <Text style={[donutStyles.legendText, { color: dark ? '#D1D5DB' : '#374151' }]}>
              {d.label} {d.value}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const donutStyles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontWeight: '600' },
});

// ─── FAQ accordion item ───────────────────────────────────────────────────────

function FaqItem({
  q,
  a,
  dark,
}: {
  q: string;
  a: string;
  dark: boolean;
}) {
  const [open, setOpen] = useState(false);
  const s = faqStyles(dark);
  return (
    <View style={s.card}>
      <TouchableOpacity
        style={s.row}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.7}
      >
        <Text style={s.question}>{q}</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={WatchlistColors.textSecondary[dark ? 'dark' : 'light']}
        />
      </TouchableOpacity>
      {open && <Text style={s.answer}>{a}</Text>}
    </View>
  );
}

const faqStyles = (dark: boolean) =>
  StyleSheet.create({
    card: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      backgroundColor: dark ? '#0D1117' : '#FFFFFF',
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
      gap: 12,
    },
    question: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: dark ? '#EEEEEF' : '#111827',
      lineHeight: 20,
    },
    answer: {
      fontSize: 13,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      lineHeight: 19,
      paddingHorizontal: 14,
      paddingBottom: 14,
    },
  });

// ─── Section divider ──────────────────────────────────────────────────────────

function Divider({ dark }: { dark: boolean }) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: WatchlistColors.border[dark ? 'dark' : 'light'],
        marginVertical: 32,
      }}
    />
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PortfolioLandingScreen() {
  const dark = useColorScheme() === 'dark';
  const s = makeStyles(dark);

  const handleConnect = () => {
    // Navigate to Coinbase OAuth — same endpoint as web app
    const url = `${API_BASE}/api/auth/coinbase`;
    Linking.openURL(url);
  };

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <View style={s.heroSection}>
        {/* Badge icon */}
        <View style={s.heroBadge}>
          <View style={s.heroBadgeInner}>
            <Ionicons name="trending-up" size={24} color="#FFFFFF" />
          </View>
        </View>

        <Text style={s.heroHeading}>{COPY.hero.heading}</Text>
        <Text style={s.heroSubheading}>{COPY.hero.subheading}</Text>
      </View>

      {/* ── CONNECTION OPTIONS ────────────────────────────────────────── */}
      <View style={s.optionsStack}>
        {COPY.options.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            style={[s.optionCard, !opt.available && s.optionCardDisabled]}
            onPress={opt.available ? handleConnect : undefined}
            activeOpacity={opt.available ? 0.75 : 1}
          >
            <View style={[s.optionIcon, { backgroundColor: opt.iconBg }]}>
              <Ionicons name={opt.icon} size={22} color="#FFFFFF" />
            </View>
            <View style={s.optionBody}>
              <View style={s.optionTitleRow}>
                <Text style={s.optionTitle}>{opt.title}</Text>
                {!opt.available && (
                  <View style={s.comingSoonBadge}>
                    <Text style={s.comingSoonText}>Coming Soon</Text>
                  </View>
                )}
              </View>
              <Text style={s.optionDesc}>{opt.description}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={WatchlistColors.textSecondary[dark ? 'dark' : 'light']}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Divider dark={dark} />

      {/* ── PREVIEW ───────────────────────────────────────────────────── */}
      <View style={s.section}>
        <Text style={s.previewHeading}>
          <Text style={s.previewEmphasis}>{COPY.preview.emphasis} </Text>
          {COPY.preview.rest}
        </Text>
        <Text style={s.previewDesc}>{COPY.preview.description}</Text>
        <TouchableOpacity style={s.primaryBtn} onPress={handleConnect} activeOpacity={0.85}>
          <Text style={s.primaryBtnText}>{COPY.preview.button}</Text>
          <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Divider dark={dark} />

      {/* ── ANALYTICS ─────────────────────────────────────────────────── */}
      <View style={s.section}>
        <Text style={s.analyticsTitle}>{COPY.analytics.title}</Text>
        <Text style={s.analyticsSubtitle}>{COPY.analytics.subtitle}</Text>
        <TouchableOpacity style={s.primaryBtn} onPress={handleConnect} activeOpacity={0.85}>
          <Text style={s.primaryBtnText}>{COPY.analytics.button}</Text>
          <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Portfolio value card */}
        <View style={s.chartCard}>
          <View style={s.chartCardHeader}>
            <Text style={s.chartTotalValue}>{COPY.analytics.totalValue}</Text>
            <View style={s.performanceBadge}>
              <Text style={s.performanceText}>{COPY.analytics.performance}</Text>
            </View>
          </View>
          <MiniLineChart />
          <Text style={s.chartCardTitle}>{COPY.analytics.chartTitle}</Text>
          <Text style={s.chartCardDesc}>{COPY.analytics.chartDescription}</Text>
        </View>

        {/* Allocation donut card */}
        <View style={s.donutCard}>
          <AllocationDonut dark={dark} />
          <Text style={s.donutTitle}>{COPY.analytics.walletTitle}</Text>
          {COPY.analytics.features.map((f, i) => (
            <View key={i} style={s.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
              <Text style={s.featureText}>{f}</Text>
            </View>
          ))}
        </View>
      </View>

      <Divider dark={dark} />

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <View style={s.section}>
        <Text style={s.faqTitle}>{COPY.faq.title}</Text>
        <Text style={s.faqSubtitle}>{COPY.faq.subtitle}</Text>
        <View style={s.faqList}>
          {COPY.faq.items.map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} dark={dark} />
          ))}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: Colors[dark ? 'dark' : 'light'].background,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },

    // Hero
    heroSection: {
      alignItems: 'center',
      textAlign: 'center',
      marginBottom: 28,
      gap: 12,
    },
    heroBadge: {
      width: 72,
      height: 72,
      borderRadius: 16,
      backgroundColor: WatchlistColors.primaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroBadgeInner: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: WatchlistColors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroHeading: {
      fontSize: 22,
      fontWeight: '800',
      color: dark ? '#EEEEEF' : '#111827',
      textAlign: 'center',
      lineHeight: 30,
    },
    heroSubheading: {
      fontSize: 15,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      textAlign: 'center',
      lineHeight: 22,
    },

    // Connection options
    optionsStack: { gap: 10, marginBottom: 4 },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      backgroundColor: dark ? '#0D1117' : '#FFFFFF',
      padding: 14,
    },
    optionCardDisabled: { opacity: 0.5 },
    optionIcon: {
      width: 44,
      height: 44,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    optionBody: { flex: 1, gap: 4 },
    optionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    optionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: dark ? '#EEEEEF' : '#111827',
    },
    comingSoonBadge: {
      backgroundColor: dark ? '#1F2937' : '#E5E7EB',
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    comingSoonText: {
      fontSize: 10,
      fontWeight: '600',
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
    },
    optionDesc: {
      fontSize: 12,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      lineHeight: 17,
    },

    // Shared section
    section: { gap: 14 },

    // Preview section
    previewHeading: {
      fontSize: 22,
      fontWeight: '700',
      color: dark ? '#EEEEEF' : '#111827',
      lineHeight: 30,
    },
    previewEmphasis: {
      color: WatchlistColors.primary,
    },
    previewDesc: {
      fontSize: 14,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      lineHeight: 21,
    },

    // Buttons
    primaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: WatchlistColors.primary,
      borderRadius: 10,
      paddingVertical: 13,
      paddingHorizontal: 20,
      alignSelf: 'flex-start',
    },
    primaryBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    // Analytics
    analyticsTitle: {
      fontSize: 22,
      fontWeight: '900',
      color: WatchlistColors.primary,
      lineHeight: 30,
    },
    analyticsSubtitle: {
      fontSize: 14,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      lineHeight: 21,
    },
    chartCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      backgroundColor: dark ? '#0D1117' : '#FFFFFF',
      padding: 16,
      gap: 10,
    },
    chartCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    chartTotalValue: {
      fontSize: 20,
      fontWeight: '800',
      color: dark ? '#EEEEEF' : '#111827',
    },
    performanceBadge: {
      backgroundColor: 'rgba(5,150,105,0.15)',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    performanceText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#059669',
    },
    chartCardTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: dark ? '#EEEEEF' : '#111827',
    },
    chartCardDesc: {
      fontSize: 13,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      lineHeight: 19,
    },
    donutCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      backgroundColor: dark ? '#0D1117' : '#FFFFFF',
      padding: 16,
      gap: 12,
      alignItems: 'center',
    },
    donutTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: dark ? '#EEEEEF' : '#111827',
      alignSelf: 'flex-start',
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      alignSelf: 'stretch',
    },
    featureText: {
      flex: 1,
      fontSize: 13,
      color: dark ? '#D1D5DB' : '#374151',
      lineHeight: 19,
    },

    // FAQ
    faqTitle: {
      fontSize: 22,
      fontWeight: '900',
      color: dark ? '#EEEEEF' : '#111827',
      lineHeight: 30,
    },
    faqSubtitle: {
      fontSize: 14,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      lineHeight: 21,
    },
    faqList: { gap: 8 },
  });
