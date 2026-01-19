
import { ThemeType } from '../types';

export const getThemeClasses = (theme: ThemeType) => {
  switch (theme) {
    case 'material':
      return {
        // Material 3 Inspired: Clean, Rounded, Elevated on Focus
        appBg: 'bg-[#f8f9fa] dark:bg-[#121212] text-[#1D192B] dark:text-[#E6E1E5]',
        surface: 'bg-[#FFFFFF] dark:bg-[#1E1E1E]',
        card: 'bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-sm border border-gray-100 dark:border-[#2C2C2C] p-6 transition-all hover:shadow-lg duration-300',
        
        // Navigation
        sidebarContainer: 'bg-[#F3EDF7] dark:bg-[#202020] border-r border-transparent',
        bottomNavContainer: 'bg-[#F3EDF7] dark:bg-[#2B2930] shadow-lg mb-4 mx-4 rounded-2xl',
        navItemBase: 'relative flex items-center gap-3 px-4 py-3.5 rounded-full text-sm font-medium transition-all duration-300',
        navItemActive: 'text-[#1D192B] dark:text-[#E6E1E5] font-bold',
        navItemInactive: 'text-[#49454F] dark:text-[#CAC4D0] hover:bg-black/5 dark:hover:bg-white/5',
        navActiveIndicator: 'absolute inset-0 bg-[#E8DEF8] dark:bg-[#4A4458] rounded-full shadow-sm',

        // Buttons
        buttonPrimary: 'bg-[#6750A4] dark:bg-[#D0BCFF] text-white dark:text-[#381E72] rounded-full px-6 py-3 font-medium shadow-md hover:shadow-xl hover:bg-[#5F489A] dark:hover:bg-[#E8DEF8] active:scale-[0.98] transition-all duration-300',
        buttonSecondary: 'bg-transparent text-[#6750A4] dark:text-[#D0BCFF] border border-[#79747E] dark:border-[#938F99] rounded-full px-6 py-3 font-medium hover:bg-[#6750A4]/5 dark:hover:bg-[#D0BCFF]/10 active:scale-[0.98] transition-all',
        
        // Inputs
        label: 'text-[#6750A4] dark:text-[#D0BCFF] text-xs font-bold tracking-wide mb-2 ml-1 block uppercase',
        inputWrapper: 'bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-2xl px-4 flex items-center min-h-[52px] transition-all duration-300 shadow-sm focus-within:shadow-lg focus-within:border-[#6750A4] dark:focus-within:border-[#D0BCFF] focus-within:-translate-y-0.5',
        inputField: 'bg-transparent w-full h-full py-3 outline-none text-[#1D192B] dark:text-[#E6E1E5] placeholder-gray-400 dark:placeholder-gray-500 text-base font-medium',
        inputIcon: 'text-[#6750A4] dark:text-[#D0BCFF] mr-3 opacity-70',
        
        // Misc
        accentText: 'text-[#6750A4] dark:text-[#D0BCFF]',
        
        // Dropdown
        dropdownMenu: 'bg-white dark:bg-[#252525] rounded-2xl shadow-xl border border-gray-100 dark:border-[#333] mt-2 p-2 z-[60]',
        dropdownItem: 'p-3 rounded-xl hover:bg-[#F3EDF7] dark:hover:bg-[#333] transition-colors text-sm font-medium text-[#1D192B] dark:text-[#E6E1E5] cursor-pointer relative flex items-center gap-2',
        dropdownItemActive: 'bg-[#E8DEF8] dark:bg-[#4A4458] font-bold text-[#1D192B] dark:text-[#E6E1E5]',
      };
    case 'glass':
      return {
        // Professional Glass (Adaptive): Clean, Legible, Modern
        appBg: 'bg-[#F0F4F8] dark:bg-[#0F172A] min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-500 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/20',
        
        surface: 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10',
        
        // Cards: High readability with soft frosting
        card: 'bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-3xl shadow-sm hover:shadow-md transition-all p-6',
        
        // Navigation
        sidebarContainer: 'bg-white/60 dark:bg-slate-900/80 backdrop-blur-xl border-r border-white/20 dark:border-white/5',
        bottomNavContainer: 'bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-white/5 mb-4 mx-4 rounded-2xl shadow-lg',
        
        navItemBase: 'relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300',
        navItemActive: 'text-blue-700 dark:text-blue-300 font-bold bg-white/50 dark:bg-white/5 shadow-sm border border-white/50 dark:border-white/5',
        navItemInactive: 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5',
        navActiveIndicator: 'hidden', 

        // Buttons
        buttonPrimary: 'bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-500 border border-transparent rounded-2xl px-6 py-3 font-semibold shadow-md transition-all active:scale-[0.98]',
        buttonSecondary: 'bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-2xl px-6 py-3 font-medium transition-all active:scale-[0.98]',
        
        // Inputs: Distinct background for contrast
        label: 'text-slate-500 dark:text-slate-400 text-xs font-bold tracking-widest mb-2 ml-1 block uppercase',
        inputWrapper: 'bg-white/60 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl px-4 flex items-center min-h-[52px] transition-all duration-300 focus-within:bg-white dark:focus-within:bg-black/40 focus-within:border-blue-500/50 focus-within:shadow-md',
        inputField: 'bg-transparent w-full h-full py-3 outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-base font-medium',
        inputIcon: 'text-slate-400 dark:text-slate-500 mr-3',
        
        // Misc
        accentText: 'text-blue-600 dark:text-blue-400 font-bold',
        
        // Dropdown
        dropdownMenu: 'bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-xl mt-2 p-2 z-[60]',
        dropdownItem: 'p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm text-slate-700 dark:text-slate-200 cursor-pointer relative flex items-center gap-2',
        dropdownItemActive: 'bg-slate-100 dark:bg-white/10 font-bold text-slate-900 dark:text-white',
      };
    case 'neumorphism':
      return {
        // Neumorphism: Soft Shadows, No Borders, Slate Text
        appBg: 'bg-[#E0E5EC] dark:bg-[#292d3e] text-[#475569] dark:text-[#cbd5e1] transition-colors duration-300',
        surface: 'bg-[#E0E5EC] dark:bg-[#292d3e]', 
        // Card: Removed border to fix white edge. Adjusted shadows for perfect 3D look without white halos.
        // Standardized radius to 24px (rounded-3xl).
        card: 'bg-[#E0E5EC] dark:bg-[#292d3e] rounded-3xl shadow-[9px_9px_16px_#a3b1c6,-9px_-9px_16px_#ffffff] dark:shadow-[8px_8px_16px_#1f2330,-8px_-8px_16px_#33374a] p-6 border-none', 
        
        // Navigation
        sidebarContainer: 'bg-[#E0E5EC] dark:bg-[#292d3e]',
        bottomNavContainer: 'bg-[#E0E5EC] dark:bg-[#292d3e] shadow-[6px_6px_12px_#a3b1c6,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#1f2330,-6px_-6px_12px_#33374a] mb-4 mx-4 rounded-2xl border-none',
        navItemBase: 'relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300',
        navItemActive: 'text-[#3b82f6] dark:text-[#60a5fa] font-bold shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#1f2330,inset_-4px_-4px_8px_#33374a] bg-[#E0E5EC] dark:bg-[#292d3e]',
        navItemInactive: 'text-[#64748b] dark:text-[#94a3b8] hover:text-[#334155] dark:hover:text-[#e2e8f0]',
        navActiveIndicator: 'hidden', 

        // Buttons
        buttonPrimary: 'bg-[#E0E5EC] dark:bg-[#292d3e] text-[#2563eb] dark:text-[#60a5fa] font-bold rounded-2xl px-6 py-3 shadow-[6px_6px_12px_#a3b1c6,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#1f2330,-6px_-6px_12px_#33374a] active:shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] dark:active:shadow-[inset_4px_4px_8px_#1f2330,inset_-4px_-4px_8px_#33374a] transition-all active:translate-y-[1px]',
        buttonSecondary: 'bg-[#E0E5EC] dark:bg-[#292d3e] text-[#64748b] dark:text-[#94a3b8] font-medium rounded-2xl px-6 py-3 shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#1f2330,-5px_-5px_10px_#33374a] active:shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] dark:active:shadow-[inset_4px_4px_8px_#1f2330,inset_-4px_-4px_8px_#33374a] transition-all',
        
        // Inputs
        label: 'text-[#64748b] dark:text-[#94a3b8] text-xs font-bold tracking-widest mb-2 block ml-3 uppercase',
        inputWrapper: 'bg-[#E0E5EC] dark:bg-[#292d3e] rounded-2xl px-4 flex items-center min-h-[52px] shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] dark:shadow-[inset_5px_5px_10px_#1f2330,inset_-5px_-5px_10px_#33374a] transition-all focus-within:shadow-[inset_2px_2px_5px_#a3b1c6,inset_-2px_-2px_5px_#ffffff] dark:focus-within:shadow-[inset_2px_2px_5px_#1f2330,inset_-2px_-2px_5px_#33374a] border-none',
        inputField: 'bg-transparent w-full h-full py-3 outline-none text-[#334155] dark:text-[#f1f5f9] placeholder-[#94a3b8] dark:placeholder-[#64748b] text-base font-medium',
        inputIcon: 'text-[#94a3b8] dark:text-[#64748b] mr-3',
        
        // Misc
        accentText: 'text-[#2563eb] dark:text-[#60a5fa]',
        
        // Dropdown
        dropdownMenu: 'bg-[#E0E5EC] dark:bg-[#292d3e] rounded-2xl shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#1f2330,-8px_-8px_16px_#33374a] mt-3 p-3 z-[60] border-none',
        dropdownItem: 'p-3 rounded-xl mb-2 last:mb-0 hover:shadow-[inset_3px_3px_6px_#a3b1c6,inset_-3px_-3px_6px_#ffffff] dark:hover:shadow-[inset_3px_3px_6px_#1f2330,inset_-3px_-3px_6px_#33374a] text-[#475569] dark:text-[#cbd5e1] font-medium cursor-pointer transition-all relative flex items-center gap-2',
        dropdownItemActive: 'shadow-[inset_3px_3px_6px_#a3b1c6,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_6px_#1f2330,inset_-3px_-3px_6px_#33374a] text-[#2563eb] dark:text-[#60a5fa] font-bold',
      };
    case 'fluent':
    default:
      return {
        // Fluent: Modern Professional, Borders, Rings
        appBg: 'bg-[#F5F7FA] dark:bg-[#202020] text-[#242424] dark:text-white',
        surface: 'bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-700',
        card: 'bg-white dark:bg-[#2C2C2C] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300',
        
        // Navigation
        sidebarContainer: 'bg-white dark:bg-[#2C2C2C] border-r border-gray-200 dark:border-gray-700',
        bottomNavContainer: 'bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-700 shadow-xl mb-4 mx-4 rounded-2xl',
        navItemBase: 'relative flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-200 mx-2',
        navItemActive: 'text-[#0078D4] dark:text-[#4F6BED] font-bold bg-[#F3F2F1] dark:bg-[#3B3A39]',
        navItemInactive: 'text-[#201F1E] dark:text-white hover:bg-[#F3F2F1] dark:hover:bg-[#3B3A39]',
        navActiveIndicator: 'absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 bg-[#0078D4] dark:bg-[#4F6BED] rounded-r-full',

        // Buttons
        buttonPrimary: 'bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-xl px-6 py-3 font-semibold shadow-sm transition-all active:scale-[0.98]',
        buttonSecondary: 'bg-white dark:bg-[#3B3A39] border border-[#8A8886] hover:bg-[#F3F2F1] dark:hover:bg-[#484644] text-[#201F1E] dark:text-white rounded-xl px-6 py-3 font-semibold transition-all active:scale-[0.98]',
        
        // Inputs
        label: 'text-gray-600 dark:text-gray-300 text-xs font-bold mb-1.5 ml-1 block uppercase tracking-wide',
        inputWrapper: 'bg-white dark:bg-[#333] border border-gray-300 dark:border-gray-600 rounded-xl px-3 flex items-center min-h-[50px] transition-all duration-200 focus-within:border-[#0078D4] focus-within:ring-4 focus-within:ring-[#0078D4]/10',
        inputField: 'bg-transparent w-full h-full py-2.5 outline-none text-[#201F1E] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm font-medium',
        inputIcon: 'text-gray-500 dark:text-gray-400 mr-2.5',
        
        // Misc
        accentText: 'text-[#0078D4] dark:text-[#4F6BED]',
        
        // Dropdown
        dropdownMenu: 'bg-white dark:bg-[#2C2C2C] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 mt-2 p-1.5 z-[60]',
        dropdownItem: 'px-3 py-2.5 rounded-lg hover:bg-[#F3F2F1] dark:hover:bg-[#3B3A39] text-sm font-medium text-[#201F1E] dark:text-white cursor-pointer relative flex items-center gap-2',
        dropdownItemActive: 'bg-[#E1DFDD] dark:bg-[#3B3A39] font-bold text-[#0078D4] dark:text-[#4F6BED]',
      };
  }
};
