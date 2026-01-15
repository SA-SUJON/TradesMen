
import { ThemeType } from '../types';

export const getThemeClasses = (theme: ThemeType) => {
  switch (theme) {
    case 'material':
      return {
        // Material 3: Light (FFFBFE) / Dark (141218)
        appBg: 'bg-[#FFFBFE] dark:bg-[#141218] text-slate-900 dark:text-[#E6E1E5]',
        card: 'bg-[#F3EDF7] dark:bg-[#2B2930] rounded-3xl shadow-sm border-none p-6 transition-transform hover:scale-[1.01]',
        buttonPrimary: 'bg-[#6750A4] dark:bg-[#D0BCFF] text-white dark:text-[#381E72] rounded-full px-6 py-3 font-medium shadow-md hover:shadow-lg active:bg-[#21005D] dark:active:bg-[#EADDFF] transition-all',
        buttonSecondary: 'bg-transparent text-[#6750A4] dark:text-[#D0BCFF] border border-[#79747E] dark:border-[#938F99] rounded-full px-6 py-3 font-medium hover:bg-[#EADDFF]/20 dark:hover:bg-[#4F378B]/20 transition-all',
        input: 'bg-[#E7E0EC] dark:bg-[#49454F] border-b-2 border-[#49454F] dark:border-[#CAC4D0] rounded-t-lg px-4 py-3 text-slate-900 dark:text-[#E6E1E5] placeholder-slate-500 dark:placeholder-gray-400 focus:border-[#6750A4] dark:focus:border-[#D0BCFF] focus:bg-[#EADDFF] dark:focus:bg-[#4F378B] outline-none transition-colors',
        label: 'text-[#6750A4] dark:text-[#D0BCFF] text-sm font-semibold mb-1 block',
        tabActive: 'bg-[#E8DEF8] dark:bg-[#4A4458] text-[#1D192B] dark:text-[#E6E1E5] font-bold shadow-sm',
        tabInactive: 'text-[#49454F] dark:text-[#CAC4D0] hover:bg-[#F7F2FA] dark:hover:bg-[#1C1B1F]',
        accentText: 'text-[#6750A4] dark:text-[#D0BCFF]',
        // Dropdown Specifics
        dropdownMenu: 'bg-[#F3EDF7] dark:bg-[#2B2930] rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mt-1 p-2 z-[60]',
        dropdownItem: 'p-3 rounded-lg hover:bg-[#E8DEF8] dark:hover:bg-[#4A4458] transition-colors text-sm font-medium text-[#1D192B] dark:text-[#E6E1E5] cursor-pointer relative',
        dropdownItemActive: 'bg-[#E8DEF8] dark:bg-[#4A4458] font-bold',
      };
    case 'glass':
      return {
        // Glass: Keep vibrant background, darken the glass panes in dark mode
        appBg: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 animate-gradient text-white min-h-screen',
        card: 'bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-xl p-6',
        buttonPrimary: 'bg-white/20 hover:bg-white/30 border border-white/40 text-white rounded-xl px-6 py-3 font-semibold backdrop-blur-md shadow-lg transition-all',
        buttonSecondary: 'bg-transparent border border-white/30 text-white/90 rounded-xl px-6 py-3 hover:bg-white/10 transition-all',
        input: 'bg-black/20 dark:bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/70 focus:bg-black/30 focus:border-white/40 outline-none transition-all',
        label: 'text-white/90 text-sm font-medium mb-1 block',
        tabActive: 'bg-white/20 dark:bg-black/40 backdrop-blur-lg border border-white/40 text-white font-bold shadow-lg',
        tabInactive: 'text-white/70 hover:bg-white/10 border border-transparent',
        accentText: 'text-white font-bold drop-shadow-md',
        // Dropdown Specifics
        dropdownMenu: 'bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl mt-2 p-2 z-[60]',
        dropdownItem: 'p-3 rounded-lg hover:bg-white/20 transition-colors text-sm text-white cursor-pointer relative',
        dropdownItemActive: 'bg-white/20 font-bold border border-white/10',
      };
    case 'neumorphism':
      return {
        // Neumorphism: Light (#E0E5EC) / Dark (#292d3e)
        appBg: 'bg-[#E0E5EC] dark:bg-[#292d3e] text-slate-700 dark:text-gray-200',
        card: 'bg-[#E0E5EC] dark:bg-[#292d3e] rounded-[20px] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[5px_5px_10px_#1f2330,-5px_-5px_10px_#33374a] p-6 border border-white/20 dark:border-white/5',
        buttonPrimary: 'bg-[#E0E5EC] dark:bg-[#292d3e] text-slate-700 dark:text-gray-200 font-bold rounded-[50px] px-6 py-3 shadow-[6px_6px_10px_0_rgba(163,177,198,0.7),-6px_-6px_10px_0_rgba(255,255,255,0.8)] dark:shadow-[5px_5px_10px_#1f2330,-5px_-5px_10px_#33374a] active:shadow-[inset_6px_6px_10px_0_rgba(163,177,198,0.7),inset_-6px_-6px_10px_0_rgba(255,255,255,0.8)] dark:active:shadow-[inset_5px_5px_10px_#1f2330,inset_-5px_-5px_10px_#33374a] transition-all active:translate-y-[1px]',
        buttonSecondary: 'bg-[#E0E5EC] dark:bg-[#292d3e] text-slate-500 dark:text-gray-400 font-medium rounded-[50px] px-6 py-3 shadow-[6px_6px_10px_0_rgba(163,177,198,0.7),-6px_-6px_10px_0_rgba(255,255,255,0.8)] dark:shadow-[5px_5px_10px_#1f2330,-5px_-5px_10px_#33374a] active:shadow-[inset_4px_4px_6px_0_rgba(163,177,198,0.7),inset_-4px_-4px_6px_0_rgba(255,255,255,0.8)] dark:active:shadow-[inset_3px_3px_6px_#1f2330,inset_-3px_-3px_6px_#33374a] transition-all',
        input: 'bg-[#E0E5EC] dark:bg-[#292d3e] rounded-[10px] px-4 py-3 text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] dark:shadow-[inset_5px_5px_10px_#1f2330,inset_-5px_-5px_10px_#33374a] outline-none border-none focus:shadow-[inset_2px_2px_5px_#a3b1c6,inset_-2px_-2px_5px_#ffffff] dark:focus:shadow-[inset_2px_2px_5px_#1f2330,inset_-2px_-2px_5px_#33374a]',
        label: 'text-slate-600 dark:text-gray-400 text-sm font-bold mb-2 block ml-2',
        tabActive: 'text-slate-700 dark:text-white font-bold shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] dark:shadow-[inset_5px_5px_10px_#1f2330,inset_-5px_-5px_10px_#33374a] rounded-xl',
        tabInactive: 'text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300',
        accentText: 'text-slate-700 dark:text-blue-400',
        // Dropdown Specifics
        dropdownMenu: 'bg-[#E0E5EC] dark:bg-[#292d3e] rounded-xl shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#1f2330,-6px_-6px_12px_#33374a] border border-white/40 dark:border-white/5 mt-3 p-3 z-[60]',
        dropdownItem: 'p-3 rounded-lg mb-2 last:mb-0 hover:bg-[#d6dbe4] dark:hover:bg-[#33374a] text-slate-700 dark:text-white font-medium cursor-pointer transition-all relative',
        dropdownItemActive: 'shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_6px_#1f2330,inset_-3px_-3px_6px_#33374a] text-blue-600 dark:text-blue-400 font-bold',
      };
    case 'fluent':
    default:
      return {
        // Fluent: Light (#F5F7F9) / Dark (#201F1E)
        appBg: 'bg-[#F5F7F9] dark:bg-[#201F1E] text-[#242424] dark:text-white',
        card: 'bg-white dark:bg-[#2B2B2B] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] border border-[#E1DFDD] dark:border-[#8A8886] p-6',
        buttonPrimary: 'bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-lg px-6 py-3 font-semibold shadow-sm transition-colors',
        buttonSecondary: 'bg-white dark:bg-[#3B3A39] border border-[#8A8886] hover:bg-[#F3F2F1] dark:hover:bg-[#484644] text-[#201F1E] dark:text-white rounded-lg px-6 py-3 font-semibold transition-colors',
        input: 'bg-white dark:bg-[#323130] border border-[#8A8886] border-b-2 border-b-transparent hover:border-b-[#605E5C] dark:hover:border-b-[#A19F9D] rounded-lg px-3 py-2.5 text-[#201F1E] dark:text-white placeholder-[#605E5C] dark:placeholder-[#A19F9D] focus:border-b-[#0078D4] focus:border-[#0078D4] outline-none transition-all',
        label: 'text-[#323130] dark:text-[#F3F2F1] text-sm font-semibold mb-2 block',
        tabActive: 'bg-white dark:bg-[#3B3A39] text-[#0078D4] dark:text-[#4F6BED] font-bold border-b-2 border-[#0078D4] dark:border-[#4F6BED] shadow-sm',
        tabInactive: 'text-[#605E5C] dark:text-[#C8C6C4] hover:bg-[#F3F2F1] dark:hover:bg-[#323130] hover:text-[#201F1E] dark:hover:text-white',
        accentText: 'text-[#0078D4] dark:text-[#4F6BED]',
        // Dropdown Specifics
        dropdownMenu: 'bg-white dark:bg-[#2B2B2B] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 mt-1 p-1 z-[60]',
        dropdownItem: 'px-3 py-2 rounded-md hover:bg-[#F3F2F1] dark:hover:bg-[#3B3A39] text-sm text-[#201F1E] dark:text-white cursor-pointer relative',
        dropdownItemActive: 'bg-[#E1DFDD] dark:bg-[#3B3A39] font-semibold',
      };
  }
};
