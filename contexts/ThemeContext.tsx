import React, { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { ThemeType } from '../types';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  showNavLabels: boolean;
  setShowNavLabels: (show: boolean) => void;
  showQuickScan: boolean;
  setShowQuickScan: (show: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useLocalStorage<ThemeType>('tradesmen-theme', 'material');
  const [showNavLabels, setShowNavLabels] = useLocalStorage<boolean>('tradesmen-nav-labels', true);
  const [showQuickScan, setShowQuickScan] = useLocalStorage<boolean>('tradesmen-quick-scan', true);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, showNavLabels, setShowNavLabels, showQuickScan, setShowQuickScan }}>
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
