import React, { useState } from 'react';
import { Product, CartItem } from './types';
import { getThemeClasses } from './utils/themeUtils';
import useLocalStorage from './hooks/useLocalStorage';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AIProvider } from './contexts/AIContext';
import AIAssistant from './components/AIAssistant';

// Components
import Calculator from './components/Calculator';
import Inventory from './components/Inventory';
import Billing from './components/Billing';
import Conversions from './components/Conversions';
import Settings from './components/Settings';

// Icons
import { Calculator as CalcIcon, Package, ShoppingCart, ArrowRightLeft, Settings as SettingsIcon } from 'lucide-react';

// Demo Data
const DEMO_PRODUCTS: Product[] = [
  { id: '1', name: 'Sugar (Premium)', buyingPrice: 38, sellingPrice: 45, stock: 100, unit: 'kg' },
  { id: '2', name: 'Basmati Rice', buyingPrice: 85, sellingPrice: 110, stock: 50, unit: 'kg' },
  { id: '3', name: 'Almonds', buyingPrice: 600, sellingPrice: 850, stock: 10, unit: 'kg' },
];

const MainContent: React.FC = () => {
  const { theme, showNavLabels } = useTheme();
  const styles = getThemeClasses(theme);
  const [activeTab, setActiveTab] = useState('calculator');
  
  // Data State
  const [inventory, setInventory] = useLocalStorage<Product[]>('tradesmen-inventory', DEMO_PRODUCTS);
  const [cart, setCart] = useLocalStorage<CartItem[]>('tradesmen-cart', []);

  const tabs = [
    { id: 'calculator', label: 'Calculator', icon: <CalcIcon className="w-4 h-4" /> },
    { id: 'inventory', label: 'Inventory', icon: <Package className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'conversions', label: 'Converter', icon: <ArrowRightLeft className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    // Wrap main logic in AIProvider to give AI access to state
    <AIProvider inventory={inventory} setInventory={setInventory} cart={cart} setCart={setCart}>
      <div className={`min-h-screen transition-colors duration-500 ${styles.appBg} font-sans relative pb-24 md:pb-0`}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center gap-3">
               <div className={`p-3 rounded-xl ${theme === 'material' ? 'bg-m3-primary text-white' : 'bg-black text-white dark:bg-white dark:text-black'} shadow-lg`}>
                  <CalcIcon className="w-6 h-6" />
               </div>
               <div>
                  <h1 className="text-2xl font-display font-bold">TradesMen</h1>
                  <p className="text-xs opacity-70 uppercase tracking-wider">Retail Utility Suite</p>
               </div>
            </div>
          </header>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex space-x-1 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map((tab) => (
                  <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                          flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap
                          ${activeTab === tab.id ? styles.tabActive : styles.tabInactive}
                      `}
                      title={tab.label}
                  >
                      {tab.icon}
                      {showNavLabels && tab.label}
                  </button>
              ))}
          </nav>

          {/* Main Content Area */}
          <main>
              <AnimatePresence mode="wait">
                  <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                  >
                      {activeTab === 'calculator' && <Calculator inventory={inventory} />}
                      {activeTab === 'inventory' && <Inventory inventory={inventory} setInventory={setInventory} />}
                      {activeTab === 'billing' && <Billing inventory={inventory} cart={cart} setCart={setCart} />}
                      {activeTab === 'conversions' && <Conversions />}
                      {activeTab === 'settings' && <Settings />}
                  </motion.div>
              </AnimatePresence>
          </main>

          <footer className="mt-12 text-center opacity-50 text-sm pb-8 hidden md:block">
              <p>&copy; {new Date().getFullYear()} TradesMen Utility. Local Storage Enabled.</p>
          </footer>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 px-2 py-2 pb-safe flex justify-around items-center transition-all duration-300 ${
             theme === 'glass' ? 'bg-black/40 backdrop-blur-xl border-t border-white/10 text-white' : 
             theme === 'neumorphism' ? 'bg-[#E0E5EC] shadow-[0_-5px_10px_#bebebe,0_-5px_10px_#ffffff]' :
             'bg-white dark:bg-[#0f0f0f] border-t border-gray-200 dark:border-gray-800 shadow-lg'
        }`}>
              {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex flex-col items-center justify-center p-2 rounded-xl transition-all w-16
                            ${isActive ? 'scale-110' : 'opacity-60 scale-100'}
                            ${isActive && theme === 'material' ? 'bg-[#E8DEF8] text-[#1D192B]' : ''}
                            ${isActive && theme === 'glass' ? 'bg-white/20 text-white' : ''}
                            ${isActive && theme === 'fluent' ? 'text-[#0078D4]' : ''}
                            ${isActive && theme === 'neumorphism' ? 'shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff] text-slate-700' : ''}
                        `}
                        title={tab.label}
                    >
                        {React.cloneElement(tab.icon as React.ReactElement, { className: "w-6 h-6" })}
                        {showNavLabels && (
                          <span className="text-[10px] mt-1 font-medium truncate w-full text-center">
                              {tab.label}
                          </span>
                        )}
                    </button>
                  );
              })}
        </div>

        {/* AI Assistant FAB */}
        <AIAssistant />
      </div>
    </AIProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <MainContent />
    </ThemeProvider>
  );
};

export default App;