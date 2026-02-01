
import React, { useState, useEffect } from 'react';
import { Product, CartItem, Customer, Sale, Expense, Supplier, AuthConfig } from './types';
import { getThemeClasses } from './utils/themeUtils';
import useLocalStorage from './hooks/useLocalStorage';
import { useSupabaseSync } from './hooks/useSupabaseSync';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AIProvider, useAI } from './contexts/AIContext';
import AIAssistant, { ChatInterface } from './components/AIAssistant';
import MagicBar from './components/MagicBar';
import QuickScan from './components/QuickScan';
import InsightCards from './components/InsightCards';
import { Card, Button } from './components/ui/BaseComponents';
import TelegramManager from './components/TelegramManager'; 
import LockScreen from './components/LockScreen';

// Components
import Calculator from './components/Calculator';
import Inventory from './components/Inventory';
import Billing from './components/Billing';
import Customers from './components/Customers';
import Conversions from './components/Conversions';
import Settings from './components/Settings';
import Finance from './components/Finance';
import Reports from './components/Reports';
import OnlineStore from './components/OnlineStore';
import Marketing from './components/Marketing';
import Tasks from './components/Tasks';
import Documents from './components/Documents';
import StaffManager from './components/StaffManager';

// Icons
import { Calculator as CalcIcon, Package, ShoppingCart, ArrowRightLeft, Settings as SettingsIcon, Sparkles, Users, PieChart, FileBarChart, Grid, ChevronLeft, Store, Menu, LogOut, LayoutDashboard, ChevronRight, Database, Cloud, Globe, Megaphone, ClipboardList, FolderOpen, Briefcase, LayoutGrid } from 'lucide-react';

// Type for state setters to match useLocalStorage signature
type SetValue<T> = (value: T | ((val: T) => T)) => void;

interface MainLayoutProps {
  inventory: Product[];
  setInventory: SetValue<Product[]>;
  cart: CartItem[];
  setCart: SetValue<CartItem[]>;
  customers: Customer[];
  setCustomers: SetValue<Customer[]>;
  suppliers: Supplier[];
  setSuppliers: SetValue<Supplier[]>;
  sales: Sale[];
  setSales: SetValue<Sale[]>;
  expenses: Expense[];
  setExpenses: SetValue<Expense[]>;
  syncStatus?: string;
  userRole: 'admin' | 'staff';
}

// --- Animated Branding Components ---

const AnimatedLogo: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
    const { theme } = useTheme();
    
    const getLogoStyle = () => {
        switch(theme) {
            case 'material': return 'bg-m3-primary text-white shadow-lg shadow-purple-500/30';
            case 'glass': return 'bg-white/20 text-blue-600 dark:text-white backdrop-blur-md border border-blue-100 dark:border-white/30';
            case 'neumorphism': return 'bg-[#E0E5EC] dark:bg-[#292d3e] text-slate-700 dark:text-gray-200 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#1f2330,-5px_-5px_10px_#33374a]';
            case 'fluent': default: return 'bg-blue-600 text-white shadow-lg shadow-blue-500/30';
        }
    };

    const containerSize = size === 'sm' ? 'p-2 rounded-xl' : 'p-3 rounded-2xl';
    const iconSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

    return (
        <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className={`${containerSize} relative overflow-hidden group ${getLogoStyle()}`}
        >
             <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
             >
                <Store className={`${iconSize} relative z-10`} />
             </motion.div>
             
             {/* Shine Effect */}
             <motion.div 
                initial={{ x: '-150%', skewX: -20 }}
                animate={{ x: '150%', skewX: -20 }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", repeatDelay: 5 }}
                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent z-20 pointer-events-none"
             />
        </motion.div>
    );
};

