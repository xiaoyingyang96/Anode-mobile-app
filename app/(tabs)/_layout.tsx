import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AppHeader from '@/components/AppHeader';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Replace the default navigator header with the SentimentX-style AppHeader
        header: () => <AppHeader />,
        tabBarButton: HapticTab,
        // Hide the tab bar — navigation is handled by the hamburger drawer
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="watchlists"
        options={{
          title: 'Watchlists',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
