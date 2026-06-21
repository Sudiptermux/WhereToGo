/**
 * WhereToGo Global Color Palette
 * Inspired by the brand logo:
 * - W Gradient: Teal (#00E5FF) to Green (#76FF03)
 * - Pin: Orange (#FF9100)
 * - Background: Sky Pastels
 */

export const Colors = {
  light: {
    background: '#F8FAFC',
    backgroundGradient: ['#FFFDE7', '#E1F5FE', '#F1F8E9'], // Logo sky pastels
    surface: '#FFFFFF',
    surfaceSelected: '#F0F9FF',
    
    text: '#0F172A', // Deep Slate
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    
    primary: '#00bcd4',
    primaryGradient: ['#00E5FF', '#76FF03'], // The "W" Gradient
    
    accent: '#FF9100', // The Pin Orange
    accentGradient: ['#FF9100', '#FFAB40'],
    
    border: '#E2E8F0',
    cardShadow: 'rgba(15, 23, 42, 0.05)',
    
    tabBar: '#FFFFFF',
    tabBarActive: '#00bcd4',
    tabBarInactive: '#94A3B8',

    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',

    glass: 'rgba(255, 255, 255, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
  },
  dark: {
    background: '#060606',
    backgroundGradient: ['#060606', '#0a1a2e', '#060606'],
    surface: '#121212',
    surfaceSelected: '#1E1E1E',
    
    text: '#FFFFFF',
    textSecondary: '#8e9e9f',
    textMuted: '#4A5568',
    
    primary: '#00bcd4',
    primaryGradient: ['#00bcd4', '#4facfe'],
    
    accent: '#FF9800',
    accentGradient: ['#FF9800', '#F57C00'],
    
    border: 'rgba(255, 255, 255, 0.05)',
    cardShadow: 'rgba(0, 0, 0, 0.5)',
    
    tabBar: '#0A0A0A',
    tabBarActive: '#00bcd4',
    tabBarInactive: '#4A5568',

    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',

    glass: 'rgba(18, 18, 18, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.05)',
  }
};

export type ThemeType = 'light' | 'dark';
export type ColorTheme = typeof Colors.light;
