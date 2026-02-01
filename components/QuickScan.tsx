
import React, { useRef } from 'react';
import { useAI } from '../contexts/AIContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

interface QuickScanProps {
    onScanStart: () => void;
    isVisible?: boolean;
    isPrimary?: boolean; // If true, occupies the main FAB spot
}

const QuickScan: React.FC<QuickScanProps> = ({ onScanStart, isVisible = true, isPrimary = false }) => {
    const { sendMessage } = useAI();
    const { theme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onScanStart(); // Switch to manager view
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                sendMessage("Process this Quick Scan image for inventory updates.", base64);
            };
            reader.readAsDataURL(file);
        }
    };

    // Responsive Positioning:
    // Mobile (<768px): Bottom-40 (160px).
    //   If isPrimary: Right-6 (24px).
    //   If !isPrimary (AI exists): Right-24 (96px) -> Sit to the left of AI button.
    // Desktop (>=768px): Bottom-6 (24px).
    
    // Note: AI Button is at right-6. QuickScan should be left of it if secondary.
    
    const positionClasses = isPrimary 
        ? "right-6 bottom-40 md:bottom-6 md:right-6"
        : "right-24 bottom-40 md:bottom-6 md:right-24";

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleFileChange}
                    />
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className={`fixed z-[60] p-4 rounded-full shadow-lg flex items-center justify-center transition-colors group ${positionClasses} ${
                             theme === 'material' ? 'bg-[#E8DEF8] text-[#1D192B]' : 
                             theme === 'glass' ? 'bg-white/20 backdrop-blur-md border border-white/30 text-white' :
                             theme === 'neumorphism' ? 'bg-[#E0E5EC] dark:bg-[#292d3e] text-slate-700 dark:text-blue-400 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#1f2330,-5px_-5px_10px_#33374a]' :
                             'bg-white text-blue-600 border border-blue-100 dark:bg-gray-800 dark:text-blue-400 dark:border-gray-700'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => fileInputRef.current?.click()}
                        title="Quick Scan Memo"
                    >
                       <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
                    </motion.button>
                </>
            )}
        </AnimatePresence>
    );
};

export default QuickScan;
