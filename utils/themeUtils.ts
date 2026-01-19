
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
        // Glass: Vibrant gradients with crystal inputs
        appBg: 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 animate-gradient text-white min-h-screen',
        surface: 'bg-white/10 dark:bg-black/30 backdrop-blur-xl border border-white/20',
        card: 'bg-white/10 dark:bg-black/30 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-xl p-6 hover:bg-white/15 dark:hover:bg-black/40 transition-all hover:-translate-y-1 hover:shadow-2xl',
        
        // Navigation
        sidebarContainer: 'bg-white/5 backdrop-blur-md border-r border-white/10',
        bottomNavContainer: 'bg-black/40 backdrop-blur-xl border border-white/10 mb-4 mx-4 rounded-2xl shadow-2xl',
        navItemBase: 'relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 text-white/70 hover:text-white',
        navItemActive: 'text-white font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)]',
        navItemInactive: 'hover:bg-white/10',
        navActiveIndicator: 'absolute inset-0 bg-white/20 border border-white/20 rounded-xl backdrop-blur-lg',

        // Buttons
        buttonPrimary: 'bg-white/20 hover:bg-white/30 border border-white/40 text-white rounded-2xl px-6 py-3 font-semibold backdrop-blur-md shadow-lg transition-all active:scale-[0.98]',
        buttonSecondary: 'bg-transparent border border-white/30 text-white/90 rounded-2xl px-6 py-3 hover:bg-white/10 transition-all active:scale-[0.98]',
        
        // Inputs
        label: 'text-white/90 text-xs font-bold tracking-widest mb-2 ml-1 block uppercase text-shadow-sm',
        inputWrapper: 'bg-white/5 border border-white/20 rounded-2xl px-4 flex items-center min-h-[52px] backdrop-blur-md transition-all duration-300 focus-within:bg-white/10 focus-within:border-white/50 focus-within:shadow-[0_0_25px_rgba(255,255,255,0.2)]',
        inputField: 'bg-transparent w-full h-full py-3 outline-none text-white placeholder-white/50 text-base font-medium',
        inputIcon: 'text-white/80 mr-3',
        
        // Misc
        accentText: 'text-white font-bold drop-shadow-md',
        
        // Dropdown
        dropdownMenu: 'bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl mt-2 p-2 z-[60]',
        dropdownItem: 'p-3 rounded-xl hover:bg-white/10 transition-colors text-sm text-white cursor-pointer relative flex items-center gap-2',
        dropdownItemActive: 'bg-white/20 font-bold border border-white/10',
      };
    case 'neumorphism':
      return {
        // Neumorphism: Soft shadows, indented inputs
        appBg: 'bg-[#E0E5EC] dark:bg-[#292d3e] text-slate-700 dark:text-gray-200 transition-colors duration-300',
        surface: 'bg-[#E0E5EC] dark:bg-[#292d3e] border border-white/50 dark:border-white/5',
        card: 'bg-[#E0E5EC] dark:bg-[#292d3e] rounded-[30px] shadow-[12px_12px_24px_#b8b9be,-12px_-12px_24px_#ffffff] dark:shadow-[12px_12px_24px_#1f2330,-12px_-12px_24px_#33374a] p-6 border border-white/20 dark:border-white/5',
        
        // Navigation
        sidebarContainer: 'bg-[#E0E5EC] dark:bg-[#292d3e]',
        bottomNavContainer: 'bg-[#E0E5EC] dark:bg-[#292d3e] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#1f2330,-8px_-8px_16px_#33374a] mb-4 mx-4 rounded-2xl border border-white/20 dark:border-white/5',
        navItemBase: 'relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300',
        navItemActive: 'text-blue-600 dark:text-blue-400 font-bold shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_6px_#1f2330,inset_-3px_-3px_6px_#33374a]',
        navItemInactive: 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200',
        navActiveIndicator: 'hidden', // Neumorphism handles active state via class directly (inset shadow)

        // Buttons
        buttonPrimary: 'bg-[#E0E5EC] dark:bg-[#292d3e] text-blue-600 dark:text-blue-400 font-bold rounded-2xl px-6 py-3 shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#1f2330,-6px_-6px_12px_#33374a] active:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] dark:active:shadow-[inset_4px_4px_8px_#1f2330,inset_-4px_-4px_8px_#33374a] transition-all active:translate-y-[1px]',
        buttonSecondary: 'bg-[#E0E5EC] dark:bg-[#292d3e] text-slate-500 dark:text-gray-400 font-medium rounded-2xl px-6 py-3 shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#1f2330,-5px_-5px_10px_#33374a] active:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] dark:active:shadow-[inset_4px_4px_8px_#1f2330,inset_-4px_-4px_8px_#33374a] transition-all',
        
        // Inputs
        label: 'text-slate-500 dark:text-gray-400 text-xs font-bold tracking-widest mb-2 block ml-3 uppercase',
        inputWrapper: 'bg-[#E0E5EC] dark:bg-[#292d3e] rounded-2xl px-4 flex items-center min-h-[52px] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#1a1d26,inset_-4px_-4px_8px_#383e56] transition-all focus-within:shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] dark:focus-within:shadow-[inset_6px_6px_12px_#1a1d26,inset_-6px_-6px_12px_#383e56]',
        inputField: 'bg-transparent w-full h-full py-3 outline-none text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-base font-medium',
        inputIcon: 'text-slate-400 dark:text-gray-500 mr-3',
        
        // Misc
        accentText: 'text-blue-600 dark:text-blue-400',
        
        // Dropdown
        dropdownMenu: 'bg-[#E0E5EC] dark:bg-[#292d3e] rounded-2xl shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#1f2330,-8px_-8px_16px_#33374a] border border-white/40 dark:border-white/5 mt-3 p-3 z-[60]',
        dropdownItem: 'p-3 rounded-xl mb-2 last:mb-0 hover:bg-[#d6dbe4] dark:hover:bg-[#33374a] text-slate-700 dark:text-white font-medium cursor-pointer transition-all relative flex items-center gap-2',
        dropdownItemActive: 'shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_6px_#1f2330,inset_-3px_-3px_6px_#33374a] text-blue-600 dark:text-blue-400 font-bold',
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
