import React from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WatchlistColors } from '@/constants/theme';

interface EmptyAssetListProps {
  onAddAssetsOpen: () => void;
}

const SUGGESTIONS = ['BTC', 'ETH', 'SOL', 'ARB'];

export default function EmptyAssetList({ onAddAssetsOpen }: EmptyAssetListProps) {
  const dark = useColorScheme() === 'dark';
  const s = makeStyles(dark);

  return (
    <View style={s.container}>
      <Ionicons
        name="bookmark-outline"
        size={72}
        color={WatchlistColors.primary}
        style={s.icon}
      />

      <Text style={s.title}>Your watchlist is empty</Text>

      <Text style={s.subtitle}>
        Add assets to start tracking real-time prices, changes and more.
      </Text>

      <View style={s.suggestions}>
        {SUGGESTIONS.map((ticker) => (
          <TouchableOpacity key={ticker} onPress={onAddAssetsOpen} style={s.chip} activeOpacity={0.7}>
            <Text style={s.chipText}>{ticker}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={onAddAssetsOpen} style={s.addButton} activeOpacity={0.85}>
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={s.addButtonText}>Add Assets</Text>
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      minHeight: 400,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: dark ? 'rgba(174,176,180,0.3)' : 'rgba(75,85,99,0.25)',
      borderRadius: 16,
      marginHorizontal: 16,
      marginVertical: 8,
    },
    icon: {
      opacity: 0.35,
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: dark ? '#EEEEEF' : '#111827',
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 20,
    },
    suggestions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'center',
      marginBottom: 24,
    },
    chip: {
      backgroundColor: WatchlistColors.primaryMuted,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    chipText: {
      color: WatchlistColors.primary,
      fontWeight: '600',
      fontSize: 13,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: WatchlistColors.primary,
      borderRadius: 10,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    addButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 15,
    },
  });
