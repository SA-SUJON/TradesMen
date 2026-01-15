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

    // Calculate position classes based on whether it is primary (alone) or secondary (with AI button)
    // Mobile Bottom Nav height is ~70px. We need to clear it.
    // If Primary: Bottom-24 (approx 96px, safe above nav).
    // If Secondary (AI btn present): Side by side on mobile? 
    //   - AI Btn is bottom-24 right-6. 
    //   - QuickScan should be bottom-24 right-24 (left of AI btn).
    
    // We use a dynamic calculation for 'right' and 'bottom' in style/animate prop to be safe.
    
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
                            // On Mobile (<768px):
                            //   If Primary: Right-6 (1.5rem), Bottom-24 (6rem) -> Above Nav
                            //   If Secondary: Right-24 (6rem), Bottom-24 (6rem) -> Left of AI Btn, Above Nav
                            // On Desktop (>=768px):
                            //   If Primary: Right-6, Bottom-6
                            //   If Secondary: Right-24, Bottom-6 (Left of AI Btn)
                            
                            right: isPrimary ? '1.5rem' : '6rem', 
                            bottom: typeof window !== 'undefined' && window.innerWidth < 768 ? '6rem' : '1.5rem'
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className={`fixed z-50 p-4 rounded-full shadow-lg flex items-center justify-center transition-colors group ${
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