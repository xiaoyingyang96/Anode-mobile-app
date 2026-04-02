import React, { createContext, useContext, useState } from 'react';
import { Appearance } from 'react-native';

type ColorScheme = 'light' | 'dark';

interface ThemeCtx {
  scheme: ColorScheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeCtx>({
  scheme: 'light',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [scheme, setScheme] = useState<ColorScheme>(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',
  );

  const toggleTheme = () => setScheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ scheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeCtx {
  return useContext(ThemeContext);
}
