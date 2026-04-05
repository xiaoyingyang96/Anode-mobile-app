import { useColorScheme } from '@/hooks/use-color-scheme';
import { PolicyUpdatesSection } from '@/screens/ExploreScreen';
import React from 'react';
import { View } from 'react-native';

export default function PolicyUpdatesTab() {
  const dark = useColorScheme() === 'dark';
  return (
    <View style={{ flex: 1, backgroundColor: dark ? '#050B14' : '#F3F4F6' }}>
      <PolicyUpdatesSection dark={dark} />
    </View>
  );
}