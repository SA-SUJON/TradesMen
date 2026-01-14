import React, { useRef } from 'react';
import { useAI } from '../contexts/AIContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera } from 'lucide-react';

interface QuickScanProps {
    onScanStart: () => void;
    isVisible?: boolean;
    isPrimary?: boolean; // If true, occupies the main FAB spot (right-6)
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
                        animate={{ 
                            scale: 1, 
                            opacity: 1,
                            right: isPrimary ? '1.5rem' : '6rem', // 1.5rem = right-6, 6rem = right-24
                            bottom: typeof window !== 'undefined' && window.innerWidth < 768 ? '6rem' : '1.5rem'
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className={`fixed z-50 p-4 rounded-full shadow-lg flex items-center justify-center transition-colors group ${
                             theme === 'material' ? 'bg-[#E8DEF8] text-[#1D192B]' : 
                             theme === 'glass' ? 'bg-white/20 backdrop-blur-md border border-white/30 text-white' :
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
