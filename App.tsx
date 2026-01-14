import React, { useState } from 'react';
import { Product, CartItem, Customer, Sale, Expense } from './types';
import { getThemeClasses } from './utils/themeUtils';
import useLocalStorage from './hooks/useLocalStorage';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AIProvider, useAI } from './contexts/AIContext';
import AIAssistant, { ChatInterface } from './components/AIAssistant';
import MagicBar from './components/MagicBar';
import QuickScan from './components/QuickScan';
import InsightCards from './components/InsightCards';

// Components
import Calculator from './components/Calculator';
import Inventory from './components/Inventory';
import Billing from './components/Billing';
import Customers from './components/Customers';
import Conversions from './components/Conversions';
import Settings from './components/Settings';
import Finance from './components/Finance';

// Icons
import { Calculator as CalcIcon, Package, ShoppingCart, ArrowRightLeft, Settings as SettingsIcon, Sparkles, Users, PieChart } from 'lucide-react';

// Demo Data
const DEMO_PRODUCTS: Product[] = [
  { id: '1', name: 'Sugar (Premium)', buyingPrice: 38, sellingPrice: 45, stock: 100, unit: 'kg', lowStockThreshold: 20 },
  { id: '2', name: 'Basmati Rice', buyingPrice: 85, sellingPrice: 110, stock: 50, unit: 'kg', supplierName: 'Agro Traders' },
  { id: '3', name: 'Almonds', buyingPrice: 600, sellingPrice: 850, stock: 10, unit: 'kg', lowStockThreshold: 5 },
  { id: '4', name: 'Milk Powder', buyingPrice: 300, sellingPrice: 350, stock: 5, unit: 'kg', expiryDate: '2025-05-20', lowStockThreshold: 10 }, 
];

const DEMO_CUSTOMERS: Customer[] = [
    { id: '1', name: 'John Doe', phone: '9876543210', debt: 500, history: [] },
    { id: '2', name: 'Jane Smith', phone: '1234567890', debt: 0, history: [] }
];

// Type for state setters to match useLocalStorage signature
type SetValue<T> = (value: T | ((val: T) => T)) => void;

