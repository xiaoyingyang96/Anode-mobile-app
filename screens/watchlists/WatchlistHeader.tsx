import React, { useState } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WatchlistColors } from '@/constants/theme';
import { Watchlist } from '@/types/watchlist';
import { watchlistApi } from '@/utils/watchlistApi';

interface WatchlistHeaderProps {
  activeWatchlist: Watchlist;
  onAddAssetsOpen: () => void;
  onRequestDelete: (id: number) => void;
  onRefetch: () => void;
  onSetActiveId: (id: number) => void;
}

export default function WatchlistHeader({
  activeWatchlist,
  onAddAssetsOpen,
  onRequestDelete,
  onRefetch,
  onSetActiveId,
}: WatchlistHeaderProps) {
  const dark = useColorScheme() === 'dark';
  const { width } = useWindowDimensions();
  const isNarrow = width < 360;
  const s = makeStyles(dark);

  const [menuVisible, setMenuVisible] = useState(false);
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameValue, setRenameValue] = useState(activeWatchlist.name);
  const [renameError, setRenameError] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const isDefault = activeWatchlist.is_default;

  const handleMenuOpen = () => {
    if (Platform.OS === 'ios') {
      const options = isDefault
        ? ['Cancel', 'Rename', 'Duplicate']
        : ['Cancel', 'Set as Default', 'Rename', 'Duplicate', 'Delete'];
      const destructiveIndex = isDefault ? undefined : options.indexOf('Delete');
      const cancelIndex = 0;

      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: cancelIndex, destructiveButtonIndex: destructiveIndex },
        (idx) => {
          if (idx === cancelIndex) return;
          const chosen = options[idx];
          if (chosen === 'Set as Default') handleSetDefault();
          if (chosen === 'Rename') openRename();
          if (chosen === 'Duplicate') handleDuplicate();
          if (chosen === 'Delete') onRequestDelete(activeWatchlist.id);
        },
      );
    } else {
      setMenuVisible(true);
    }
  };

  const openRename = () => {
    setRenameValue(activeWatchlist.name);
    setRenameError('');
    setRenameVisible(true);
    setMenuVisible(false);
  };

  const handleSetDefault = async () => {
    const result = await watchlistApi.update(activeWatchlist.id, {
      name: activeWatchlist.name,
      is_default: true,
    });
    if (!result.ok) {
      Alert.alert('Error', result.error || 'Failed to set default.');
    } else {
      onRefetch();
    }
  };

  const handleDuplicate = async () => {
    const result = await watchlistApi.duplicate(activeWatchlist);
    if (!result.ok) {
      Alert.alert('Error', result.error || 'Failed to duplicate watchlist.');
    } else {
      onSetActiveId(result.data.id);
      onRefetch();
    }
  };

  const handleRename = async () => {
    const trimmed = renameValue.trim();
    if (!trimmed) { setRenameError('Name is required.'); return; }
    if (trimmed.length > 50) { setRenameError('Max 50 characters.'); return; }

    setIsRenaming(true);
    const result = await watchlistApi.update(activeWatchlist.id, {
      name: trimmed,
      is_default: activeWatchlist.is_default,
    });
    setIsRenaming(false);

    if (!result.ok) {
      Alert.alert('Error', result.error || 'Failed to rename watchlist.');
    } else {
      setRenameVisible(false);
      onRefetch();
    }
  };

  return (
    <>
      {/* Rename modal */}
      <Modal visible={renameVisible} transparent animationType="fade" onRequestClose={() => setRenameVisible(false)}>
        <View style={s.overlay}>
          <View style={s.renameCard}>
            <Text style={s.renameTitle}>Rename Watchlist</Text>
            <TextInput
              style={[s.renameInput, renameError ? s.renameInputError : null]}
              value={renameValue}
              onChangeText={(t) => { setRenameValue(t); setRenameError(''); }}
              placeholder="Watchlist name"
              placeholderTextColor={dark ? '#555' : '#aaa'}
              autoCapitalize="words"
              maxLength={50}
            />
            {renameError ? <Text style={s.errorText}>{renameError}</Text> : null}
            <View style={s.renameActions}>
              <TouchableOpacity onPress={() => setRenameVisible(false)} style={s.cancelBtn} disabled={isRenaming}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRename} style={[s.saveBtn, isRenaming && s.disabled]} disabled={isRenaming}>
                {isRenaming
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={s.saveText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Android overflow menu modal */}
      {Platform.OS !== 'ios' && (
        <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
          <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
            <View style={s.menuCard}>
              {!isDefault && (
                <TouchableOpacity style={s.menuItem} onPress={() => { setMenuVisible(false); handleSetDefault(); }}>
                  <Ionicons name="star-outline" size={18} color={dark ? '#EEEEEF' : '#111827'} />
                  <Text style={s.menuItemText}>Set as Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={s.menuItem} onPress={openRename}>
                <Ionicons name="pencil-outline" size={18} color={dark ? '#EEEEEF' : '#111827'} />
                <Text style={s.menuItemText}>Rename</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.menuItem} onPress={() => { setMenuVisible(false); handleDuplicate(); }}>
                <Ionicons name="copy-outline" size={18} color={dark ? '#EEEEEF' : '#111827'} />
                <Text style={s.menuItemText}>Duplicate</Text>
              </TouchableOpacity>
              {!isDefault && (
                <TouchableOpacity style={s.menuItem} onPress={() => { setMenuVisible(false); onRequestDelete(activeWatchlist.id); }}>
                  <Ionicons name="trash-outline" size={18} color={WatchlistColors.deleteRed} />
                  <Text style={[s.menuItemText, { color: WatchlistColors.deleteRed }]}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Header row — wraps to two lines on narrow screens */}
      <View style={[s.container, isNarrow && s.containerNarrow]}>
        <View style={s.left}>
          <Text style={s.name} numberOfLines={1}>{activeWatchlist.name}</Text>
          {isDefault && (
            <View style={s.defaultBadge}>
              <Text style={s.defaultText}>Default</Text>
            </View>
          )}
        </View>

        <View style={[s.right, isNarrow && s.rightNarrow]}>
          <TouchableOpacity onPress={onAddAssetsOpen} style={s.addBtn} activeOpacity={0.85}>
            <Ionicons name="add" size={16} color="#fff" />
            {!isNarrow && <Text style={s.addBtnText}>Add Assets</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleMenuOpen} style={s.moreBtn} activeOpacity={0.75}>
            <Ionicons name="ellipsis-vertical" size={18} color={dark ? '#EEEEEF' : '#111827'} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    containerNarrow: {
      flexWrap: 'wrap',
      gap: 8,
    },
    left: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginRight: 8,
    },
    name: {
      fontSize: 20,
      fontWeight: '800',
      color: dark ? '#EEEEEF' : '#111827',
      flexShrink: 1,
    },
    defaultBadge: {
      backgroundColor: WatchlistColors.primaryMuted,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    defaultText: {
      fontSize: 11,
      fontWeight: '700',
      color: WatchlistColors.primary,
    },
    right: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexShrink: 0,
    },
    rightNarrow: {
      // On narrow screens the right side fills the full row below the name
      width: '100%',
      justifyContent: 'flex-end',
      gap: 8,
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: WatchlistColors.primary,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    addBtnText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 13,
    },
    moreBtn: {
      width: 34,
      height: 34,
      borderRadius: 8,
      backgroundColor: WatchlistColors.primaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Rename modal
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    renameCard: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: dark ? '#111827' : '#FFFFFF',
      borderRadius: 16,
      padding: 24,
    },
    renameTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: dark ? '#EEEEEF' : '#111827',
      marginBottom: 16,
    },
    renameInput: {
      backgroundColor: dark ? '#1A1A2E' : '#F9FAFB',
      borderWidth: 1.5,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: dark ? '#EEEEEF' : '#111827',
      marginBottom: 6,
    },
    renameInputError: { borderColor: WatchlistColors.deleteRed },
    errorText: { fontSize: 12, color: WatchlistColors.deleteRed, marginBottom: 4 },
    renameActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
    cancelBtn: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      borderRadius: 10,
      paddingVertical: 11,
      alignItems: 'center',
    },
    cancelText: { fontSize: 15, fontWeight: '600', color: dark ? '#AEB0B4' : '#4B5563' },
    saveBtn: {
      flex: 2,
      backgroundColor: WatchlistColors.primary,
      borderRadius: 10,
      paddingVertical: 11,
      alignItems: 'center',
    },
    saveText: { fontSize: 15, fontWeight: '700', color: '#fff' },
    disabled: { opacity: 0.5 },
    // Android menu
    menuCard: {
      backgroundColor: dark ? '#111827' : '#FFFFFF',
      borderRadius: 14,
      padding: 8,
      width: 220,
      elevation: 8,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
    },
    menuItemText: {
      fontSize: 15,
      fontWeight: '500',
      color: dark ? '#EEEEEF' : '#111827',
    },
  });
