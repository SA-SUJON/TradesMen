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
import { Card } from './components/ui/BaseComponents';

// Components
import Calculator from './components/Calculator';
import Inventory from './components/Inventory';
import Billing from './components/Billing';
import Customers from './components/Customers';
import Conversions from './components/Conversions';
import Settings from './components/Settings';
import Finance from './components/Finance';
import Reports from './components/Reports';

// Icons
import { Calculator as CalcIcon, Package, ShoppingCart, ArrowRightLeft, Settings as SettingsIcon, Sparkles, Users, PieChart, FileBarChart, Grid, ChevronLeft, Store, Menu } from 'lucide-react';

// Demo Data
const DEMO_PRODUCTS: Product[] = [
  { id: '1', name: 'Sugar (Premium)', buyingPrice: 38, sellingPrice: 45, stock: 100, unit: 'kg', lowStockThreshold: 20, history: [{ id: 'h1', date: new Date().toISOString(), type: 'create', description: 'Item added to inventory' }] },
  { id: '2', name: 'Basmati Rice', buyingPrice: 85, sellingPrice: 110, stock: 50, unit: 'kg', supplierName: 'Agro Traders', history: [{ id: 'h2', date: new Date().toISOString(), type: 'create', description: 'Item added to inventory' }] },
  { id: '3', name: 'Almonds', buyingPrice: 600, sellingPrice: 850, stock: 10, unit: 'kg', lowStockThreshold: 5, history: [{ id: 'h3', date: new Date().toISOString(), type: 'create', description: 'Item added to inventory' }] },
  { id: '4', name: 'Milk Powder', buyingPrice: 300, sellingPrice: 350, stock: 5, unit: 'kg', expiryDate: '2025-05-20', lowStockThreshold: 10, history: [{ id: 'h4', date: new Date().toISOString(), type: 'create', description: 'Item added to inventory' }] }, 
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

  // Primary Navigation (Bottom Bar)
  const MAIN_TABS = [
    { id: 'inventory', label: 'Items', icon: <Package className="w-5 h-5" /> },
    { id: 'billing', label: 'Bill', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'customers', label: 'Parties', icon: <Users className="w-5 h-5" /> },
    { id: 'manager', label: 'Manager', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'menu', label: 'More', icon: <Menu className="w-5 h-5" /> },
  ];

  // Secondary Tools (Available in More Menu)
  const MENU_TOOLS = [
    { id: 'finance', label: 'Business Biz', icon: <PieChart className="w-6 h-6 text-teal-600" />, desc: 'Expenses, Profits & Dashboard' },
    { id: 'reports', label: 'Reports', icon: <FileBarChart className="w-6 h-6 text-blue-500" />, desc: 'GSTR-1, Stock & Daybook' },
    { id: 'calculator', label: 'Calculator', icon: <CalcIcon className="w-6 h-6 text-green-500" />, desc: 'Price & Weight Calc' },
    { id: 'conversions', label: 'Tools', icon: <ArrowRightLeft className="w-6 h-6 text-purple-500" />, desc: 'Unit Converter & Bulk' },
  ];

  const handleMagicActivate = () => {
    setActiveTab('manager');
  };

  const isMenuContext = ['menu', 'finance', 'calculator', 'conversions', 'reports', 'settings'].includes(activeTab);
  const isSettings = activeTab === 'settings';
  const isManagerTab = activeTab === 'manager';
  const isAssistantVisible = showAssistant && !isManagerTab && !isSettings;
  const isQuickScanVisible = showQuickScan && !isSettings && !isManagerTab;
  const isQuickScanPrimary = !isAssistantVisible;
  const isMagicBarVisible = !isManagerTab && !isSettings && !isMenuContext;

  const getLogoStyle = () => {
      switch(theme) {
          case 'material': return 'bg-m3-primary text-white shadow-md';
          case 'glass': return 'bg-white/20 text-white backdrop-blur-md border border-white/30';
          case 'neumorphism': return 'bg-[#E0E5EC] text-slate-700 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff]';
          case 'fluent': default: return 'bg-white text-blue-600 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white';
      }
  };

  const getHeaderTitle = () => {
      if (activeTab === 'settings') return 'Settings';
      const tool = MENU_TOOLS.find(t => t.id === activeTab);
      return tool ? tool.label : 'Menu';
  };

  const MenuGrid = () => (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-2 gap-4">
              {MENU_TOOLS.map(tool => (
                  <Card 
                    key={tool.id} 
                    className="!p-4 cursor-pointer active:scale-95 transition-transform flex flex-col items-center justify-center text-center gap-3 min-h-[120px]"
                    onClick={() => setActiveTab(tool.id)}
                  >
                      <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-full mb-1">
                          {tool.icon}
                      </div>
                      <div>
                          <div className="font-bold text-base">{tool.label}</div>
                          <div className="text-xs opacity-60 mt-1 line-clamp-1">{tool.desc}</div>
                      </div>
                  </Card>
              ))}
          </div>
          
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 flex items-start gap-3">
              <Store className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                  <h3 className="font-bold text-blue-800 dark:text-blue-300 text-sm">TradesMen Pro</h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 opacity-80">
                      Version 1.2.0 • Local Storage Active
                  </p>
              </div>
          </div>
      </div>
  );

  return (
      <div className={`min-h-screen transition-colors duration-500 ${styles.appBg} font-sans relative`}>
        <div className="max-w-6xl mx-auto px-4 pt-4 md:py-8 h-[100dvh] flex flex-col">
          
          <header className="flex flex-col gap-2 md:gap-6 mb-2 md:mb-8 flex-shrink-0 z-20 relative">
            <div className="flex justify-between items-center w-full">
                {/* Header Title / Back Button Logic */}
                <div 
                    className="flex items-center gap-3 select-none cursor-pointer group"
                    onClick={() => {
                        if (isMenuContext && activeTab !== 'menu') setActiveTab('menu');
                        else setActiveTab('inventory');
                    }}
                >
                    {isMenuContext && activeTab !== 'menu' ? (
                        <div className="flex items-center gap-2">
                             <div className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10`}>
                                <ChevronLeft className="w-6 h-6" />
                             </div>
                             <h1 className="text-xl font-bold">
                                {getHeaderTitle()}
                             </h1>
                        </div>
                    ) : (
                        <>
                            <div className={`p-2.5 rounded-xl transition-all duration-300 ${getLogoStyle()}`}>
                                <Store className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-display font-bold leading-none">
                                    TradesMen
                                </h1>
                                <p className={`hidden md:block text-[10px] font-medium uppercase tracking-widest opacity-60 ml-0.5 mt-0.5 ${theme === 'glass' ? 'text-white' : ''}`}>
                                    Retail Suite
                                </p>
                            </div>
                        </>
                    )}
                </div>

                <div className="hidden md:block flex-grow max-w-xl mx-8">
                    {isMagicBarVisible && <MagicBar onActivate={handleMagicActivate} />}
                </div>

                {/* Quick Settings Access - Visible on ALL devices */}
                <button 
                    onClick={() => setActiveTab('settings')}
                    className={`p-3 rounded-full transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10`}
                    title="Settings"
                >
                    <SettingsIcon className={`w-6 h-6 ${activeTab === 'settings' ? 'animate-spin-slow' : ''}`} />
                </button>
            </div>

            <div className="md:hidden w-full">
                 {isMagicBarVisible && <MagicBar onActivate={handleMagicActivate} />}
            </div>
          </header>

          {/* Adjusted padding: pb-32 to clear nav bar, ensuring content is visible */}
          <main className={`flex-grow relative ${isManagerTab ? 'overflow-hidden' : 'overflow-y-auto no-scrollbar'} pb-32 md:pb-0`}>
              <AnimatePresence mode="wait">
                  <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 5 }}
                      transition={{ duration: 0.15 }}
                      className="h-full"
                  >
                      {activeTab === 'inventory' && <Inventory inventory={inventory} setInventory={setInventory} />}
                      {activeTab === 'billing' && (
                        <Billing 
                            inventory={inventory}
                            setInventory={setInventory}
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
                      
                      {/* Menu Context Views */}
                      {activeTab === 'menu' && <MenuGrid />}
                      {activeTab === 'reports' && <Reports sales={sales} inventory={inventory} expenses={expenses} />}
                      {activeTab === 'calculator' && <Calculator inventory={inventory} />}
                      {activeTab === 'conversions' && <Conversions />}
                      {activeTab === 'settings' && <Settings />}
                      {activeTab === 'manager' && (
                          <div className="flex flex-col h-full gap-2 md:gap-4 pb-0 md:pb-0">
                              <div className="flex-shrink-0 z-10">
                                <InsightCards inventory={inventory} />
                              </div>
                              <div className="flex-grow overflow-hidden rounded-2xl relative">
                                <ChatInterface variant="page" className="h-full" />
                              </div>
                          </div>
                      )}
                  </motion.div>
              </AnimatePresence>
          </main>
        </div>

        {/* Simplified Mobile Bottom Nav (5 Items) */}
        <div className={`md:hidden fixed bottom-0 left-0 right-0 z-[50] pb-safe pt-2 px-2 transition-all duration-300 ${
             theme === 'glass' ? 'bg-black/40 backdrop-blur-xl border-t border-white/10' : 
             theme === 'neumorphism' ? 'bg-[#E0E5EC] shadow-[0_-5px_10px_#bebebe]' :
             'bg-white dark:bg-[#0f0f0f] border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]'
        }`}>
            <div className="grid grid-cols-5 gap-1 w-full">
              {MAIN_TABS.map((tab) => {
                  const isActive = activeTab === tab.id || (tab.id === 'menu' && isMenuContext);
                  return (
                    <button
                        key={tab.id}
                        onClick={() => {
                             // If clicking Menu while in a sub-tool, go back to main menu grid
                             if (tab.id === 'menu' && isMenuContext) setActiveTab('menu');
                             else setActiveTab(tab.id);
                        }}
                        className={`
                            flex flex-col items-center justify-center py-2 rounded-xl transition-all
                            ${isActive && theme === 'material' ? 'text-[#6750A4]' : ''}
                            ${isActive && theme === 'glass' ? 'text-white bg-white/10' : ''}
                            ${isActive && theme === 'fluent' ? 'text-blue-600' : ''}
                            ${!isActive ? 'opacity-50 grayscale' : 'opacity-100'}
                        `}
                    >
                        <div className={`transition-transform duration-200 ${isActive ? 'scale-110 mb-1' : 'mb-0.5'}`}>
                            {React.cloneElement(tab.icon as React.ReactElement, { className: "w-6 h-6" })}
                        </div>
                        {showNavLabels && (
                          <span className={`text-[10px] font-medium truncate w-full text-center leading-none ${isActive ? 'font-bold' : ''}`}>
                              {tab.label}
                          </span>
                        )}
                        {isActive && <div className="h-1 w-8 bg-current rounded-full mt-1 opacity-20" />}
                    </button>
                  );
              })}
            </div>
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