interface MainLayoutProps {
  inventory: Product[];
  setInventory: SetValue<Product[]>;
  cart: CartItem[];
  setCart: SetValue<CartItem[]>;
  customers: Customer[];
  setCustomers: SetValue<Customer[]>;
  sales: Sale[];
  setSales: SetValue<Sale[]>;
  expenses: Expense[];
  setExpenses: SetValue<Expense[]>;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  inventory, setInventory, cart, setCart, customers, setCustomers, sales, setSales, expenses, setExpenses
}) => {
  const { theme, showNavLabels, showQuickScan } = useTheme();
  const { showAssistant } = useAI(); 
  const styles = getThemeClasses(theme);
  const [activeTab, setActiveTab] = useState('inventory');

  const tabs = [
    { id: 'inventory', label: 'Inventory', icon: <Package className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'finance', label: 'Finance', icon: <PieChart className="w-4 h-4" /> },
    { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
    { id: 'calculator', label: 'Calculator', icon: <CalcIcon className="w-4 h-4" /> },
    { id: 'conversions', label: 'Converter', icon: <ArrowRightLeft className="w-4 h-4" /> },
    { id: 'manager', label: 'Manager', icon: <Sparkles className="w-4 h-4" /> },
  ];

  const handleMagicActivate = () => {
    setActiveTab('manager');
  };

  const isSettings = activeTab === 'settings';
  const isManagerTab = activeTab === 'manager';
  const isAssistantVisible = showAssistant && !isManagerTab && !isSettings;
  const isQuickScanVisible = showQuickScan && !isSettings && !isManagerTab;
  const isQuickScanPrimary = !isAssistantVisible;
  const isMagicBarVisible = !isManagerTab && !isSettings;

  const getLogoStyle = () => {
      switch(theme) {
          case 'material': return 'bg-m3-primary text-white shadow-md';
          case 'glass': return 'bg-white/20 text-white backdrop-blur-md border border-white/30';
          case 'neumorphism': return 'bg-[#E0E5EC] text-slate-700 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff]';
          case 'fluent': default: return 'bg-white text-blue-600 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white';
      }
  };

  const getTitleStyle = () => {
      switch(theme) {
          case 'material': return 'text-[#6750A4]';
          case 'glass': return 'text-white drop-shadow-md tracking-wide';
          case 'neumorphism': return 'text-slate-700 tracking-tight';
          case 'fluent': default: return 'text-gray-900 dark:text-white';
      }
  };

  const getSettingsBtnStyle = () => {
    switch(theme) {
        case 'material': return 'bg-[#F3EDF7] text-[#49454F] hover:bg-[#E8DEF8]';
        case 'glass': return 'bg-white/10 text-white border border-white/20 hover:bg-white/20';
        case 'neumorphism': return 'bg-[#E0E5EC] text-slate-600 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] active:shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] active:translate-y-[1px]';
        case 'fluent': default: return 'bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300';
    }
  };

  return (
      <div className={`min-h-screen transition-colors duration-500 ${styles.appBg} font-sans relative pb-safe`}>
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-8 h-[100dvh] flex flex-col">
          
          <header className="flex flex-col gap-4 md:gap-6 mb-2 md:mb-8 flex-shrink-0 z-20 relative">
            <div className="flex justify-between items-center w-full">
                <div 
                    className="flex items-center gap-3 select-none cursor-pointer group"
                    onClick={() => setActiveTab('inventory')}
                >
                    <div className={`p-2.5 rounded-xl transition-all duration-300 group-hover:scale-105 ${getLogoStyle()}`}>
                        <CalcIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-display font-bold leading-none ${getTitleStyle()}`}>
                            TradesMen
                        </h1>
                        <p className={`text-[10px] font-medium uppercase tracking-widest opacity-60 ml-0.5 mt-0.5 ${theme === 'glass' ? 'text-white' : ''}`}>
                            Retail Suite
                        </p>
                    </div>
                </div>

                <div className="hidden md:block flex-grow max-w-xl mx-8">
                    {isMagicBarVisible && <MagicBar onActivate={handleMagicActivate} />}
                </div>

                <button 
                    onClick={() => setActiveTab('settings')}
                    className={`p-3 rounded-full transition-all duration-200 ${getSettingsBtnStyle()}`}
                    title="Settings"
                >
                    <SettingsIcon className={`w-6 h-6 ${activeTab === 'settings' ? 'animate-spin-slow' : ''}`} />
                </button>
            </div>

            <div className="md:hidden w-full">
                 {isMagicBarVisible && <MagicBar onActivate={handleMagicActivate} />}
            </div>
          </header>

          <nav className="hidden md:flex space-x-1 mb-8 overflow-x-auto pb-2 scrollbar-hide flex-shrink-0">
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

          <main className={`flex-grow relative ${isManagerTab ? 'overflow-hidden' : 'overflow-y-auto no-scrollbar pb-24 md:pb-0'}`}>
              <AnimatePresence mode="wait">
                  <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                  >
                      {activeTab === 'calculator' && <Calculator inventory={inventory} />}
                      {activeTab === 'inventory' && <Inventory inventory={inventory} setInventory={setInventory} />}
                      {activeTab === 'billing' && (
                        <Billing 
                            inventory={inventory} 
                            cart={cart} setCart={setCart} 
                            customers={customers} setCustomers={setCustomers}
                            sales={sales} setSales={setSales}
                        />
                      )}
                      {activeTab === 'finance' && (
                        <Finance 
                            sales={sales} 
                            expenses={expenses} setExpenses={setExpenses}
                            customers={customers} setCustomers={setCustomers}
                        />
                      )}
                      {activeTab === 'customers' && <Customers customers={customers} setCustomers={setCustomers} />}
                      {activeTab === 'manager' && (
                          <div className="flex flex-col h-full gap-2 md:gap-4 pb-[85px] md:pb-0">
                              <div className="flex-shrink-0 z-10">
                                <InsightCards inventory={inventory} />
                              </div>
                              <div className="flex-grow overflow-hidden rounded-2xl relative">
                                <ChatInterface variant="page" className="h-full" />
                              </div>
                          </div>
                      )}
                      {activeTab === 'conversions' && <Conversions />}
                      {activeTab === 'settings' && <Settings />}
                  </motion.div>
              </AnimatePresence>
          </main>

          <footer className="mt-12 text-center opacity-50 text-sm pb-8 hidden md:block flex-shrink-0">
              <p>&copy; {new Date().getFullYear()} TradesMen Utility. Local Storage Enabled.</p>
          </footer>
        </div>

        <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 px-2 py-2 pb-safe flex justify-between items-center transition-all duration-300 overflow-x-auto scrollbar-hide ${
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
                            flex flex-col items-center justify-center p-2 rounded-xl transition-all min-w-[3.5rem]
                            ${isActive ? 'flex-grow max-w-[5rem]' : 'flex-grow-0'}
                            ${isActive && theme === 'material' ? 'bg-[#E8DEF8] text-[#1D192B]' : ''}
                            ${isActive && theme === 'glass' ? 'bg-white/20 text-white' : ''}
                            ${isActive && theme === 'fluent' ? 'text-[#0078D4]' : ''}
                            ${isActive && theme === 'neumorphism' ? 'shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff] text-slate-700' : ''}
                            ${!isActive ? 'opacity-60 grayscale' : ''}
                        `}
                        title={tab.label}
                    >
                        {React.cloneElement(tab.icon as React.ReactElement, { className: "w-5 h-5" })}
                        {isActive && showNavLabels && (
                          <motion.span 
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            className="text-[10px] mt-1 font-medium truncate w-full text-center"
                          >
                              {tab.label}
                          </motion.span>
                        )}
                    </button>
                  );
              })}
        </div>

        <QuickScan 
            onScanStart={handleMagicActivate} 
            isVisible={isQuickScanVisible}
            isPrimary={isQuickScanPrimary}
        />
        
        <AIAssistant 
            isVisible={isAssistantVisible}
            forceHide={activeTab === 'manager'} 
        />
      </div>
  );
};

const AppDataWrapper: React.FC = () => {
  const [inventory, setInventory] = useLocalStorage<Product[]>('tradesmen-inventory', DEMO_PRODUCTS);
  const [cart, setCart] = useLocalStorage<CartItem[]>('tradesmen-cart', []);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('tradesmen-customers', DEMO_CUSTOMERS);
  const [sales, setSales] = useLocalStorage<Sale[]>('tradesmen-sales', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('tradesmen-expenses', []);

  return (
    <AIProvider inventory={inventory} setInventory={setInventory} cart={cart} setCart={setCart}>
      <MainLayout 
        inventory={inventory} 
        setInventory={setInventory}
        cart={cart}
        setCart={setCart}
        customers={customers}
        setCustomers={setCustomers}
        sales={sales}
        setSales={setSales}
        expenses={expenses}
        setExpenses={setExpenses}
      />
    </AIProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppDataWrapper /> 
    </ThemeProvider>
  );
};

export default App;
