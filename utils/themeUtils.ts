
import { ThemeType } from '../types';

export const getThemeClasses = (theme: ThemeType) => {
  switch (theme) {
    case 'material':
      return {
        // Material 3 Inspired: Playful, Rounded, Colorful Shadows
        appBg: 'bg-[#FFFBFE] dark:bg-[#141218] text-[#1D192B] dark:text-[#E6E1E5]',
        surface: 'bg-[#F7F2FA] dark:bg-[#1D1B20]',
        card: 'bg-[#F3EDF7] dark:bg-[#2B2930] rounded-[28px] shadow-sm border-none p-6 transition-all hover:shadow-md hover:-translate-y-0.5 duration-300',
        
        // Navigation
        sidebarContainer: 'bg-[#F3EDF7] dark:bg-[#2B2930] border-r border-transparent',
        bottomNavContainer: 'bg-[#F3EDF7] dark:bg-[#2B2930] shadow-lg mb-4 mx-4 rounded-full',
        navItemBase: 'relative flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-bold transition-all duration-300',
        navItemActive: 'text-[#1D192B] dark:text-[#E6E1E5]',
        navItemInactive: 'text-[#49454F] dark:text-[#CAC4D0] hover:bg-[#E8DEF8] dark:hover:bg-[#4A4458]',
        navActiveIndicator: 'absolute inset-0 bg-[#E8DEF8] dark:bg-[#4A4458] rounded-full shadow-sm',

        // Buttons
        buttonPrimary: 'bg-gradient-to-br from-[#6750A4] to-[#7f67be] dark:from-[#D0BCFF] dark:to-[#E8DEF8] text-white dark:text-[#381E72] rounded-full px-8 py-3.5 font-bold shadow-glow-primary hover:shadow-xl hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.97] transition-all duration-300',
        buttonSecondary: 'bg-transparent text-[#6750A4] dark:text-[#D0BCFF] border-2 border-[#79747E] dark:border-[#938F99] rounded-full px-6 py-3 font-bold hover:bg-[#6750A4]/5 dark:hover:bg-[#D0BCFF]/10 active:scale-[0.98] transition-all',
        
        // Inputs & Search
        label: 'text-[#6750A4] dark:text-[#D0BCFF] text-xs font-bold tracking-widest mb-2 ml-3 block uppercase',
        // Updated Input Wrapper: High contrast, subtle border, distinct background
        inputWrapper: 'bg-[#E6E0E9] dark:bg-[#49454F] border border-[#79747E]/30 rounded-[16px] px-5 flex items-center min-h-[56px] transition-all duration-300 focus-within:bg-[#E8DEF8] dark:focus-within:bg-[#4A4458] focus-within:border-[#6750A4] dark:focus-within:border-[#D0BCFF] focus-within:ring-2 focus-within:ring-[#6750A4]/20 shadow-sm hover:shadow-md',
        inputField: 'bg-transparent w-full h-full py-3 outline-none text-[#1D192B] dark:text-[#E6E1E5] placeholder-[#49454F]/60 dark:placeholder-[#CAC4D0]/60 text-lg font-medium',
        inputIcon: 'text-[#49454F] dark:text-[#CAC4D0] mr-3',
        
        // Misc
        accentText: 'text-[#6750A4] dark:text-[#D0BCFF] font-extrabold',
        
        // Dropdown (Updated): High z-index, solid background, shadow
        dropdownMenu: 'bg-[#F7F2FA] dark:bg-[#36343B] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.25)] mt-2 p-2 z-[100] border border-[#E8DEF8] dark:border-[#4A4458]',
        dropdownItem: 'p-3.5 rounded-lg hover:bg-[#E8DEF8] dark:hover:bg-[#4A4458] transition-all duration-200 text-sm font-bold text-[#1D192B] dark:text-[#E6E1E5] cursor-pointer relative flex items-center gap-3 active:scale-[0.98]',
        dropdownItemActive: 'bg-[#E8DEF8] dark:bg-[#4A4458] text-[#6750A4] dark:text-[#D0BCFF]',
      };
    case 'glass':
      return {
        // Professional Glass
        appBg: 'bg-[#F0F4F8] dark:bg-[#0F172A] min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-500 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-400/20 via-purple-100/20 to-transparent dark:from-blue-900/30',
        surface: 'bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/30 dark:border-white/5',
        card: 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[32px] shadow-lg shadow-blue-900/5 hover:shadow-blue-500/10 hover:-translate-y-1 transition-all p-6 duration-300',
        
        // Navigation
        sidebarContainer: 'bg-white/60 dark:bg-slate-900/80 backdrop-blur-xl border-r border-white/20 dark:border-white/5',
        bottomNavContainer: 'bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-white/5 mb-4 mx-4 rounded-3xl shadow-2xl',
        navItemBase: 'relative flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300',
        navItemActive: 'text-blue-600 dark:text-blue-300 bg-white/60 dark:bg-white/10 shadow-sm border border-white/50 dark:border-white/5',
        navItemInactive: 'text-slate-500 dark:text-slate-400 hover:bg-white/30 dark:hover:bg-white/5',
        navActiveIndicator: 'hidden', 

        // Buttons
        buttonPrimary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl px-8 py-4 font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 active:scale-[0.98] transition-all backdrop-blur-sm border border-white/20',
        buttonSecondary: 'bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-2xl px-6 py-3 font-bold transition-all active:scale-[0.98] backdrop-blur-sm',
        
        // Inputs (Updated)
        label: 'text-slate-500 dark:text-slate-400 text-xs font-bold tracking-widest mb-2 ml-3 block uppercase',
        inputWrapper: 'bg-white/80 dark:bg-black/50 border border-white/60 dark:border-white/20 rounded-[20px] px-5 flex items-center min-h-[60px] transition-all duration-300 focus-within:bg-white dark:focus-within:bg-black/70 focus-within:border-blue-400 focus-within:shadow-[0_4px_20px_rgba(96,165,250,0.3)] hover:bg-white/90 shadow-sm backdrop-blur-md',
        inputField: 'bg-transparent w-full h-full py-3 outline-none text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-lg font-medium',
        inputIcon: 'text-slate-400 dark:text-slate-500 mr-3',
        
        // Misc
        accentText: 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 font-black',
        
        // Dropdown (Updated)
        dropdownMenu: 'bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/50 dark:border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] mt-2 p-2 z-[100]',
        dropdownItem: 'p-3.5 rounded-2xl hover:bg-blue-50 dark:hover:bg-white/10 transition-all text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer relative flex items-center gap-3',
        dropdownItemActive: 'bg-blue-50 dark:bg-white/10 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-white/5',
      };
    case 'neumorphism':
      return {
        // Neumorphism: Soft, 3D
        appBg: 'bg-[#E0E5EC] dark:bg-[#292d3e] text-[#475569] dark:text-[#cbd5e1] transition-colors duration-300',
        surface: 'bg-[#E0E5EC] dark:bg-[#292d3e]', 
        card: 'bg-[#E0E5EC] dark:bg-[#292d3e] rounded-[32px] shadow-[12px_12px_24px_#a3b1c6,-12px_-12px_24px_#ffffff] dark:shadow-[10px_10px_20px_#1f2330,-10px_-10px_20px_#33374a] p-8 border-none hover:shadow-[16px_16px_32px_#a3b1c6,-16px_-16px_32px_#ffffff] dark:hover:shadow-[14px_14px_28px_#1f2330,-14px_-14px_28px_#33374a] transition-all duration-300', 
        
        // Navigation
        sidebarContainer: 'bg-[#E0E5EC] dark:bg-[#292d3e]',
        bottomNavContainer: 'bg-[#E0E5EC] dark:bg-[#292d3e] shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#1f2330,-8px_-8px_16px_#33374a] mb-6 mx-6 rounded-[24px] border-none',
        navItemBase: 'relative flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300',
        navItemActive: 'text-[#3b82f6] dark:text-[#60a5fa] shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#1f2330,inset_-4px_-4px_8px_#33374a] bg-[#E0E5EC] dark:bg-[#292d3e]',
        navItemInactive: 'text-[#64748b] dark:text-[#94a3b8] hover:text-[#334155] dark:hover:text-[#e2e8f0]',
        navActiveIndicator: 'hidden', 

        // Buttons
        buttonPrimary: 'bg-[#E0E5EC] dark:bg-[#292d3e] text-[#2563eb] dark:text-[#60a5fa] font-black rounded-2xl px-8 py-4 shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#1f2330,-8px_-8px_16px_#33374a] hover:-translate-y-0.5 hover:text-blue-500 hover:shadow-[10px_10px_20px_#a3b1c6,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] dark:active:shadow-[inset_4px_4px_8px_#1f2330,inset_-4px_-4px_8px_#33374a] transition-all',
        buttonSecondary: 'bg-[#E0E5EC] dark:bg-[#292d3e] text-[#64748b] dark:text-[#94a3b8] font-bold rounded-2xl px-6 py-4 shadow-[6px_6px_12px_#a3b1c6,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#1f2330,-6px_-6px_12px_#33374a] hover:-translate-y-0.5 hover:shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] active:shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] dark:active:shadow-[inset_4px_4px_8px_#1f2330,inset_-4px_-4px_8px_#33374a] transition-all',
        
        // Inputs (Updated)
        label: 'text-[#64748b] dark:text-[#94a3b8] text-xs font-bold tracking-widest mb-3 block ml-4 uppercase',
        inputWrapper: 'bg-[#E0E5EC] dark:bg-[#292d3e] rounded-[20px] px-6 flex items-center min-h-[60px] shadow-[inset_6px_6px_12px_#a3b1c6,inset_-6px_-6px_12px_#ffffff] dark:shadow-[inset_6px_6px_12px_#1f2330,inset_-6px_-6px_12px_#33374a] transition-all focus-within:shadow-[inset_3px_3px_6px_#a3b1c6,inset_-3px_-3px_6px_#ffffff] dark:focus-within:shadow-[inset_3px_3px_6px_#1f2330,inset_-3px_-3px_6px_#33374a] border border-white/20 dark:border-white/5',
        inputField: 'bg-transparent w-full h-full py-3 outline-none text-[#334155] dark:text-[#f1f5f9] placeholder-[#94a3b8] dark:placeholder-[#64748b] text-lg font-bold',
        inputIcon: 'text-[#94a3b8] dark:text-[#64748b] mr-3',
        
        // Misc
        accentText: 'text-[#2563eb] dark:text-[#60a5fa] font-black',
        
        // Dropdown (Updated)
        dropdownMenu: 'bg-[#E0E5EC] dark:bg-[#292d3e] rounded-3xl shadow-[10px_10px_20px_#a3b1c6,-10px_-10px_20px_#ffffff] dark:shadow-[10px_10px_20px_#1f2330,-10px_-10px_20px_#33374a] mt-4 p-4 z-[100] border-none',
        dropdownItem: 'p-3.5 rounded-2xl mb-2 last:mb-0 hover:shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] dark:hover:shadow-[inset_4px_4px_8px_#1f2330,inset_-4px_-4px_8px_#33374a] text-[#475569] dark:text-[#cbd5e1] font-bold cursor-pointer transition-all relative flex items-center gap-3',
        dropdownItemActive: 'shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#1f2330,inset_-4px_-4px_8px_#33374a] text-[#2563eb] dark:text-[#60a5fa]',
      };
    case 'fluent':
    default:
      return {
        // Fluent: Clean, Business-Professional
        appBg: 'bg-[#F5F7FA] dark:bg-[#202020] text-[#242424] dark:text-white',
        surface: 'bg-white dark:bg-[#2C2C2C]',
        card: 'bg-white dark:bg-[#2C2C2C] rounded-[20px] shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300',
        
        // Navigation
        sidebarContainer: 'bg-white dark:bg-[#2C2C2C] border-r border-gray-200 dark:border-gray-700',
        bottomNavContainer: 'bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-700 shadow-xl mb-4 mx-4 rounded-2xl',
        navItemBase: 'relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 mx-2',
        navItemActive: 'text-[#0078D4] dark:text-[#4F6BED] bg-[#F3F2F1] dark:bg-[#3B3A39]',
        navItemInactive: 'text-[#201F1E] dark:text-white hover:bg-[#F3F2F1] dark:hover:bg-[#3B3A39]',
        navActiveIndicator: 'absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-[#0078D4] dark:bg-[#4F6BED] rounded-r-full',

        // Buttons
        buttonPrimary: 'bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-xl px-8 py-3.5 font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98]',
        buttonSecondary: 'bg-white dark:bg-[#3B3A39] border border-[#8A8886] hover:bg-[#F3F2F1] dark:hover:bg-[#484644] text-[#201F1E] dark:text-white rounded-xl px-6 py-3.5 font-semibold hover:shadow-sm transition-all active:scale-[0.98]',
        
        // Inputs (Updated)
        label: 'text-gray-600 dark:text-gray-300 text-xs font-bold mb-2 ml-1 block uppercase tracking-wide',
        inputWrapper: 'bg-white dark:bg-[#333] border border-gray-300 dark:border-gray-500 rounded-xl px-4 flex items-center min-h-[56px] transition-all duration-200 focus-within:border-[#0078D4] focus-within:ring-2 focus-within:ring-[#0078D4]/20 shadow-sm hover:border-gray-400',
        inputField: 'bg-transparent w-full h-full py-3 outline-none text-[#201F1E] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base font-medium',
        inputIcon: 'text-gray-500 dark:text-gray-400 mr-3',
        
        // Misc
        accentText: 'text-[#0078D4] dark:text-[#4F6BED] font-bold',
        
        // Dropdown (Updated)
        dropdownMenu: 'bg-white dark:bg-[#2C2C2C] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.18)] border border-gray-200 dark:border-gray-700 mt-2 p-2 z-[100]',
        dropdownItem: 'px-4 py-3 rounded-lg hover:bg-[#F3F2F1] dark:hover:bg-[#3B3A39] text-sm font-medium text-[#201F1E] dark:text-white cursor-pointer relative flex items-center gap-3 transition-colors',
        dropdownItemActive: 'bg-[#E1DFDD] dark:bg-[#3B3A39] font-bold text-[#0078D4] dark:text-[#4F6BED]',
      };
  }
};
