import React, { useEffect, useState } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Watchlist } from '@/types/watchlist';
import { WatchlistColors } from '@/constants/theme';
import { watchlistApi } from '@/utils/watchlistApi';

import WatchlistTopbar from './WatchlistTopbar';
import WatchlistHeader from './WatchlistHeader';
import WatchlistContent from './WatchlistContent';
import EmptyAssetList from './EmptyAssetList';
import AddAssetsModal from './AddAssetsModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import CreateWatchlistModal from './CreateWatchlistModal';

interface WatchlistDashboardProps {
  watchlists: Watchlist[];
  refetch: () => void;
}

export default function WatchlistDashboard({ watchlists, refetch }: WatchlistDashboardProps) {
  const dark = useColorScheme() === 'dark';
  const s = makeStyles(dark);

  // Active watchlist state
  const [activeId, setActiveId] = useState<number>(watchlists[0].id);

  // When the watchlists array refreshes, ensure activeId still points to a valid entry
  useEffect(() => {
    const stillExists = watchlists.some((w) => w.id === activeId);
    if (!stillExists) {
      const fallback = watchlists.find((w) => w.is_default) ?? watchlists[0];
      setActiveId(fallback.id);
    }
  }, [watchlists]);

  const activeIndex = Math.max(0, watchlists.findIndex((w) => w.id === activeId));
  const activeWatchlist = watchlists[activeIndex];

  // Modal states
  const [addAssetsOpen, setAddAssetsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const requestDelete = (watchlistId: number) => {
    setDeleteTargetId(watchlistId);
    setConfirmOpen(true);
  };

  const handleDeleteWatchlist = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);

    const result = await watchlistApi.delete(deleteTargetId);
    setIsDeleting(false);

    if (!result.ok) {
      // Alert is shown inside watchlistApi.delete if needed; silently refetch on success
      setConfirmOpen(false);
      setDeleteTargetId(null);
      return;
    }

    setConfirmOpen(false);
    setDeleteTargetId(null);
    refetch();
  };

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      {/* Sticky topbar */}
      <WatchlistTopbar
        watchlists={watchlists}
        activeId={activeId}
        onSelectWatchlist={setActiveId}
        onRequestDelete={requestDelete}
        onCreateNew={() => setCreateOpen(true)}
      />

      {/* Header */}
      <WatchlistHeader
        activeWatchlist={activeWatchlist}
        onAddAssetsOpen={() => setAddAssetsOpen(true)}
        onRequestDelete={requestDelete}
        onRefetch={refetch}
        onSetActiveId={setActiveId}
      />

      {/* Content or empty state */}
      <View style={s.content}>
        {activeWatchlist.assets_count === 0 ? (
          <EmptyAssetList onAddAssetsOpen={() => setAddAssetsOpen(true)} />
        ) : (
          <WatchlistContent
            assetTickers={activeWatchlist.asset_tickers}
            watchlistId={activeWatchlist.id}
            onRefetch={refetch}
          />
        )}
      </View>

      {/* Modals */}
      <AddAssetsModal
        visible={addAssetsOpen}
        assetTickers={activeWatchlist.asset_tickers}
        activeWatchlistId={activeWatchlist.id}
        onClose={() => setAddAssetsOpen(false)}
        onAssetsAdded={refetch}
      />

      <CreateWatchlistModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(newWl) => {
          setActiveId(newWl.id);
          refetch();
        }}
      />

      <DeleteConfirmModal
        visible={confirmOpen}
        onClose={() => { setConfirmOpen(false); setDeleteTargetId(null); }}
        onConfirm={handleDeleteWatchlist}
        isDeleting={isDeleting}
      />
    </SafeAreaView>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: dark ? '#050B14' : '#F3F4F6',
    },
    content: {
      flex: 1,
    },
  });
