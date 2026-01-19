
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
import { Card, Button } from './components/ui/BaseComponents';

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
import { Calculator as CalcIcon, Package, ShoppingCart, ArrowRightLeft, Settings as SettingsIcon, Sparkles, Users, PieChart, FileBarChart, Grid, ChevronLeft, Store, Menu, LogOut, LayoutDashboard, ChevronRight } from 'lucide-react';

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

  // Primary Navigation (Bottom Bar / Sidebar)
  const MAIN_TABS = [
    { id: 'inventory', label: 'Items', icon: <Package className="w-5 h-5" /> },
    { id: 'billing', label: 'Bill', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'customers', label: 'Parties', icon: <Users className="w-5 h-5" /> },
    { id: 'manager', label: 'Manager', icon: <Sparkles className="w-5 h-5" /> },
  ];
  
  // Mobile only tab
  const MOBILE_MENU_TAB = { id: 'menu', label: 'More', icon: <Menu className="w-5 h-5" /> };

  // Secondary Tools (Available in More Menu on Mobile, Sidebar on Desktop)
  const MENU_TOOLS = [
    { id: 'finance', label: 'Business Biz', icon: <PieChart className="w-5 h-5" />, desc: 'Expenses & Profits' },
    { id: 'reports', label: 'Reports', icon: <FileBarChart className="w-5 h-5" />, desc: 'GSTR-1 & Stock' },
    { id: 'calculator', label: 'Calculator', icon: <CalcIcon className="w-5 h-5" />, desc: 'Price & Weight' },
    { id: 'conversions', label: 'Tools', icon: <ArrowRightLeft className="w-5 h-5" />, desc: 'Converter & Bulk' },
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
          case 'material': return 'bg-m3-primary text-white shadow-lg shadow-purple-500/30';
          case 'glass': return 'bg-white/20 text-white backdrop-blur-md border border-white/30';
          case 'neumorphism': return 'bg-[#E0E5EC] dark:bg-[#292d3e] text-slate-700 dark:text-gray-200 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#1f2330,-5px_-5px_10px_#33374a]';
          case 'fluent': default: return 'bg-blue-600 text-white shadow-lg shadow-blue-500/30';
      }
  };

  const getHeaderTitle = () => {
      if (activeTab === 'settings') return 'Settings';
      const tool = MENU_TOOLS.find(t => t.id === activeTab);
      return tool ? tool.label : 'Menu';
  };

  const MenuGrid = () => (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {MENU_TOOLS.map(tool => (
                  <Card 
                    key={tool.id} 
                    className="!p-4 cursor-pointer active:scale-95 transition-transform flex flex-col items-center justify-center text-center gap-3 min-h-[120px] hover:shadow-lg group"
                    onClick={() => setActiveTab(tool.id)}
                  >
                      <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-full mb-1 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
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
      <div className={`flex h-screen w-full overflow-hidden transition-colors duration-500 ${styles.appBg} font-sans bg-dot-pattern`}>
          
          {/* --- DESKTOP FLOATING SIDEBAR --- */}
          {/* Changed from fixed side to floating island design */}
          <aside className={`hidden md:flex flex-col w-72 flex-shrink-0 z-30 m-4 rounded-3xl shadow-2xl transition-all duration-300 ${styles.surface}`}>
              {/* Sidebar Header */}
              <div className="p-6 flex items-center gap-3 mb-2">
                  <div className={`p-3 rounded-2xl ${getLogoStyle()}`}>
                      <Store className="w-6 h-6" />
                  </div>
                  <div>
                      <h1 className="text-2xl font-display font-bold leading-none tracking-tight">TradesMen</h1>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1 pl-0.5">Pro Suite</p>
                  </div>
              </div>

              {/* Navigation Items */}
              <div className="flex-grow overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
                  <div className="text-xs font-bold opacity-40 uppercase tracking-widest px-4 mb-3 mt-2">Operations</div>
                  {MAIN_TABS.map(tab => {
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all group relative overflow-hidden ${
                                isActive 
                                    ? styles.sidebarActive
                                    : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
                            }`}
                        >
                            {/* Active Indicator Line */}
                            {isActive && theme !== 'neumorphism' && theme !== 'glass' && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-current rounded-r-full opacity-50" />
                            )}

                            <span className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                {tab.icon}
                            </span>
                            <span className="relative z-10">{tab.label}</span>
                            
                            {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
                        </button>
                      );
                  })}

                  <div className="text-xs font-bold opacity-40 uppercase tracking-widest px-4 mb-3 mt-8">Business Tools</div>
                  {MENU_TOOLS.map(tool => {
                      const isActive = activeTab === tool.id;
                      return (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTab(tool.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all group ${
                                isActive 
                                    ? styles.sidebarActive
                                    : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
                            }`}
                        >
                            <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                {tool.icon}
                            </span>
                            <span>{tool.label}</span>
                        </button>
                      );
                  })}
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 mt-2">
                  <button
                      onClick={() => setActiveTab('settings')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                          activeTab === 'settings' 
                             ? styles.sidebarActive
                             : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
                      }`}
                  >
                      <SettingsIcon className={`w-5 h-5 ${activeTab === 'settings' ? 'animate-spin-slow' : ''}`} />
                      Settings
                  </button>
              </div>
          </aside>


          {/* --- MAIN CONTENT AREA --- */}
          {/* Desktop: Floats right with rounding. Mobile: Full width. */}
          <div className="flex-1 flex flex-col h-full overflow-hidden relative md:m-4 md:ml-0 md:rounded-3xl transition-all duration-300">
            
            {/* Header (Adaptive) */}
            <header className="flex-shrink-0 px-4 py-3 md:py-0 md:mb-4 md:px-4 z-20 flex flex-col gap-2">
                <div className="flex justify-between items-center w-full min-h-[48px]">
                    {/* Mobile: Logo / Desktop: Page Title */}
                    <div 
                        className="flex items-center gap-3 select-none cursor-pointer md:cursor-default"
                        onClick={() => {
                            // Mobile Only: Back behavior
                            if (window.innerWidth < 768) {
                                if (isMenuContext && activeTab !== 'menu') setActiveTab('menu');
                                else setActiveTab('inventory');
                            }
                        }}
                    >
                        {/* Mobile Back Button Logic */}
                        <div className="md:hidden flex items-center gap-2">
                            {(isMenuContext && activeTab !== 'menu') ? (
                                <div className="flex items-center gap-2">
                                     <div className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10`}>
                                        <ChevronLeft className="w-6 h-6" />
                                     </div>
                                     <h1 className="text-xl font-bold">{getHeaderTitle()}</h1>
                                </div>
                            ) : (
                                <>
                                    <div className={`p-2 rounded-xl transition-all duration-300 ${getLogoStyle()}`}>
                                        <Store className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-display font-bold leading-none">TradesMen</h1>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Desktop Page Title - Now integrated into the layout better */}
                        <div className="hidden md:flex flex-col">
                            <h2 className={`text-3xl font-display font-bold capitalize tracking-tight ${theme === 'glass' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                {activeTab === 'menu' ? 'Dashboard' : 
                                 MENU_TOOLS.find(t => t.id === activeTab)?.label || 
                                 MAIN_TABS.find(t => t.id === activeTab)?.label || 
                                 'Settings'}
                            </h2>
                            <p className="text-sm opacity-50 hidden lg:block">Manage your business efficiently</p>
                        </div>
                    </div>

                    {/* Magic Bar: Centered on Desktop, Auto on Mobile */}
                    <div className="hidden md:block flex-grow max-w-xl mx-8">
                        {isMagicBarVisible && <MagicBar onActivate={handleMagicActivate} />}
                    </div>

                    {/* Mobile Settings Icon */}
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className={`md:hidden p-3 rounded-full transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10`}
                        title="Settings"
                    >
                        <SettingsIcon className={`w-6 h-6 ${activeTab === 'settings' ? 'animate-spin-slow' : ''}`} />
                    </button>
                </div>

                {/* Mobile Magic Bar (Second Row) */}
                <div className="md:hidden w-full">
                    {isMagicBarVisible && <MagicBar onActivate={handleMagicActivate} />}
                </div>
            </header>

            {/* Scrollable Content Container */}
            {/* Added max-w-screen-2xl for better Ultra-wide support */}
            <main className={`flex-grow relative ${isManagerTab ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'} pb-32 md:pb-0 px-4 md:px-4`}>
                <div className="w-full max-w-[1600px] h-full mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10, scale: 0.99 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.99 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
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
                                <div className="flex flex-col h-full gap-4 pb-0 md:pb-6">
                                    <div className="flex-shrink-0 z-10">
                                        <InsightCards inventory={inventory} />
                                    </div>
                                    <div className={`flex-grow overflow-hidden rounded-3xl relative border shadow-xl ${theme === 'glass' ? 'border-white/20 bg-black/20' : 'border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800'}`}>
                                        <ChatInterface variant="page" className="h-full border-none shadow-none bg-transparent" />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

             {/* --- MOBILE BOTTOM NAV (Hidden on Desktop) --- */}
            <div className={`md:hidden fixed bottom-0 left-0 right-0 z-[50] pb-safe pt-2 px-2 transition-all duration-300 rounded-t-2xl ${
                theme === 'glass' ? 'bg-black/40 backdrop-blur-xl border-t border-white/10' : 
                theme === 'neumorphism' ? 'bg-[#E0E5EC] dark:bg-[#292d3e] shadow-[0_-5px_10px_#bebebe] dark:shadow-[0_-5px_10px_#1f2330]' :
                'bg-white dark:bg-[#0f0f0f] border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]'
            }`}>
                <div className="grid grid-cols-5 gap-1 w-full">
                {[...MAIN_TABS, MOBILE_MENU_TAB].map((tab) => {
                    const isActive = activeTab === tab.id || (tab.id === 'menu' && isMenuContext);
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                if (tab.id === 'menu' && isMenuContext) setActiveTab('menu');
                                else setActiveTab(tab.id);
                            }}
                            className={`
                                flex flex-col items-center justify-center py-2 rounded-xl transition-all
                                ${isActive && theme === 'material' ? 'text-[#6750A4]' : ''}
                                ${isActive && theme === 'glass' ? 'text-white bg-white/10' : ''}
                                ${isActive && theme === 'fluent' ? 'text-blue-600' : ''}
                                ${isActive && theme === 'neumorphism' ? 'text-blue-600 dark:text-blue-400 shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_6px_#1f2330,inset_-3px_-3px_6px_#33374a] bg-[#E0E5EC] dark:bg-[#292d3e]' : ''}
                                ${!isActive ? 'opacity-50 grayscale' : 'opacity-100'}
                            `}
                        >
                            <div className={`transition-transform duration-200 ${isActive ? 'scale-110 mb-1' : 'mb-0.5'}`}>
                                {React.cloneElement(tab.icon as React.ReactElement<any>, { className: "w-6 h-6" })}
                            </div>
                            {showNavLabels && (
                            <span className={`text-[10px] font-medium truncate w-full text-center leading-none ${isActive ? 'font-bold' : ''}`}>
                                {tab.label}
                            </span>
                            )}
                            {isActive && theme !== 'neumorphism' && <div className="h-1 w-8 bg-current rounded-full mt-1 opacity-20" />}
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
      </div>
  );
};

const AppDataWrapper: React.FC = () => {
  const [inventory, setInventory] = useLocalStorage<Product[]>('tradesmen-inventory', []);
  const [cart, setCart] = useLocalStorage<CartItem[]>('tradesmen-cart', []);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('tradesmen-customers', []);
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
