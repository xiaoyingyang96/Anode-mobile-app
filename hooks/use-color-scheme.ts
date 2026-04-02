import { useThemeContext } from '@/context/ThemeContext';

export function useColorScheme(): 'light' | 'dark' {
  return useThemeContext().scheme;
}
