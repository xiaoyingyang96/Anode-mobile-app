import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scroll?: boolean;
  className?: string;
}

/**
 * Base layout wrapper for all screens.
 * Handles SafeArea insets and optional scrolling.
 *
 * Usage:
 *   <ScreenWrapper>...</ScreenWrapper>
 *   <ScreenWrapper scroll>...</ScreenWrapper>
 */
export function ScreenWrapper({ children, scroll = false, className = '' }: ScreenWrapperProps) {
  if (scroll) {
    return (
      <SafeAreaView className={`flex-1 bg-white dark:bg-black ${className}`}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 bg-white dark:bg-black ${className}`}>
      <View className="flex-1">
        {children}
      </View>
    </SafeAreaView>
  );
}
