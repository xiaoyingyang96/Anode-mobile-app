import React, { useCallback, useMemo, useState } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WatchlistColors } from '@/constants/theme';
import { AssetTicker } from '@/types/watchlist';
import { tokens } from '@/utils/tokens';
import { watchlistApi } from '@/utils/watchlistApi';

interface AddAssetsModalProps {
  visible: boolean;
  onClose: () => void;
  assetTickers: AssetTicker[];
  activeWatchlistId: number;
  onAssetsAdded: () => void;
}

function TokenLogo({ ticker }: { ticker: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <View style={styles.logoFallback}>
        <Text style={styles.logoFallbackText}>{ticker.slice(0, 2).toUpperCase()}</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri: `https://assets.coincap.io/assets/icons/${ticker.toLowerCase()}@2x.png` }}
      style={styles.logo}
      onError={() => setErrored(true)}
    />
  );
}

export default function AddAssetsModal({
  visible,
  onClose,
  assetTickers,
  activeWatchlistId,
  onAssetsAdded,
}: AddAssetsModalProps) {
  const dark = useColorScheme() === 'dark';
  const s = makeStyles(dark);

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);

  const existingTickers = useMemo(
    () => new Set(assetTickers.map((t) => t.ticker.toUpperCase())),
    [assetTickers],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter(
      (t) =>
        t.fileName.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q),
    );
  }, [search]);

  const toggle = useCallback((ticker: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(ticker)) next.delete(ticker);
      else next.add(ticker);
      return next;
    });
  }, []);

  const handleAdd = async () => {
    if (selected.size === 0) return;
    setIsAdding(true);

    const assets: AssetTicker[] = tokens
      .filter((t) => selected.has(t.fileName))
      .map((t) => ({ ticker: t.fileName, name: t.name }));

    const result = await watchlistApi.addAssetsBatch(activeWatchlistId, assets);
    setIsAdding(false);

    if (!result.ok) {
      Alert.alert('Error', result.error || 'Failed to add assets.');
      return;
    }

    setSelected(new Set());
    setSearch('');
    onAssetsAdded();
    onClose();
  };

  const handleClose = () => {
    setSelected(new Set());
    setSearch('');
    onClose();
  };

  const renderItem = useCallback(
    ({ item }: { item: (typeof tokens)[0] }) => {
      const isAlready = existingTickers.has(item.fileName.toUpperCase());
      const isChecked = selected.has(item.fileName);

      return (
        <TouchableOpacity
          onPress={() => !isAlready && toggle(item.fileName)}
          disabled={isAlready}
          style={[s.tokenRow, isAlready && s.tokenRowDisabled]}
          activeOpacity={0.7}
        >
          <TokenLogo ticker={item.fileName} />
          <View style={s.tokenInfo}>
            <Text style={[s.tokenName, isAlready && s.tokenNameDisabled]}>{item.name}</Text>
            <Text style={s.tokenTicker}>{item.fileName}</Text>
          </View>
          {isAlready ? (
            <View style={s.alreadyBadge}>
              <Text style={s.alreadyText}>Added</Text>
            </View>
          ) : (
            <Ionicons
              name={isChecked ? 'checkbox' : 'square-outline'}
              size={22}
              color={isChecked ? WatchlistColors.primary : WatchlistColors.textSecondary[dark ? 'dark' : 'light']}
            />
          )}
        </TouchableOpacity>
      );
    },
    [selected, existingTickers, dark],
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={handleClose}>
      <View style={s.container}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Add Assets</Text>
          <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={dark ? '#AEB0B4' : '#4B5563'} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={s.searchWrap}>
          <Ionicons name="search-outline" size={18} color={dark ? '#AEB0B4' : '#4B5563'} style={s.searchIcon} />
          <TextInput
            style={s.searchInput}
            placeholder="Search tokens..."
            placeholderTextColor={dark ? '#555' : '#aaa'}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={dark ? '#AEB0B4' : '#4B5563'} />
            </TouchableOpacity>
          )}
        </View>

        {/* Token list */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={s.list}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={s.separator} />}
        />

        {/* Bottom action bar */}
        {selected.size > 0 && (
          <View style={s.actionBar}>
            <Text style={s.selectedCount}>{selected.size} selected</Text>
            <TouchableOpacity
              onPress={handleAdd}
              disabled={isAdding}
              style={[s.addBtn, isAdding && s.addBtnDisabled]}
              activeOpacity={0.85}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.addBtnText}>Add {selected.size} Asset{selected.size !== 1 ? 's' : ''}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  logo: { width: 36, height: 36, borderRadius: 18 },
  logoFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: WatchlistColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFallbackText: { fontSize: 11, fontWeight: '700', color: WatchlistColors.primary },
});

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: dark ? '#050B14' : '#F3F4F6',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 56,
      paddingBottom: 16,
      backgroundColor: dark ? '#111827' : '#FFFFFF',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: WatchlistColors.border[dark ? 'dark' : 'light'],
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: dark ? '#EEEEEF' : '#111827',
    },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: 16,
      paddingHorizontal: 12,
      backgroundColor: dark ? '#111827' : '#FFFFFF',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      height: 44,
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: dark ? '#EEEEEF' : '#111827',
    },
    list: { flex: 1 },
    tokenRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: dark ? '#111827' : '#FFFFFF',
      gap: 12,
    },
    tokenRowDisabled: { opacity: 0.45 },
    tokenInfo: { flex: 1 },
    tokenName: {
      fontSize: 14,
      fontWeight: '600',
      color: dark ? '#EEEEEF' : '#111827',
    },
    tokenNameDisabled: { color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'] },
    tokenTicker: {
      fontSize: 12,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      marginTop: 2,
    },
    alreadyBadge: {
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      backgroundColor: WatchlistColors.primaryMuted,
    },
    alreadyText: { fontSize: 11, fontWeight: '600', color: WatchlistColors.primary },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      marginLeft: 64,
    },
    actionBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingBottom: 28,
      backgroundColor: dark ? '#111827' : '#FFFFFF',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: WatchlistColors.border[dark ? 'dark' : 'light'],
    },
    selectedCount: {
      fontSize: 14,
      fontWeight: '600',
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
    },
    addBtn: {
      backgroundColor: WatchlistColors.primary,
      borderRadius: 10,
      paddingHorizontal: 20,
      paddingVertical: 10,
      minWidth: 140,
      alignItems: 'center',
    },
    addBtnDisabled: { opacity: 0.5 },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  });
