import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { WatchlistColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useWatchlists } from '@/hooks/useWatchlists';
import CreateWatchlistModal from './watchlists/CreateWatchlistModal';
import WatchlistDashboard from './watchlists/WatchlistDashboard';
import WatchlistLanding from './watchlists/WatchlistLanding';

export default function WatchlistsScreen() {
  const dark = useColorScheme() === 'dark';
  const s = makeStyles(dark);
  const { user, isLoading: authLoading } = useAuth();
  const { watchlists, isLoading, error, refetch } = useWatchlists();
  const [createOpen, setCreateOpen] = useState(false);

  if (authLoading || (user && isLoading)) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={WatchlistColors.primary} />
      </View>
    );
  }

  if (!user) {
    return <WatchlistLanding />;
  }

  if (error || watchlists === null) {
    return (
      <View style={s.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={WatchlistColors.deleteRed} />
        <Text style={s.errorTitle}>Something went wrong</Text>
        <Text style={s.errorSubtitle}>{error ?? 'Failed to load watchlists.'}</Text>
        <TouchableOpacity onPress={refetch} style={s.retryBtn} activeOpacity={0.85}>
          <Text style={s.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (watchlists.length === 0) {
    return (
      <View style={s.centered}>
        <Ionicons name="bookmark-outline" size={56} color={WatchlistColors.primary} />
        <Text style={s.noWatchlistTitle}>No watchlists yet</Text>
        <Text style={s.noWatchlistSubtitle}>
          Create your first watchlist to start tracking assets.
        </Text>
        <TouchableOpacity
          onPress={() => setCreateOpen(true)}
          style={s.createBtn}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={s.createBtnText}>Create Watchlist</Text>
        </TouchableOpacity>
        <CreateWatchlistModal
          visible={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={(_newWL) => {
            setCreateOpen(false);
            refetch();
          }}
        />
      </View>
    );
  }

  return <WatchlistDashboard watchlists={watchlists} refetch={refetch} />;
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      backgroundColor: dark ? '#050B14' : '#F3F4F6',
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: dark ? '#EEEEEF' : '#111827',
      marginTop: 12,
      marginBottom: 8,
    },
    errorSubtitle: {
      fontSize: 13,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      textAlign: 'center',
      marginBottom: 20,
    },
    retryBtn: {
      borderWidth: 1.5,
      borderColor: WatchlistColors.primary,
      borderRadius: 10,
      paddingHorizontal: 24,
      paddingVertical: 10,
    },
    retryText: {
      color: WatchlistColors.primary,
      fontWeight: '700',
      fontSize: 15,
    },
    noWatchlistTitle: {
      fontSize: 19,
      fontWeight: '800',
      color: dark ? '#EEEEEF' : '#111827',
      textAlign: 'center',
      marginBottom: 8,
      marginTop: 16,
    },
    noWatchlistSubtitle: {
      fontSize: 14,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
    },
    createBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: WatchlistColors.primary,
      borderRadius: 12,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    createBtnText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 15,
    },
  });