import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, ThemeType, ColorTheme } from '../constants/Colors';
import { useColorScheme } from 'react-native';

interface ThemeContextType {
  theme: ThemeType;
  colors: ColorTheme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>('dark'); // Default to dark as per current app style

  // Load saved theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@wtg_theme_mode');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setThemeState(savedTheme as ThemeType);
        } else if (systemColorScheme) {
          // If no saved preference, follow system (optional)
          // setThemeState(systemColorScheme as ThemeType);
        }
      } catch (e) {
        console.error('Failed to load theme', e);
      }
    };
    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('@wtg_theme_mode', newTheme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('@wtg_theme_mode', newTheme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  const value = {
    theme,
    colors: Colors[theme],
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
