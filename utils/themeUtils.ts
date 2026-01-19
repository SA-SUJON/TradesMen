
import { ThemeType } from '../types';

export const getThemeClasses = (theme: ThemeType) => {
  switch (theme) {
    case 'material':
      return {
        // Material 3: Light (FFFBFE) / Dark (141218) - Added subtle tint to bg
        appBg: 'bg-[#fdf7ff] dark:bg-[#141218] text-[#1D192B] dark:text-[#E6E1E5]',
        // Surface for floating sidebar/panels
        surface: 'bg-[#F3EDF7] dark:bg-[#211F26]',
        card: 'bg-[#F7F2FA] dark:bg-[#2B2930] rounded-3xl shadow-sm border border-transparent dark:border-[#49454F] p-6 transition-all hover:shadow-md hover:-translate-y-0.5 duration-300',
        
        // Buttons
        buttonPrimary: 'bg-[#6750A4] dark:bg-[#D0BCFF] text-white dark:text-[#381E72] rounded-full px-6 py-3 font-medium shadow-md hover:shadow-lg hover:bg-[#5F489A] dark:hover:bg-[#E8DEF8] active:scale-[0.98] transition-all',
        buttonSecondary: 'bg-transparent text-[#6750A4] dark:text-[#D0BCFF] border border-[#79747E] dark:border-[#938F99] rounded-full px-6 py-3 font-medium hover:bg-[#EADDFF]/20 dark:hover:bg-[#4F378B]/20 active:scale-[0.98] transition-all',
        
        // Inputs
        label: 'text-[#6750A4] dark:text-[#D0BCFF] text-xs font-bold tracking-wide mb-1.5 ml-1 block',
        inputWrapper: 'bg-[#F3EDF7] dark:bg-[#49454F] border-b-2 border-[#49454F] dark:border-[#CAC4D0] rounded-t-xl px-4 flex items-center transition-colors focus-within:border-[#6750A4] focus-within:bg-[#E7E0EC] dark:focus-within:border-[#D0BCFF] dark:focus-within:bg-[#58545E]',
        inputField: 'bg-transparent w-full h-12 outline-none text-[#1D192B] dark:text-[#E6E1E5] placeholder-[#1D192B]/50 dark:placeholder-[#E6E1E5]/50 text-base',
        inputIcon: 'text-[#49454F] dark:text-[#CAC4D0] mr-3',
        
        // Sidebar Specific
        sidebarActive: 'bg-[#E8DEF8] text-[#1D192B] dark:bg-[#4A4458] dark:text-[#E6E1E5]',
        accentText: 'text-[#6750A4] dark:text-[#D0BCFF]',
        
        // Dropdown
        dropdownMenu: 'bg-[#F3EDF7] dark:bg-[#2B2930] rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mt-1 p-2 z-[60]',
        dropdownItem: 'p-3 rounded-lg hover:bg-[#E8DEF8] dark:hover:bg-[#4A4458] transition-colors text-sm font-medium text-[#1D192B] dark:text-[#E6E1E5] cursor-pointer relative flex items-center gap-2',
        dropdownItemActive: 'bg-[#E8DEF8] dark:bg-[#4A4458] font-bold text-[#1D192B] dark:text-[#E6E1E5]',
      };
    case 'glass':
      return {
        // Glass: Vibrant gradients
        appBg: 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 animate-gradient text-white min-h-screen',
        surface: 'bg-white/10 dark:bg-black/30 backdrop-blur-xl border border-white/20',
        card: 'bg-white/10 dark:bg-black/30 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-xl p-6 hover:bg-white/15 dark:hover:bg-black/40 transition-all hover:-translate-y-1 hover:shadow-2xl',
        
        // Buttons
        buttonPrimary: 'bg-white/20 hover:bg-white/30 border border-white/40 text-white rounded-xl px-6 py-3 font-semibold backdrop-blur-md shadow-lg transition-all active:scale-[0.98]',
        buttonSecondary: 'bg-transparent border border-white/30 text-white/90 rounded-xl px-6 py-3 hover:bg-white/10 transition-all active:scale-[0.98]',
        
        // Inputs
        label: 'text-white/90 text-xs font-bold tracking-wide mb-1.5 ml-1 block text-shadow-sm',
        inputWrapper: 'bg-black/20 dark:bg-black/40 border border-white/10 dark:border-white/5 rounded-xl px-4 flex items-center backdrop-blur-sm transition-all focus-within:bg-black/30 focus-within:border-white/30 focus-within:shadow-[0_0_15px_rgba(255,255,255,0.1)]',
        inputField: 'bg-transparent w-full h-12 outline-none text-white placeholder-white/60 text-base',
        inputIcon: 'text-white/70 mr-3',
        
        // Sidebar
        sidebarActive: 'bg-white/20 shadow-lg border border-white/20 backdrop-blur-lg',
        accentText: 'text-white font-bold drop-shadow-md',
        
        // Dropdown
        dropdownMenu: 'bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl mt-2 p-2 z-[60]',
        dropdownItem: 'p-3 rounded-lg hover:bg-white/20 transition-colors text-sm text-white cursor-pointer relative flex items-center gap-2',
        dropdownItemActive: 'bg-white/20 font-bold border border-white/10',
      };
    case 'neumorphism':
      return {
        // Neumorphism: Light (#E0E5EC) / Dark (#292d3e)
        appBg: 'bg-[#E0E5EC] dark:bg-[#292d3e] text-slate-700 dark:text-gray-200 transition-colors duration-300',
        surface: 'bg-[#E0E5EC] dark:bg-[#292d3e] border border-white/50 dark:border-white/5',
        card: 'bg-[#E0E5EC] dark:bg-[#292d3e] rounded-[24px] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[8px_8px_16px_#1f2330,-8px_-8px_16px_#33374a] p-6 border border-white/20 dark:border-white/5',
        
        // Buttons
        buttonPrimary: 'bg-[#E0E5EC] dark:bg-[#292d3e] text-blue-600 dark:text-blue-400 font-bold rounded-2xl px-6 py-3 shadow-[6px_6px_10px_0_rgba(163,177,198,0.7),-6px_-6px_10px_0_rgba(255,255,255,0.8)] dark:shadow-[5px_5px_10px_#1f2330,-5px_-5px_10px_#33374a] active:shadow-[inset_6px_6px_10px_0_rgba(163,177,198,0.7),inset_-6px_-6px_10px_0_rgba(255,255,255,0.8)] dark:active:shadow-[inset_5px_5px_10px_#1f2330,inset_-5px_-5px_10px_#33374a] transition-all active:translate-y-[1px]',
        buttonSecondary: 'bg-[#E0E5EC] dark:bg-[#292d3e] text-slate-500 dark:text-gray-400 font-medium rounded-2xl px-6 py-3 shadow-[5px_5px_10px_0_rgba(163,177,198,0.5),-5px_-5px_10px_0_rgba(255,255,255,0.6)] dark:shadow-[5px_5px_10px_#1f2330,-5px_-5px_10px_#33374a] active:shadow-[inset_4px_4px_6px_0_rgba(163,177,198,0.5),inset_-4px_-4px_6px_0_rgba(255,255,255,0.6)] dark:active:shadow-[inset_3px_3px_6px_#1f2330,inset_-3px_-3px_6px_#33374a] transition-all',
        
        // Inputs
        label: 'text-slate-600 dark:text-gray-400 text-xs font-bold tracking-wider mb-2 block ml-3 uppercase',
        inputWrapper: 'bg-[#E0E5EC] dark:bg-[#292d3e] rounded-2xl px-4 flex items-center shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] dark:shadow-[inset_5px_5px_10px_#1f2330,inset_-5px_-5px_10px_#33374a] transition-all focus-within:shadow-[inset_2px_2px_5px_#a3b1c6,inset_-2px_-2px_5px_#ffffff] dark:focus-within:shadow-[inset_2px_2px_5px_#1f2330,inset_-2px_-2px_5px_#33374a]',
        inputField: 'bg-transparent w-full h-12 outline-none text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-base',
        inputIcon: 'text-slate-500 dark:text-gray-400 mr-3',
        
        // Sidebar
        sidebarActive: 'text-blue-600 dark:text-blue-400 font-bold shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] dark:shadow-[inset_5px_5px_10px_#1f2330,inset_-5px_-5px_10px_#33374a] rounded-xl',
        accentText: 'text-blue-600 dark:text-blue-400',
        
        // Dropdown
        dropdownMenu: 'bg-[#E0E5EC] dark:bg-[#292d3e] rounded-xl shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#1f2330,-6px_-6px_12px_#33374a] border border-white/40 dark:border-white/5 mt-3 p-3 z-[60]',
        dropdownItem: 'p-3 rounded-lg mb-2 last:mb-0 hover:bg-[#d6dbe4] dark:hover:bg-[#33374a] text-slate-700 dark:text-white font-medium cursor-pointer transition-all relative flex items-center gap-2',
        dropdownItemActive: 'shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_6px_#1f2330,inset_-3px_-3px_6px_#33374a] text-blue-600 dark:text-blue-400 font-bold',
      };
    case 'fluent':
    default:
      return {
        // Fluent: Light (#F0F2F5) / Dark (#201F1E) - Slightly darker light bg for contrast
        appBg: 'bg-[#F0F2F5] dark:bg-[#201F1E] text-[#242424] dark:text-white',
        surface: 'bg-white dark:bg-[#2B2B2B] border border-gray-200 dark:border-gray-700',
        card: 'bg-white dark:bg-[#2B2B2B] rounded-xl shadow-sm border border-[#E1DFDD] dark:border-[#484644] p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300',
        
        // Buttons
        buttonPrimary: 'bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-lg px-6 py-3 font-semibold shadow-sm transition-all active:scale-[0.98]',
        buttonSecondary: 'bg-white dark:bg-[#3B3A39] border border-[#8A8886] hover:bg-[#F3F2F1] dark:hover:bg-[#484644] text-[#201F1E] dark:text-white rounded-lg px-6 py-3 font-semibold transition-all active:scale-[0.98]',
        
        // Inputs
        label: 'text-[#323130] dark:text-[#F3F2F1] text-sm font-semibold mb-1.5 ml-0.5 block',
        inputWrapper: 'bg-white dark:bg-[#323130] border border-[#8A8886] dark:border-[#8A8886] rounded-lg px-3 flex items-center transition-all focus-within:border-[#0078D4] focus-within:ring-2 focus-within:ring-[#0078D4]/20 dark:focus-within:border-[#4F6BED]',
        inputField: 'bg-transparent w-full h-11 outline-none text-[#201F1E] dark:text-white placeholder-[#605E5C] dark:placeholder-[#A19F9D] text-sm',
        inputIcon: 'text-[#605E5C] dark:text-[#A19F9D] mr-2',
        
        // Sidebar
        sidebarActive: 'bg-white dark:bg-[#3B3A39] text-[#0078D4] dark:text-[#4F6BED] font-bold shadow-sm',
        accentText: 'text-[#0078D4] dark:text-[#4F6BED]',
        
        // Dropdown
        dropdownMenu: 'bg-white dark:bg-[#2B2B2B] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 mt-1 p-1 z-[60]',
        dropdownItem: 'px-3 py-2 rounded-md hover:bg-[#F3F2F1] dark:hover:bg-[#3B3A39] text-sm text-[#201F1E] dark:text-white cursor-pointer relative flex items-center gap-2',
        dropdownItemActive: 'bg-[#E1DFDD] dark:bg-[#3B3A39] font-semibold text-[#0078D4] dark:text-[#4F6BED]',
      };
  }
};
