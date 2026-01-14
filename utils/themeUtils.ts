
import { ThemeType } from '../types';

export const getThemeClasses = (theme: ThemeType) => {
  switch (theme) {
    case 'material':
      return {
        appBg: 'bg-[#FFFBFE] text-slate-900',
        card: 'bg-[#F3EDF7] rounded-3xl shadow-sm border-none p-6 transition-transform hover:scale-[1.01]',
        buttonPrimary: 'bg-[#6750A4] text-white rounded-full px-6 py-3 font-medium shadow-md hover:shadow-lg active:bg-[#21005D] transition-all',
        buttonSecondary: 'bg-transparent text-[#6750A4] border border-[#79747E] rounded-full px-6 py-3 font-medium hover:bg-[#EADDFF]/20 transition-all',
        input: 'bg-[#E7E0EC] border-b-2 border-[#49454F] rounded-t-lg px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-[#6750A4] focus:bg-[#EADDFF] outline-none transition-colors',
        label: 'text-[#6750A4] text-sm font-semibold mb-1 block',
        tabActive: 'bg-[#E8DEF8] text-[#1D192B] font-bold shadow-sm',
        tabInactive: 'text-[#49454F] hover:bg-[#F7F2FA]',
        accentText: 'text-[#6750A4]',
        // Dropdown Specifics
        dropdownMenu: 'bg-[#F3EDF7] rounded-xl shadow-lg border border-gray-100 mt-1 p-2 z-[60]',
        dropdownItem: 'p-3 rounded-lg hover:bg-[#E8DEF8] transition-colors text-sm font-medium text-[#1D192B] cursor-pointer relative',
        dropdownItemActive: 'bg-[#E8DEF8] font-bold',
      };
    case 'glass':
      return {
        appBg: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-gradient text-white min-h-screen',
        card: 'bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-6',
        buttonPrimary: 'bg-white/20 hover:bg-white/30 border border-white/40 text-white rounded-xl px-6 py-3 font-semibold backdrop-blur-md shadow-lg transition-all',
        buttonSecondary: 'bg-transparent border border-white/30 text-white/90 rounded-xl px-6 py-3 hover:bg-white/10 transition-all',
        input: 'bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/70 focus:bg-black/30 focus:border-white/40 outline-none transition-all',
        label: 'text-white/90 text-sm font-medium mb-1 block',
        tabActive: 'bg-white/20 backdrop-blur-lg border border-white/40 text-white font-bold shadow-lg',
        tabInactive: 'text-white/70 hover:bg-white/10 border border-transparent',
        accentText: 'text-white font-bold drop-shadow-md',
        // Dropdown Specifics
        dropdownMenu: 'bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl mt-2 p-2 z-[60]',
        dropdownItem: 'p-3 rounded-lg hover:bg-white/20 transition-colors text-sm text-white cursor-pointer relative',
        dropdownItemActive: 'bg-white/20 font-bold border border-white/10',
      };
    case 'neumorphism':
      return {
        appBg: 'bg-[#E0E5EC] text-slate-700',
        card: 'bg-[#E0E5EC] rounded-[20px] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] p-6 border border-white/20',
        buttonPrimary: 'bg-[#E0E5EC] text-slate-700 font-bold rounded-[50px] px-6 py-3 shadow-[6px_6px_10px_0_rgba(163,177,198,0.7),-6px_-6px_10px_0_rgba(255,255,255,0.8)] active:shadow-[inset_6px_6px_10px_0_rgba(163,177,198,0.7),inset_-6px_-6px_10px_0_rgba(255,255,255,0.8)] transition-all active:translate-y-[1px]',
        buttonSecondary: 'bg-[#E0E5EC] text-slate-500 font-medium rounded-[50px] px-6 py-3 shadow-[6px_6px_10px_0_rgba(163,177,198,0.7),-6px_-6px_10px_0_rgba(255,255,255,0.8)] active:shadow-[inset_4px_4px_6px_0_rgba(163,177,198,0.7),inset_-4px_-4px_6px_0_rgba(255,255,255,0.8)] transition-all',
        input: 'bg-[#E0E5EC] rounded-[10px] px-4 py-3 text-slate-700 placeholder-slate-400 shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] outline-none border-none focus:shadow-[inset_2px_2px_5px_#a3b1c6,inset_-2px_-2px_5px_#ffffff]',
        label: 'text-slate-600 text-sm font-bold mb-2 block ml-2',
        tabActive: 'text-slate-700 font-bold shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] rounded-xl',
        tabInactive: 'text-slate-500 hover:text-slate-700',
        accentText: 'text-slate-700',
        // Dropdown Specifics
        dropdownMenu: 'bg-[#E0E5EC] rounded-xl shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] border border-white/40 mt-3 p-3 z-[60]',
        dropdownItem: 'p-3 rounded-lg mb-2 last:mb-0 hover:bg-[#d6dbe4] text-slate-700 font-medium cursor-pointer transition-all relative',
        dropdownItemActive: 'shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] text-blue-600 font-bold',
      };
    case 'fluent':
    default:
      return {
        appBg: 'bg-[#F5F7F9] text-[#242424]',
        card: 'bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E1DFDD] p-6',
        buttonPrimary: 'bg-[#0078D4] hover:bg-[#106EBE] text-white rounded-lg px-6 py-3 font-semibold shadow-sm transition-colors',
        buttonSecondary: 'bg-white border border-[#8A8886] hover:bg-[#F3F2F1] text-[#201F1E] rounded-lg px-6 py-3 font-semibold transition-colors',
        input: 'bg-white border border-[#8A8886] border-b-2 border-b-transparent hover:border-b-[#605E5C] rounded-lg px-3 py-2.5 text-[#201F1E] placeholder-[#605E5C] focus:border-b-[#0078D4] focus:border-[#0078D4] outline-none transition-all',
        label: 'text-[#323130] text-sm font-semibold mb-2 block',
        tabActive: 'bg-white text-[#0078D4] font-bold border-b-2 border-[#0078D4] shadow-sm',
        tabInactive: 'text-[#605E5C] hover:bg-[#F3F2F1] hover:text-[#201F1E]',
        accentText: 'text-[#0078D4]',
        // Dropdown Specifics
        dropdownMenu: 'bg-white rounded-lg shadow-xl border border-gray-200 mt-1 p-1 z-[60] dark:bg-[#201F1E] dark:border-gray-700',
        dropdownItem: 'px-3 py-2 rounded-md hover:bg-[#F3F2F1] dark:hover:bg-[#323130] text-sm text-[#201F1E] dark:text-white cursor-pointer relative',
        dropdownItemActive: 'bg-[#E1DFDD] dark:bg-[#3B3A39] font-semibold',
      };
  }
};
