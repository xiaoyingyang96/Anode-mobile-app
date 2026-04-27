import { WatchlistColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AssetsSection, TopStoriesSection } from '@/screens/ExploreScreen';
import MobileDailyRecapsSection from '@/screens/explore/MobileDailyRecapsSection';
import MobilePolicyUpdatesSection from '@/screens/explore/MobilePolicyUpdatesSection';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

type Tab = 'assets' | 'stories' | 'recaps' | 'policy';

const TABS: { id: Tab; label: string }[] = [
  { id: 'assets', label: 'Assets' },
  { id: 'stories', label: 'Top Stories' },
  { id: 'recaps', label: 'Daily Recaps' },
  { id: 'policy', label: 'Policy Updates' },
];

export default function ExploreTab() {
  const dark = useColorScheme() === 'dark';
  const [activeTab, setActiveTab] = useState<Tab>('assets');
  const border = dark ? '#1F2937' : '#E5E7EB';
  const bg = dark ? '#050B14' : '#F3F4F6';

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* Top tab bar */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: border, backgroundColor: dark ? '#0D1117' : '#FFFFFF' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 0 }}>
          {TABS.map(tab => {
            const isActive = tab.id === activeTab;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={{ paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: isActive ? WatchlistColors.primary : 'transparent' }}
              >
                <Text style={{ fontSize: 13, fontWeight: isActive ? '700' : '500', color: isActive ? WatchlistColors.primary : (dark ? '#AEB0B4' : '#4B5563') }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'assets' && <AssetsSection dark={dark} />}
        {activeTab === 'stories' && <TopStoriesSection dark={dark} />}
        {activeTab === 'recaps' && <MobileDailyRecapsSection />}
        {activeTab === 'policy' && <MobilePolicyUpdatesSection />}
      </View>
    </View>
  );
}