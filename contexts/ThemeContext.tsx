import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme } from '@/constants/theme';

export const THEME_STORAGE_KEY = "user-theme-preference";

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ReturnType<typeof getTheme>;
  themeType: ThemeType;
  setThemeType: (type: ThemeType) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceColorScheme = useDeviceColorScheme();
  const [themeType, setThemeType] = useState<ThemeType>('system');
  const [isLoading, setIsLoading] = useState(true);
  const loadSavedThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
        setThemeType(savedTheme as ThemeType);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved theme preference on mount
  useEffect(() => {
    loadSavedThemePreference();
  }, []);

  // Determine if dark mode is active based on theme type and device settings
  const isDark =
    themeType === 'dark' ||
    (themeType === 'system' && deviceColorScheme === 'dark');

  // Get the theme based on the current mode
  const theme = getTheme(isDark ? 'dark' : 'light');

  // Skip rendering until initial theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, themeType, setThemeType, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
