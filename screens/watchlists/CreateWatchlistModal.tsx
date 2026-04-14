import { WatchlistColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Watchlist } from '@/types/watchlist';
import { watchlistApi } from '@/utils/watchlistApi';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface CreateWatchlistModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: (watchlist: Watchlist) => void;
}

export default function CreateWatchlistModal({
  visible,
  onClose,
  onCreated,
}: CreateWatchlistModalProps) {
  const dark = useColorScheme() === 'dark';
  const s = makeStyles(dark);

  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Watchlist name is required.');
      return false;
    }
    if (trimmed.length > 50) {
      setError('Name must be 50 characters or less.');
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setIsLoading(true);
    const result = await watchlistApi.create(name.trim());
    setIsLoading(false);

    if (!result.ok) {
      Alert.alert('Error', result.error || 'Failed to create watchlist.');
      return;
    }

    setName('');
    setError('');
    onCreated(result.data);
    onClose();
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={s.container}>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.headerTitle}>Create New Watchlist</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={dark ? '#AEB0B4' : '#4B5563'} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={s.body}>
            <Text style={s.label}>Watchlist Name</Text>
            <TextInput
              style={[s.input, error ? s.inputError : null, name.length > 0 && s.inputFocused]}
              placeholder="Enter a descriptive name..."
              placeholderTextColor={dark ? '#555' : '#aaa'}
              value={name}
              onChangeText={(t) => { setName(t); setError(''); }}
              autoCapitalize="words"
              maxLength={50}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            {error ? <Text style={s.errorText}>{error}</Text> : null}

            <View style={s.actions}>
              <TouchableOpacity onPress={handleClose} style={s.cancelBtn} activeOpacity={0.75}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreate}
                disabled={isLoading}
                style={[s.createBtn, isLoading && s.disabledBtn]}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={s.createText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    flex: { flex: 1 },
    container: {
      flex: 1,
      backgroundColor: dark ? '#0D1117' : '#F9FAFB',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: WatchlistColors.border[dark ? 'dark' : 'light'],
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: dark ? '#EEEEEF' : '#111827',
    },
    body: {
      padding: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: dark ? '#EEEEEF' : '#111827',
      marginBottom: 10,
    },
    input: {
      backgroundColor: dark ? '#1A1A2E' : '#FFFFFF',
      borderWidth: 1.5,
      borderColor: WatchlistColors.border[dark ? 'dark' : 'light'],
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: dark ? '#EEEEEF' : '#111827',
      marginBottom: 6,
    },
    inputFocused: {
      borderColor: WatchlistColors.primary,
    },
    inputError: {
      borderColor: WatchlistColors.deleteRed,
    },
    errorText: {
      fontSize: 12,
      color: WatchlistColors.deleteRed,
      marginBottom: 4,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
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
    createBtn: {
      flex: 2,
      backgroundColor: WatchlistColors.primary,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
    },
    createText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#fff',
    },
    disabledBtn: {
      opacity: 0.5,
    },
  });
