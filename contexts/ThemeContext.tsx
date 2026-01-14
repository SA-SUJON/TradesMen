import React, { createContext, useContext, ReactNode } from 'react';
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
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useLocalStorage<ThemeType>('tradesmen-theme', 'material');
  const [showNavLabels, setShowNavLabels] = useLocalStorage<boolean>('tradesmen-nav-labels', true);
  const [showQuickScan, setShowQuickScan] = useLocalStorage<boolean>('tradesmen-quick-scan', true);
  const [voiceEnabled, setVoiceEnabled] = useLocalStorage<boolean>('tradesmen-voice-enabled', true);
  const [unitSystem, setUnitSystem] = useLocalStorage<UnitSystem>('tradesmen-unit-system', 'metric');

  return (
    <ThemeContext.Provider value={{ 
        theme, setTheme, 
        showNavLabels, setShowNavLabels, 
        showQuickScan, setShowQuickScan,
        voiceEnabled, setVoiceEnabled,
        unitSystem, setUnitSystem
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
