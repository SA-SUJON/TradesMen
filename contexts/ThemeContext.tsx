import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { ThemeType, UnitSystem } from '../types';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  showNavLabels: boolean;
  setShowNavLabels: (show: boolean) => void;
  showQuickScan: boolean;
  setShowQuickScan: (show: boolean) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  unitSystem: UnitSystem;
  setUnitSystem: (system: UnitSystem) => void;
  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useLocalStorage<ThemeType>('tradesmen-theme', 'material');
  const [showNavLabels, setShowNavLabels] = useLocalStorage<boolean>('tradesmen-nav-labels', true);
  
  // Defaulted to false for Android Native readiness
  const [showQuickScan, setShowQuickScan] = useLocalStorage<boolean>('tradesmen-quick-scan', false);
  const [voiceEnabled, setVoiceEnabled] = useLocalStorage<boolean>('tradesmen-voice-enabled', false);
  
  const [unitSystem, setUnitSystem] = useLocalStorage<UnitSystem>('tradesmen-unit-system', 'metric');

  // Dark Mode State
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('tradesmen-dark-mode', false);

  // Apply Dark Mode to HTML Root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ 
        theme, setTheme, 
        showNavLabels, setShowNavLabels, 
        showQuickScan, setShowQuickScan,
        voiceEnabled, setVoiceEnabled,
        unitSystem, setUnitSystem,
        darkMode, setDarkMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};