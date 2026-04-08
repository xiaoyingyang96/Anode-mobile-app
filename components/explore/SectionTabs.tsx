import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import { WatchlistColors, Colors } from '@/constants/theme';
import { MobileSectionId } from '@/types/explore';

const SECTIONS: { id: MobileSectionId; label: string }[] = [
  { id: 'assets', label: 'Assets' },
  { id: 'top_stories', label: 'Top Stories' },
  { id: 'daily_recaps', label: 'Daily Recaps' },
  { id: 'policy_updates', label: 'Policy Updates' },
];

interface SectionTabsProps {
  active: MobileSectionId;
  onChange: (id: MobileSectionId) => void;
}

export default function SectionTabs({ active, onChange }: SectionTabsProps) {
  const dark = useColorScheme() === 'dark';
  const s = makeStyles(dark);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.container}
    >
      {SECTIONS.map((section) => {
        const isActive = section.id === active;
        return (
          <TouchableOpacity
            key={section.id}
            onPress={() => onChange(section.id)}
            style={[s.tab, isActive && s.tabActive]}
            activeOpacity={0.7}
          >
            <Text style={[s.tabText, isActive && s.tabTextActive]}>
              {section.label}
            </Text>
            {isActive && <View style={s.indicator} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingHorizontal: 2,
      gap: 4,
    },
    tab: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      position: 'relative',
    },
    tabActive: {
      backgroundColor: WatchlistColors.tabActiveBg[dark ? 'dark' : 'light'],
    },
    tabText: {
      fontSize: 13,
      fontWeight: '500',
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
    },
    tabTextActive: {
      color: WatchlistColors.primary,
      fontWeight: '700',
    },
    indicator: {
      position: 'absolute',
      bottom: 0,
      left: 14,
      right: 14,
      height: 2,
      borderRadius: 999,
      backgroundColor: WatchlistColors.primary,
    },
  });
