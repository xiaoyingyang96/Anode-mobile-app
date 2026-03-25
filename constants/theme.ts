/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#26AFFF';
const tintColorDark = '#26AFFF';

export const Colors = {
  light: {
    text: '#111827',
    background: '#F3F4F6',
    tint: tintColorLight,
    icon: '#4B5563',
    tabIconDefault: '#4B5563',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#EEEEEF',
    background: '#050B14',
    tint: tintColorDark,
    icon: '#AEB0B4',
    tabIconDefault: '#AEB0B4',
    tabIconSelected: tintColorDark,
  },
};

export const WatchlistColors = {
  primary: '#26AFFF',
  primaryMuted: 'rgba(38, 175, 255, 0.15)',
  primaryMutedStrong: 'rgba(38, 175, 255, 0.25)',
  tickerUp: {
    light: '#059669',
    dark: '#07CDA5',
  },
  tickerDown: {
    light: '#DC2626',
    dark: '#FA3364',
  },
  cardBg: {
    light: '#F9FAFB',
    dark: '#0D1117',
  },
  surface: {
    light: '#FFFFFF',
    dark: '#111827',
  },
  border: {
    light: '#E5E7EB',
    dark: '#1F2937',
  },
  textSecondary: {
    light: '#4B5563',
    dark: '#AEB0B4',
  },
  deleteRed: '#DC2626',
  tabActiveBg: {
    light: 'rgba(38, 175, 255, 0.10)',
    dark: 'rgba(38, 175, 255, 0.18)',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