const AnimatedTitle: React.FC<{ subtitle?: boolean }> = ({ subtitle = true }) => {
    const { theme } = useTheme();
    
    const gradientClass = theme === 'glass' 
        ? 'from-blue-700 via-indigo-600 to-blue-700 dark:from-white dark:via-blue-100 dark:to-white' 
        : theme === 'material' 
            ? 'from-m3-primary via-purple-500 to-m3-primary' 
            : 'from-blue-600 via-indigo-500 to-blue-600 dark:from-blue-400 dark:via-indigo-300 dark:to-blue-400';

    return (
        <div className="flex flex-col justify-center">
            <h1 className={`font-display font-bold leading-none tracking-tight bg-clip-text text-transparent bg-gradient-to-r bg-300% animate-gradient ${gradientClass} ${subtitle ? 'text-2xl' : 'text-xl'}`}>
                TradesMen
            </h1>
            {subtitle && (
                <motion.p 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 0.6, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5 pl-0.5 ${theme === 'glass' ? 'text-slate-600 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    Pro Suite
                </motion.p>
            )}
        </div>
    );
};

// Helper for Icon Animations
const getIconVariant = (id: string) => {
    switch (id) {
        case 'inventory': 
            return {
                active: { rotate: [0, -10, 10, -10, 10, 0], transition: { duration: 0.6, repeat: Infinity, repeatDelay: 3 } },
                initial: { rotate: 0 },
                hover: { rotate: [0, -10, 10, 0], transition: { duration: 0.3 } }
            };
        case 'billing':
            return {
                active: { x: [0, 3, -3, 3, -3, 0], transition: { duration: 0.6, repeat: Infinity, repeatDelay: 3 } },
                initial: { x: 0 },
                hover: { scale: 1.1 }
            };
        case 'customers':
             return {
                active: { scale: [1, 1.15, 1], transition: { duration: 1, repeat: Infinity, repeatDelay: 2 } },
                initial: { scale: 1 },
                hover: { scale: 1.1 }
            };
        case 'online_store':
             return {
                active: { rotate: 360, transition: { duration: 2, repeat: Infinity, ease: "linear" } },
                initial: { rotate: 0 },
                hover: { rotate: 180 }
            };
        case 'manager':
             return {
                active: { rotate: 360, scale: [1, 1.1, 1], transition: { rotate: { duration: 4, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } } },
                initial: { rotate: 0, scale: 1 },
                hover: { rotate: 90 }
            };
        case 'menu':
             return {
                active: { 
                    rotate: [0, 45, 0, 45, 0], 
                    scale: [1, 1.2, 1],
                    transition: { duration: 0.6 }
                },
                initial: { rotate: 0, scale: 1 },
                hover: { scale: 1.1, rotate: 10 }
            };
        case 'settings':
             return {
                active: { rotate: 180 },
                initial: { rotate: 0 },
                hover: { rotate: 90 }
             };
        // Menu Tools
        case 'finance': return { active: { scale: [1, 0.9, 1.1, 1], transition: { repeat: Infinity, repeatDelay: 2 } }, initial: { scale: 1 }, hover: { scale: 1.1 } };
        case 'reports': return { active: { y: [0, -3, 0], transition: { repeat: Infinity, repeatDelay: 1 } }, initial: { y: 0 }, hover: { y: -3 } };
        case 'marketing': return { active: { rotate: [0, -20, 20, -20, 20, 0], transition: { repeat: Infinity, repeatDelay: 2 } }, initial: { rotate: 0 }, hover: { rotate: 20 } };
        case 'calculator': return { active: { rotate: [0, 10, -10, 0], transition: { repeat: Infinity, repeatDelay: 2 } }, initial: { rotate: 0 }, hover: { rotate: 10 } };
        case 'conversions': return { active: { rotate: 180 }, initial: { rotate: 0 }, hover: { rotate: 180 } };
        case 'tasks': return { active: { rotate: [0, 15, -15, 0], transition: { repeat: Infinity, repeatDelay: 3 } }, initial: { rotate: 0 }, hover: { rotate: 5 } };
        case 'docs': return { active: { scale: [1, 1.1, 1], transition: { repeat: Infinity, repeatDelay: 2 } }, initial: { scale: 1 }, hover: { scale: 1.1 } };
        case 'staff': return { active: { y: [0, -2, 2, 0], transition: { repeat: Infinity, repeatDelay: 2 } }, initial: { y: 0 }, hover: { y: -2 } };
        default: return { active: { scale: 1.1 }, initial: { scale: 1 }, hover: { scale: 1.1 } };
    }
};

const MainLayout: React.FC<MainLayoutProps> = ({ 
  inventory, setInventory, cart, setCart, customers, setCustomers, suppliers, setSuppliers, sales, setSales, expenses, setExpenses, syncStatus, userRole
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
    // Removed Online Store from here to put in More menu
    { id: 'manager', label: 'Manager', icon: <Sparkles className="w-5 h-5" /> },
  ];
  
  // Mobile only tab - Updated Icon to LayoutGrid
  const MOBILE_MENU_TAB = { id: 'menu', label: 'More', icon: <LayoutGrid className="w-5 h-5" /> };

  // Secondary Tools (Available in More Menu on Mobile, Sidebar on Desktop)
  // FILTERED BY ROLE
  const MENU_TOOLS = [
    { id: 'online_store', label: 'Online Store', icon: <Globe className="w-5 h-5" />, desc: 'Orders & Dispatch' },
    ...(userRole === 'admin' ? [{ id: 'finance', label: 'Business Biz', icon: <PieChart className="w-5 h-5" />, desc: 'Expenses & Profits' }] : []),
    ...(userRole === 'admin' ? [{ id: 'marketing', label: 'Marketing', icon: <Megaphone className="w-5 h-5" />, desc: 'Campaigns & Offers' }] : []),
    ...(userRole === 'admin' ? [{ id: 'reports', label: 'Reports', icon: <FileBarChart className="w-5 h-5" />, desc: 'GSTR-1 & Stock' }] : []),
    { id: 'tasks', label: 'Tasks', icon: <ClipboardList className="w-5 h-5" />, desc: 'To-Do & Operations' },
    { id: 'staff', label: 'Staff Book', icon: <Briefcase className="w-5 h-5" />, desc: 'Attendance & Pay' },
    { id: 'docs', label: 'Locker', icon: <FolderOpen className="w-5 h-5" />, desc: 'Docs & Licenses' },
    { id: 'calculator', label: 'Calculator', icon: <CalcIcon className="w-5 h-5" />, desc: 'Price & Weight' },
    { id: 'conversions', label: 'Tools', icon: <ArrowRightLeft className="w-5 h-5" />, desc: 'Converter & Bulk' },
  ];

  // Restrict Manager Tab for Staff
  if (userRole === 'staff') {
      const idx = MAIN_TABS.findIndex(t => t.id === 'manager');
      if(idx > -1) MAIN_TABS.splice(idx, 1);
  }

  const handleMagicActivate = () => {
    setActiveTab('manager');
  };
  
  const handleNavClick = (id: string) => {
      // Haptic feedback for mobile
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(10);
      }
      setActiveTab(id);
  };

  const isMenuContext = ['menu', 'online_store', 'finance', 'calculator', 'conversions', 'reports', 'settings', 'marketing', 'tasks', 'docs', 'staff'].includes(activeTab);
  const isSettings = activeTab === 'settings';
  const isManagerTab = activeTab === 'manager';
  const isAssistantVisible = showAssistant && !isManagerTab && !isSettings && userRole === 'admin';
  const isQuickScanVisible = showQuickScan && !isSettings && !isManagerTab;
  const isQuickScanPrimary = !isAssistantVisible;
  const isMagicBarVisible = !isManagerTab && !isSettings && !isMenuContext && userRole === 'admin';

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
                      <motion.div 
                        variants={getIconVariant(tool.id)}
                        initial="initial"
                        whileHover="active"
                        className="p-3 bg-gray-50 dark:bg-white/5 rounded-full mb-1 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300"
                      >
                          {tool.icon}
                      </motion.div>
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
                  <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-blue-600 dark:text-blue-400 opacity-80">
                          Version 1.4.0 • {userRole === 'admin' ? 'Admin' : 'Staff'} Mode
                      </p>
                      {syncStatus && syncStatus !== 'idle' && (
                          <div className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${
                              syncStatus === 'synced' ? 'bg-green-100 text-green-700' : 
                              syncStatus === 'syncing' ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-red-100 text-red-700'
                          }`}>
                              <Cloud className="w-3 h-3" />
                              {syncStatus === 'synced' ? 'Saved' : syncStatus === 'syncing' ? 'Syncing...' : 'Error'}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </div>
  );
  
  // Render Sidebar Item
  const SidebarItem = ({ id, label, icon }: { id: string, label: string, icon: React.ReactNode }) => {
      const isActive = activeTab === id;
      return (
        <button
            onClick={() => handleNavClick(id)}
            className={`${styles.navItemBase} w-full group overflow-hidden ${isActive ? styles.navItemActive : styles.navItemInactive}`}
        >
            {isActive && theme !== 'neumorphism' && (
                <motion.div 
                    layoutId="sidebarActive"
                    className={styles.navActiveIndicator}
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
            
            {/* Special handling for Fluent vertical bar */}
            {isActive && theme === 'fluent' && (
                <motion.div 
                    layoutId="fluentActive"
                    className={styles.navActiveIndicator}
                />
            )}

            <motion.div
                variants={getIconVariant(id)}
                initial="initial"
                animate={isActive ? "active" : "initial"}
                whileHover={isActive ? "active" : "hover"}
                className="relative z-10"
            >
                {icon}
            </motion.div>
            <span className="relative z-10">{label}</span>
            
            {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50 relative z-10" />}
        </button>
      );
  };

  return (
      <div className={`flex h-[100dvh] w-full overflow-hidden transition-colors duration-500 ${styles.appBg} font-sans bg-dot-pattern`}>
          <TelegramManager /> 

          {/* LAYOUT CONTAINER */}
          <div className="flex w-full h-full flex-col md:flex-row md:p-4 md:gap-4 overflow-hidden relative">

              {/* --- DESKTOP FLOATING SIDEBAR --- */}
              <aside className={`hidden md:flex flex-col w-72 flex-shrink-0 z-30 rounded-3xl shadow-xl transition-all duration-300 h-full ${styles.sidebarContainer}`}>
                  {/* Sidebar Header */}
                  <div className="p-6 flex items-center gap-3 mb-2 flex-shrink-0">
                      <AnimatedLogo size="md" />
                      <AnimatedTitle subtitle={true} />
                  </div>

                  {/* Navigation Items */}
                  <div className="flex-grow overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
                      <div className="text-xs font-bold opacity-40 uppercase tracking-widest px-4 mb-3 mt-2">Operations</div>
                      {MAIN_TABS.map((tab, idx) => (
                          <motion.div 
                            key={tab.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                             <SidebarItem {...tab} />
                          </motion.div>
                      ))}

                      <div className="text-xs font-bold opacity-40 uppercase tracking-widest px-4 mb-3 mt-8">Business Tools</div>
                      {MENU_TOOLS.map((tool, idx) => (
                          <motion.div 
                            key={tool.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + (idx * 0.05) }}
                          >
                            <SidebarItem {...tool} />
                          </motion.div>
                      ))}
                  </div>

                  {/* Sidebar Footer */}
                  {userRole === 'admin' && (
                      <div className="p-4 mt-2 flex-shrink-0">
                          <SidebarItem id="settings" label="Settings" icon={<SettingsIcon className={`w-5 h-5`} />} />
                      </div>
                  )}
              </aside>


              {/* --- MAIN CONTENT AREA --- */}
              <div className="flex-1 flex flex-col h-full overflow-hidden relative md:rounded-3xl transition-all duration-300 w-full">
                
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
                                        {/* FIXED: Explicit colors for mobile header title in Glass mode */}
                                        <h1 className={`text-xl font-bold ${theme === 'glass' ? 'text-slate-900 dark:text-white' : ''}`}>
                                            {getHeaderTitle()}
                                        </h1>
                                    </div>
                                ) : (
                                    <>
                                        <AnimatedLogo size="sm" />
                                        <AnimatedTitle subtitle={false} />
                                    </>
                                )}
                            </div>

                            {/* Desktop Page Title */}
                            <div className="hidden md:flex flex-col">
                                <h2 className={`text-3xl font-display font-bold capitalize tracking-tight ${theme === 'glass' ? 'text-slate-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}>
                                    {activeTab === 'menu' ? 'Dashboard' : 
                                    MENU_TOOLS.find(t => t.id === activeTab)?.label || 
                                    MAIN_TABS.find(t => t.id === activeTab)?.label || 
                                    'Settings'}
                                </h2>
                                <p className="text-sm opacity-50 hidden lg:block">Manage your business efficiently</p>
                            </div>
                        </div>

                        {/* Magic Bar */}
                        <div className="hidden md:block flex-grow max-w-xl mx-8">
                            {isMagicBarVisible && <MagicBar onActivate={handleMagicActivate} />}
                        </div>

                        {/* Settings Icon / Cloud Status */}
                        <div className="flex items-center gap-2">
                            {syncStatus && syncStatus !== 'idle' && (
                                <div className={`md:flex hidden items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                    syncStatus === 'synced' ? 'bg-green-100 text-green-700' : 
                                    syncStatus === 'syncing' ? 'bg-yellow-100 text-yellow-700' : 
                                    'bg-red-100 text-red-700'
                                }`}>
                                    <Cloud className="w-3 h-3" />
                                </div>
                            )}
                            {userRole === 'admin' && (
                                <motion.button 
                                    onClick={() => setActiveTab('settings')}
                                    className={`md:hidden p-3 rounded-full transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10`}
                                    title="Settings"
                                    variants={getIconVariant('settings')}
                                    initial="initial"
                                    animate={activeTab === 'settings' ? 'active' : 'initial'}
                                >
                                    <SettingsIcon className={`w-6 h-6`} />
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* Mobile Magic Bar */}
                    <div className="md:hidden w-full">
                        {isMagicBarVisible && <MagicBar onActivate={handleMagicActivate} />}
                    </div>
                </header>

                {/* Content Container */}
                {/* Increased pb-40 for mobile to allow safe scrolling past floating elements */}
                <main className={`flex-grow relative ${isManagerTab ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'} pb-40 md:pb-0 px-4 md:px-4 w-full`}>
                    <div className="w-full max-w-[1600px] h-full mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10, scale: 0.99 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="h-full w-full"
                            >
                                {activeTab === 'inventory' && <Inventory inventory={inventory} setInventory={setInventory} userRole={userRole} />}
                                {activeTab === 'billing' && (
                                    <Billing 
                                        inventory={inventory}
                                        setInventory={setInventory}
                                        cart={cart} setCart={setCart} 
                                        customers={customers} setCustomers={setCustomers}
                                        sales={sales} setSales={setSales}
                                    />
                                )}
                                {activeTab === 'online_store' && (
                                    <OnlineStore 
                                        inventory={inventory} 
                                        setInventory={setInventory} 
                                        sales={sales} 
                                        setSales={setSales} 
                                    />
                                )}
                                {activeTab === 'finance' && userRole === 'admin' && (
                                    <Finance 
                                        sales={sales} 
                                        expenses={expenses} setExpenses={setExpenses}
                                        customers={customers} setCustomers={setCustomers}
                                    />
                                )}
                                {activeTab === 'customers' && (
                                    <Customers 
                                        customers={customers} setCustomers={setCustomers} 
                                        suppliers={suppliers} setSuppliers={setSuppliers}
                                    />
                                )}
                                
                                {activeTab === 'menu' && <MenuGrid />}
                                {activeTab === 'reports' && userRole === 'admin' && <Reports sales={sales} inventory={inventory} expenses={expenses} />}
                                {activeTab === 'marketing' && userRole === 'admin' && <Marketing customers={customers} sales={sales} />}
                                {activeTab === 'tasks' && <Tasks />}
                                {activeTab === 'staff' && <StaffManager />}
                                {activeTab === 'docs' && <Documents />}
                                {activeTab === 'calculator' && <Calculator inventory={inventory} />}
                                {activeTab === 'conversions' && <Conversions />}
                                {activeTab === 'settings' && userRole === 'admin' && <Settings />}
                                {activeTab === 'manager' && userRole === 'admin' && (
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
              </div>
          </div>

          {/* --- MOBILE FLOATING BOTTOM NAV --- */}
          <div className={`md:hidden fixed bottom-0 left-0 right-0 z-[50] pb-safe pointer-events-none`}>
              <div className={`pointer-events-auto ${styles.bottomNavContainer} flex justify-around items-center p-2 relative`}>
                  {[...MAIN_TABS, MOBILE_MENU_TAB].map((tab) => {
                      const isActive = activeTab === tab.id || (tab.id === 'menu' && isMenuContext);
                      const animId = tab.id === 'menu' && isMenuContext ? 'menu' : tab.id;

                      return (
                          <button
                              key={tab.id}
                              onClick={() => {
                                  handleNavClick(tab.id === 'menu' && isMenuContext ? 'menu' : tab.id);
                              }}
                              className={`
                                  relative flex flex-col items-center justify-center p-2 rounded-xl transition-all flex-1 h-14 group
                                  ${isActive && theme === 'neumorphism' ? styles.navItemActive : ''}
                              `}
                          >
                              {isActive && theme !== 'neumorphism' && (
                                  <motion.div 
                                    layoutId="bottomNavIndicator"
                                    className={styles.navActiveIndicator}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                  />
                              )}

                              <motion.div
                                  variants={getIconVariant(animId)}
                                  initial="initial"
                                  animate={isActive ? "active" : "initial"}
                                  className={`relative z-10 ${isActive ? '' : 'opacity-50'}`}
                              >
                                  {React.cloneElement(tab.icon as React.ReactElement<any>, { className: "w-6 h-6" })}
                              </motion.div>
                              
                              {showNavLabels && (
                                <span className={`relative z-10 text-[10px] font-medium leading-none mt-1 transition-all ${isActive ? 'opacity-100 font-bold' : 'opacity-0 h-0'}`}>
                                    {tab.label}
                                </span>
                              )}
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
  const [inventory, setInventory] = useLocalStorage<Product[]>('tradesmen-inventory', []);
  const [cart, setCart] = useLocalStorage<CartItem[]>('tradesmen-cart', []);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('tradesmen-customers', []);
  const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>('tradesmen-suppliers', []);
  const [sales, setSales] = useLocalStorage<Sale[]>('tradesmen-sales', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('tradesmen-expenses', []);
  
  // Auth State
  const [authConfig] = useLocalStorage<AuthConfig>('tradesmen-auth-config', { adminPin: '1234', staffPin: '0000', enableLock: false });
  const [isLocked, setIsLocked] = useState(authConfig.enableLock);
  const [userRole, setUserRole] = useState<'admin' | 'staff'>('admin');

  // Sync Hooks for each major data category
  const invStatus = useSupabaseSync('inventory', inventory, setInventory);
  const custStatus = useSupabaseSync('customers', customers, setCustomers);
  const suppStatus = useSupabaseSync('suppliers', suppliers, setSuppliers);
  const salesStatus = useSupabaseSync('sales', sales, setSales);
  const expStatus = useSupabaseSync('expenses', expenses, setExpenses);

  // Aggregate Status
  const aggregateStatus = [invStatus, custStatus, suppStatus, salesStatus, expStatus].includes('error') ? 'error' 
                        : [invStatus, custStatus, suppStatus, salesStatus, expStatus].includes('syncing') ? 'syncing' 
                        : [invStatus, custStatus, suppStatus, salesStatus, expStatus].every(s => s === 'synced' || s === 'idle') ? 'synced' 
                        : 'idle';

  const handleUnlock = (role: 'admin' | 'staff') => {
      setUserRole(role);
      setIsLocked(false);
  };

  return (
    <>
      <LockScreen 
          isLocked={isLocked} 
          config={authConfig} 
          onUnlock={handleUnlock} 
      />
      
      {!isLocked && (
          <AIProvider 
              inventory={inventory} 
              setInventory={setInventory} 
              cart={cart} 
              setCart={setCart}
              sales={sales}
              expenses={expenses}
              customers={customers}
          >
            <MainLayout 
              inventory={inventory} 
              setInventory={setInventory}
              cart={cart}
              setCart={setCart}
              customers={customers}
              setCustomers={setCustomers}
              suppliers={suppliers}
              setSuppliers={setSuppliers}
              sales={sales}
              setSales={setSales}
              expenses={expenses}
              setExpenses={setExpenses}
              syncStatus={aggregateStatus}
              userRole={userRole}
            />
          </AIProvider>
      )}
    </>
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
