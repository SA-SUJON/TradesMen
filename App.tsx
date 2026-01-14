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
  const { theme } = useTheme();
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
      <div className={`min-h-screen transition-colors duration-500 ${styles.appBg} font-sans relative`}>
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

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map((tab) => (
                  <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                          flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap
                          ${activeTab === tab.id ? styles.tabActive : styles.tabInactive}
                      `}
                  >
                      {tab.icon}
                      {tab.label}
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

          <footer className="mt-12 text-center opacity-50 text-sm pb-8">
              <p>&copy; {new Date().getFullYear()} TradesMen Utility. Local Storage Enabled.</p>
          </footer>
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
