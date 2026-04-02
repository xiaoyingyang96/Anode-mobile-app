/**
 * AppHeader — port of SentimentX's Dashboard TopNav.
 *
 * Layout (left → right, matches SentimentX phone layout):
 *   [AnimatedMenuButton]  [Anode logo + wordmark]  [notifications] [avatar]
 *
 * Requires react-native-svg (already installed):
 *   npx expo install react-native-svg
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import AnimatedMenuButton from '@/components/AnimatedMenuButton';
import MobileDrawer from '@/components/MobileDrawer';

// ─── Anode logo icon — faithful inline port of logo-v2.svg ───────────────────

function AnodeLogo({ size = 26 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <LinearGradient
          id="aGrad"
          x1="322.646" y1="177.679"
          x2="181.97"  y2="329.401"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#BDDDFA" />
          <Stop offset="1" stopColor="#5B89D3" />
        </LinearGradient>
      </Defs>
      <Path
        d="M236.418 134.199C183.223 154.861 151.077 149.506 90.121 113.719C233.332 285.943 316.382 332.149 468.383 343.517C337.252 302.752 282.451 260.981 236.418 134.199Z"
        fill="url(#aGrad)"
      />
      <Path
        d="M468.383 343.517C378.741 290.298 336.206 258.309 327.785 182.445C296.545 186.161 278.625 178.722 245.669 142.777C296.05 262.757 353.67 296.646 468.383 343.517Z"
        fill="url(#aGrad)"
      />
      <Path
        d="M468.383 343.517C395.708 348.405 353.709 341.596 275.033 300.523C251.888 332.278 232.744 339.709 184.243 331.508C305.494 377.443 367.214 378.13 468.383 343.517Z"
        fill="url(#aGrad)"
      />
    </Svg>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export default function AppHeader() {
  const dark   = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const bg          = dark ? '#111827' : '#FFFFFF';
  const border      = dark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)';
  const iconColor   = dark ? '#EEEEEF' : '#111827';
  const wordmark    = dark ? '#EEEEEF' : '#111827';

  return (
    <>
      <View style={[styles.wrapper, { backgroundColor: bg, borderBottomColor: border, paddingTop: insets.top }]}>
        <View style={styles.inner}>

          {/* ── Left: hamburger — matches SentimentX isSmallScreen branch ── */}
          <AnimatedMenuButton
            open={drawerOpen}
            onPress={() => setDrawerOpen((v) => !v)}
            color={iconColor}
          />

          {/* ── Centre-left: logo icon + wordmark ── */}
          <View style={styles.logoRow}>
            <AnodeLogo size={24} />
            <Text style={[styles.wordmark, { color: wordmark }]}>Anode</Text>
          </View>

          {/* ── Right: notifications + user avatar — matches SentimentX right cluster ── */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={20} color={iconColor} />
            </TouchableOpacity>

            {/* Avatar: amber gradient when signed in (#F59E0B), grey when anonymous */}
            <View style={[styles.avatar, { backgroundColor: user ? '#F59E0B' : '#9CA3AF' }]}>
              <Ionicons name="person" size={13} color="#fff" />
            </View>
          </View>

        </View>
      </View>

      {/* Drawer is rendered outside the header View so it overlays the full screen */}
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inner: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4,
  },
  logoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginLeft: 4,
  },
  wordmark: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
