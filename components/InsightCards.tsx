
import React from 'react';
import { Product } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { motion } from 'framer-motion';
import { TrendingDown, Calendar, CheckCircle2, Zap } from 'lucide-react';

interface InsightCardsProps {
    inventory: Product[];
}

const InsightCards: React.FC<InsightCardsProps> = ({ inventory }) => {
    const { theme } = useTheme();
    // unused variable 'styles' removed for cleanliness if not strictly needed, 
    // or kept if we plan to use it. Here we use getCardStyle logic mostly.

    // Logic for Low Stock
    const lowStockItems = inventory.filter(item => {
        const threshold = item.lowStockThreshold !== undefined ? item.lowStockThreshold : 10;
        return item.stock < threshold;
    });
    
    // Logic for Expiry
    const expiringItems = inventory.filter(item => {
        if (!item.expiryDate) return false;
        const today = new Date();
        const expiry = new Date(item.expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays > 0 && diffDays <= 7;
    });

    const hasIssues = lowStockItems.length > 0 || expiringItems.length > 0;

    // Card Base Styling based on theme
    const getCardStyle = (variant: 'alert' | 'warning' | 'info' | 'success') => {
        // Base classes
        let classes = "rounded-xl p-4 flex flex-col justify-between h-full relative overflow-hidden transition-all min-w-[85vw] md:min-w-0 snap-center ";
        
        if (theme === 'glass') {
            classes += "backdrop-blur-md text-white border ";
            if (variant === 'alert') classes += "bg-red-500/20 border-red-500/30 ";
            if (variant === 'warning') classes += "bg-orange-500/20 border-orange-500/30 ";
            if (variant === 'info') classes += "bg-blue-500/20 border-blue-500/30 ";
            if (variant === 'success') classes += "bg-green-500/20 border-green-500/30 ";
        } else if (theme === 'neumorphism') {
            classes += "bg-[#E0E5EC] dark:bg-[#292d3e] text-slate-700 dark:text-gray-200 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#1f2330,-5px_-5px_10px_#33374a] border-transparent ";
             if (variant === 'alert') classes += "border-l-4 border-l-red-500 ";
             if (variant === 'warning') classes += "border-l-4 border-l-orange-500 ";
             if (variant === 'success') classes += "border-l-4 border-l-green-500 ";
        } else if (theme === 'fluent') {
            classes += "bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-sm ";
            if (variant === 'alert') classes += "border-l-[4px] border-l-red-600 ";
            if (variant === 'warning') classes += "border-l-[4px] border-l-orange-500 ";
            if (variant === 'success') classes += "border-l-[4px] border-l-green-600 ";
        } else {
            // Material / Default
            if (variant === 'alert') classes += "bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200 border border-red-100 dark:border-red-900/30 ";
            if (variant === 'warning') classes += "bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-200 border border-orange-100 dark:border-orange-900/30 ";
            if (variant === 'info') classes += "bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200 border border-blue-100 dark:border-blue-900/30 ";
            if (variant === 'success') classes += "bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-200 border border-green-100 dark:border-green-900/30 ";
        }
        return classes;
    };

    return (
        // Changed grid-cols-1 to flex layout on mobile for horizontal scrolling
        <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide md:overflow-visible md:pb-0">
            {/* 1. Low Stock Card */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={getCardStyle(lowStockItems.length > 0 ? 'alert' : 'success')}
            >
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 font-bold">
                        {lowStockItems.length > 0 
                            ? <TrendingDown className={`w-5 h-5 ${theme === 'glass' ? 'text-red-200' : 'text-red-500'}`} /> 
                            : <CheckCircle2 className={`w-5 h-5 ${theme === 'glass' ? 'text-green-200' : 'text-green-500'}`} />
                        }
                        <span>Inventory Status</span>
                    </div>
                    {lowStockItems.length > 0 && (
                        <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                            theme === 'glass' ? 'bg-red-500/40 text-white' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                        }`}>
                            Action Needed
                        </span>
                    )}
                </div>

                {lowStockItems.length > 0 ? (
                    <div className="space-y-3">
                        <div className="text-3xl font-display font-bold">
                            {lowStockItems.length} <span className="text-sm font-normal opacity-70">Items Low</span>
                        </div>
                        <div className="space-y-2">
                            {lowStockItems.slice(0, 2).map(item => {
                                const fillPercent = Math.min((item.stock / (item.lowStockThreshold || 10)) * 100, 100);
                                return (
                                    <div key={item.id} className="text-sm">
                                        <div className="flex justify-between mb-1">
                                            <span>{item.name}</span>
                                            <span className="font-bold text-xs">{item.stock} {item.unit}</span>
                                        </div>
                                        <div className={`h-1.5 rounded-full w-full ${theme === 'glass' ? 'bg-black/20' : 'bg-gray-200 dark:bg-white/10'}`}>
                                            <div style={{ width: `${fillPercent}%` }} className="h-full rounded-full bg-red-500"></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="text-3xl font-display font-bold">Healthy</div>
                        <p className="text-sm opacity-70 mt-1">All stock levels are above threshold.</p>
                    </div>
                )}
            </motion.div>

            {/* 2. Expiry / Health Card */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={getCardStyle(expiringItems.length > 0 ? 'warning' : 'info')}
            >
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 font-bold">
                        <Calendar className={`w-5 h-5 ${expiringItems.length > 0 ? (theme === 'glass' ? 'text-orange-200' : 'text-orange-500') : (theme === 'glass' ? 'text-blue-200' : 'text-blue-500')}`} />
                        <span>Shelf Life</span>
                    </div>
                </div>

                {expiringItems.length > 0 ? (
                    <div className="space-y-2">
                        <div className="text-3xl font-display font-bold">
                            {expiringItems.length} <span className="text-sm font-normal opacity-70">Expiring Soon</span>
                        </div>
                        <ul className="text-sm space-y-1 mt-2">
                            {expiringItems.slice(0, 2).map(item => (
                                <li key={item.id} className="flex justify-between items-center opacity-80">
                                    <span className="truncate max-w-[120px]">{item.name}</span>
                                    <span className="font-mono text-xs bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">{item.expiryDate}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div>
                         <div className="text-3xl font-display font-bold">Optimal</div>
                         <p className="text-sm opacity-70 mt-1">No items expiring within 7 days.</p>
                    </div>
                )}
            </motion.div>

            {/* 3. AI Quick Actions */}
            <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className={`${getCardStyle('info')} ${theme === 'material' ? 'bg-m3-container text-m3-onContainer dark:bg-[#4A4458] dark:text-[#E6E1E5]' : ''}`}
            >
                <div className="flex items-center gap-2 font-bold mb-2">
                    <Zap className="w-5 h-5" />
                    <span>Quick Suggestion</span>
                </div>
                
                <div className="flex flex-col justify-between h-full">
                    <p className="text-sm opacity-80 leading-relaxed">
                        {hasIssues 
                            ? "I can draft re-stock orders for the low items. Just say 'Prepare Order'."
                            : "Inventory is stable. Use 'Quick Scan' to add new stock from invoices."
                        }
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs font-bold opacity-60 uppercase tracking-wider">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        AI Manager Active
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default InsightCards;
