import React from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WatchlistColors } from '@/constants/theme';

interface DeleteConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteConfirmModal({
  visible,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteConfirmModalProps) {
  const dark = useColorScheme() === 'dark';
  const s = makeStyles(dark);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <View style={s.iconWrap}>
            <Ionicons name="warning-outline" size={32} color={WatchlistColors.deleteRed} />
          </View>

          <Text style={s.title}>Delete Watchlist</Text>

          <Text style={s.body}>
            Are you sure? This watchlist and all its saved assets will be permanently removed.
          </Text>

          <View style={s.actions}>
            <TouchableOpacity onPress={onClose} style={s.cancelBtn} disabled={isDeleting} activeOpacity={0.75}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              disabled={isDeleting}
              style={[s.deleteBtn, isDeleting && s.disabled]}
              activeOpacity={0.85}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.deleteText}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    card: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: dark ? '#111827' : '#FFFFFF',
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(220,38,38,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 17,
      fontWeight: '700',
      color: dark ? '#EEEEEF' : '#111827',
      marginBottom: 10,
    },
    body: {
      fontSize: 14,
      color: WatchlistColors.textSecondary[dark ? 'dark' : 'light'],
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
    },
    cancelBtn: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
    },
    cancelText: {
      fontSize: 15,
      fontWeight: '600',
      color: dark ? '#AEB0B4' : '#4B5563',
    },
    deleteBtn: {
      flex: 1,
      backgroundColor: WatchlistColors.deleteRed,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
    },
    deleteText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#fff',
    },
    disabled: {
      opacity: 0.5,
    },
  });
