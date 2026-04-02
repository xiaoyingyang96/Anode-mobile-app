import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WatchlistColors } from '@/constants/theme';
import { Watchlist } from '@/types/watchlist';

interface WatchlistTopbarProps {
  watchlists: Watchlist[];
  activeId: number;
  onSelectWatchlist: (id: number) => void;
  onRequestDelete: (id: number) => void;
  onCreateNew: () => void;
}

interface WatchlistTabProps {
  wl: Watchlist;
  isActive: boolean;
  dark: boolean;
  s: ReturnType<typeof makeStyles>;
  onSelect: () => void;
  onRequestDelete: (id: number) => void;
}

function WatchlistTab({ wl, isActive, dark, s, onSelect, onRequestDelete }: WatchlistTabProps) {
  // Close button fade — port of SentimentX opacity 0→1 on selected/hover (0.2s)
  const closeOpacity = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(closeOpacity, {
      toValue: isActive ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isActive]);

  return (
    <TouchableOpacity
      onPress={onSelect}
      style={[s.tab, isActive && s.tabActive]}
      activeOpacity={0.75}
    >
      <Text style={[s.tabLabel, isActive && s.tabLabelActive]} numberOfLines={1}>
        {wl.name}
      </Text>

      <View style={[s.countBadge, isActive && s.countBadgeActive]}>
        <Text style={[s.countText, isActive && s.countTextActive]}>
          {wl.assets_count}
        </Text>
      </View>

      {!wl.is_default && (
        <Animated.View style={[s.closeBtn, { opacity: closeOpacity }]}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onRequestDelete(wl.id);
            }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons
              name="close"
              size={13}
              color={isActive ? WatchlistColors.primary : WatchlistColors.textSecondary[dark ? 'dark' : 'light']}
            />
          </TouchableOpacity>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
}

export default function WatchlistTopbar({
  watchlists,
  activeId,
  onSelectWatchlist,
  onRequestDelete,
  onCreateNew,
}: WatchlistTopbarProps) {
  const dark = useColorScheme() === 'dark';
  const s = makeStyles(dark);

  return (
    <View style={s.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
      >
        {watchlists.map((wl) => (
          <WatchlistTab
            key={wl.id}
            wl={wl}
            isActive={wl.id === activeId}
            dark={dark}
            s={s}
            onSelect={() => onSelectWatchlist(wl.id)}
            onRequestDelete={onRequestDelete}
          />
        ))}
      </ScrollView>

      {/* "+ New Watchlist" button — fixed, does not scroll */}
      <TouchableOpacity onPress={onCreateNew} style={s.newBtn} activeOpacity={0.75}>
        <Ionicons name="add" size={16} color={WatchlistColors.primary} />
        <Text style={s.newBtnText}>New</Text>
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: dark ? '#111827' : '#FFFFFF',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      paddingVertical: 6,
      paddingRight: 8,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 8,
      gap: 4,
      alignItems: 'center',
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      maxWidth: 180,
    },
    tabActive: {
      backgroundColor: WatchlistColors.tabActiveBg[dark ? 'dark' : 'light'],
    },
    tabLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      flexShrink: 1,
    },
    tabLabelActive: {
      color: WatchlistColors.primary,
      fontWeight: '700',
    },
    countBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: dark ? 'rgba(174,176,180,0.2)' : 'rgba(75,85,99,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
    },
    countBadgeActive: {
      backgroundColor: WatchlistColors.primaryMuted,
    },
    countText: {
      fontSize: 11,
      fontWeight: '700',
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
    },
    countTextActive: {
      color: WatchlistColors.primary,
    },
    closeBtn: {
      marginLeft: 2,
    },
    newBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      marginLeft: 4,
    },
    newBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: WatchlistColors.primary,
    },
  });
