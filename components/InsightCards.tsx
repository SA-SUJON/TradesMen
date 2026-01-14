import React from 'react';
import { Product } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, Calendar, AlertCircle } from 'lucide-react';

interface InsightCardsProps {
    inventory: Product[];
}

const InsightCards: React.FC<InsightCardsProps> = ({ inventory }) => {
    const { theme } = useTheme();
    const styles = getThemeClasses(theme);

    // Logic for Low Stock
    const lowStockItems = inventory.filter(item => item.stock < 15);
    
    // Logic for Expiry (Mock logic as demo data might not have dates, but interface supports it)
    const expiringItems = inventory.filter(item => {
        if (!item.expiryDate) return false;
        const today = new Date();
        const expiry = new Date(item.expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays > 0 && diffDays <= 7;
    });

    if (lowStockItems.length === 0 && expiringItems.length === 0) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl mb-4 text-center border border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800`}
            >
                <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400 font-medium">
                    <AlertCircle className="w-5 h-5" />
                    <span>All systems normal. Stock levels look good!</span>
                </div>
            </motion.div>
        );
    }

    const cardBaseClass = `min-w-[280px] p-4 rounded-xl border flex flex-col justify-between ${
        theme === 'glass' ? 'bg-white/10 border-white/20 text-white backdrop-blur-md' :
        theme === 'neumorphism' ? 'bg-[#E0E5EC] shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff] border-transparent' :
        'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700 shadow-sm'
    }`;

    return (
        <div className="flex overflow-x-auto gap-4 pb-4 mb-2 scrollbar-hide">
            {/* Low Stock Card */}
            {lowStockItems.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cardBaseClass}
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-orange-500 font-bold">
                            <TrendingDown className="w-5 h-5" />
                            <h3>Low Stock Alert</h3>
                        </div>
                        <p className="text-sm opacity-70 mb-3">
                            {lowStockItems.length} items are running low.
                        </p>
                        <ul className="text-sm space-y-1">
                            {lowStockItems.slice(0, 3).map(item => (
                                <li key={item.id} className="flex justify-between">
                                    <span>{item.name}</span>
                                    <span className="font-bold text-orange-500">{item.stock} {item.unit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            )}

            {/* Expiry Card */}
            {expiringItems.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cardBaseClass}
                >
                     <div>
                        <div className="flex items-center gap-2 mb-2 text-red-500 font-bold">
                            <Calendar className="w-5 h-5" />
                            <h3>Expiring Soon</h3>
                        </div>
                         <p className="text-sm opacity-70 mb-3">
                            Action needed for {expiringItems.length} items.
                        </p>
                         <ul className="text-sm space-y-1">
                            {expiringItems.slice(0, 3).map(item => (
                                <li key={item.id} className="flex justify-between">
                                    <span>{item.name}</span>
                                    <span className="font-bold text-red-500">{item.expiryDate}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            )}
            
            {/* Quick Action Suggestion (Always visible if issues exist) */}
            <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.2 }}
                 className={`${cardBaseClass} border-blue-200 bg-blue-50/50 dark:bg-blue-900/10`}
            >
                <div className="h-full flex flex-col justify-center">
                    <h3 className={`font-bold mb-1 ${styles.accentText}`}>AI Suggestion</h3>
                    <p className="text-sm opacity-70">
                        Use "Quick Scan" to upload latest supplier invoices and update stock levels instantly.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default InsightCards;
