import AppHeader from '@/components/AppHeader';
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        header: () => <AppHeader />,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: isDark ? '#050B14' : '#FFFFFF',
          borderTopColor: isDark ? '#1F2937' : '#E5E7EB',
        },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Assets',
          tabBarIcon: ({ color }) => <Ionicons name="bar-chart-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="top-stories"
        options={{
          title: 'Stories',
          tabBarIcon: ({ color }) => <Ionicons name="newspaper-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="daily-recaps"
        options={{
          title: 'Recaps',
          tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="policy-updates"
        options={{
          title: 'Policy',
          tabBarIcon: ({ color }) => <Ionicons name="document-text-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <Ionicons name={focused ? 'newspaper' : 'newspaper-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="watchlists"
        options={{
          title: 'Watchlist',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}