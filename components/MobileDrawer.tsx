/**
 * MobileDrawer — faithful port of SentimentX's MobileDrawer + MobileBottomSheet.
 *
 * Structure (top → bottom):
 *   ── drag handle pill ──
 *   Main Navigations   (Home / Explore / Watchlists)
 *   ─────────────────────────────
 *   Profile & Preferences
 *     Notifications · Account & Settings · Support
 *     ─── Login / Logout (coloured action row) ───
 *
 * Animation: sheet slides up from bottom (spring in, timing out) with a
 * dimmed backdrop that fades in/out — mirrors MobileBottomSheet's SwipeableDrawer.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Appearance,
  Modal,
  View,
  Text,
  Switch,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { WatchlistColors } from '@/constants/theme';

// ─── Nav items — matches SentimentX MainNavigations pages ────────────────────

const NAV_ITEMS = [
  { title: 'Home',       route: '/',           icon: 'home-outline',     iconActive: 'home'           },
  { title: 'Explore',    route: '/explore',    icon: 'compass-outline',  iconActive: 'compass'        },
  { title: 'Watchlists', route: '/watchlists', icon: 'bookmark-outline', iconActive: 'bookmark'       },
] as const;

// ─── Types ───────────────────────────────────────────────────────────────────

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Section label — mirrors SentimentX's uppercase caption style ─────────────

function SectionLabel({ label, dark }: { label: string; dark: boolean }) {
  return (
    <Text style={[styles.sectionLabel, { color: dark ? '#AEB0B4' : '#4B5563' }]}>
      {label}
    </Text>
  );
}

// ─── Single navigation row ────────────────────────────────────────────────────

function NavItem({
  title,
  icon,
  iconActive,
  isActive,
  dark,
  onPress,
}: {
  title: string;
  icon: string;
  iconActive: string;
  isActive: boolean;
  dark: boolean;
  onPress: () => void;
}) {
  const bg   = isActive
    ? (dark ? 'rgba(38,175,255,0.14)' : 'rgba(38,175,255,0.08)')
    : 'transparent';
  const textColor  = isActive ? WatchlistColors.primary : (dark ? '#EEEEEF' : '#111827');
  const borderColor = isActive
    ? (dark ? 'rgba(38,175,255,0.3)' : 'rgba(38,175,255,0.2)')
    : (dark ? '#1F2937' : '#E5E7EB');

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.navItem, { backgroundColor: bg, borderColor }]}
    >
      <Ionicons
        name={(isActive ? iconActive : icon) as any}
        size={20}
        color={textColor}
        style={styles.navIcon}
      />
      <Text style={[styles.navLabel, { color: textColor, fontWeight: isActive ? '600' : '500' }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Profile action row ───────────────────────────────────────────────────────

function ProfileItem({
  icon,
  label,
  onPress,
  dark,
  danger,
  primary,
  right,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
  dark: boolean;
  danger?: boolean;
  primary?: boolean;
  right?: React.ReactNode;
}) {
  const textColor = danger
    ? '#DC2626'
    : primary
    ? WatchlistColors.primary
    : dark ? '#EEEEEF' : '#111827';
  const bg = danger
    ? (dark ? 'rgba(220,38,38,0.07)' : 'rgba(220,38,38,0.05)')
    : primary
    ? (dark ? 'rgba(38,175,255,0.07)' : 'rgba(38,175,255,0.05)')
    : 'transparent';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.profileItem, { backgroundColor: bg }]}
    >
      <Ionicons name={icon as any} size={18} color={textColor} style={styles.navIcon} />
      <Text style={[styles.navLabel, { color: textColor, fontWeight: danger || primary ? '600' : '500', flex: 1 }]}>
        {label}
      </Text>
      {right}
    </TouchableOpacity>
  );
}

// ─── Main drawer ─────────────────────────────────────────────────────────────

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const dark   = useColorScheme() === 'dark';
  const router = useRouter();
  const path   = usePathname();
  const { user, signOut } = useAuth();

  // Keep modal mounted during close animation
  const [visible, setVisible] = useState(false);

  const slideAnim   = useRef(new Animated.Value(600)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      Animated.parallel([
        Animated.spring(slideAnim,    { toValue: 0,   useNativeDriver: true, bounciness: 0, speed: 18 }),
        Animated.timing(backdropAnim, { toValue: 1,   duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim,    { toValue: 600, duration: 260, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0,   duration: 200, useNativeDriver: true }),
      ]).start(() => setVisible(false));
    }
  }, [isOpen]);

  const navigate = (route: string) => {
    onClose();
    // Small delay lets the close animation start before navigation re-renders
    setTimeout(() => router.push(route as any), 50);
  };

  const handleLogout = async () => {
    onClose();
    await signOut();
  };

  const sheetBg   = dark ? '#111827' : '#FFFFFF';
  const dividerBg = dark ? '#1F2937' : '#E5E7EB';
  const handleBg  = dark ? '#374151' : '#D1D5DB';

  // Determine active route — normalize tab paths
  const isActive = (route: string) => {
    if (route === '/') return path === '/' || path === '/index' || path === '/(tabs)' || path === '/(tabs)/index';
    return path.includes(route.replace('/', ''));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Dimmed backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Bottom sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: sheetBg, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Drag handle — matches MobileBottomSheet's 40×4 pill */}
        <View style={styles.handleRow}>
          <View style={[styles.handle, { backgroundColor: handleBg }]} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Main Navigations ─────────────────────────── */}
          <SectionLabel label="Main Navigation" dark={dark} />
          <View style={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.route}
                title={item.title}
                icon={item.icon}
                iconActive={item.iconActive}
                isActive={isActive(item.route)}
                dark={dark}
                onPress={() => navigate(item.route)}
              />
            ))}
          </View>

          {/* ── Divider ───────────────────────────────────── */}
          <View style={[styles.divider, { backgroundColor: dividerBg }]} />

          {/* ── Profile & Preferences ─────────────────────── */}
          <SectionLabel label="Profile & Preferences" dark={dark} />
          <View style={styles.profileList}>
            <ProfileItem
              icon="notifications-outline"
              label="Notifications"
              dark={dark}
              onPress={onClose}
            />
            {user && (
              <ProfileItem
                icon="settings-outline"
                label="Account & Settings"
                dark={dark}
                onPress={onClose}
              />
            )}
            <ProfileItem
              icon="help-circle-outline"
              label="Support"
              dark={dark}
              onPress={onClose}
            />
            {/* Theme toggle — mirrors SentimentX ProfileSection ThemeModeToggler */}
            <ProfileItem
              icon="color-palette-outline"
              label="Theme"
              dark={dark}
              right={
                <Switch
                  value={dark}
                  onValueChange={() => {
                    const scheme = dark ? 'light' : 'dark';
                    const app = (Appearance as any)?.default ?? Appearance;
                    app?.setColorScheme?.(scheme);
                  }}
                  trackColor={{ false: '#E5E7EB', true: 'rgba(38,175,255,0.35)' }}
                  thumbColor={dark ? WatchlistColors.primary : '#9CA3AF'}
                  ios_backgroundColor="#E5E7EB"
                />
              }
            />
          </View>

          {/* ── Auth action ───────────────────────────────── */}
          <View style={[styles.divider, { backgroundColor: dividerBg, marginTop: 4 }]} />
          {user ? (
            <ProfileItem
              icon="log-out-outline"
              label="Logout"
              dark={dark}
              danger
              onPress={handleLogout}
            />
          ) : (
            <ProfileItem
              icon="log-in-outline"
              label="Log in / Sign up"
              dark={dark}
              primary
              onPress={() => navigate('/login')}
            />
          )}

        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '82%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    // Shadow for the sheet edge
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 24,
  },
  handleRow: {
    paddingTop: 10,
    paddingBottom: 6,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 999,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 36,
    gap: 6,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 6,
    marginLeft: 4,
  },
  navList: {
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  navIcon: {
    marginRight: 12,
  },
  navLabel: {
    fontSize: 15,
  },
  profileList: {
    gap: 2,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  divider: {
    height: 1,
    marginVertical: 8,
    borderRadius: 1,
  },
});
