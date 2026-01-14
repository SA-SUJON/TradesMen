import React, { useState, useMemo } from 'react';
import { Sale, Product, Expense } from '../types';
import { Card, Button } from './ui/BaseComponents';
import { FileText, Download, TrendingUp, Calendar, Package } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { exportToCSV } from '../utils/appUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportsProps {
    sales: Sale[];
    inventory: Product[];
    expenses: Expense[];
}

const Reports: React.FC<ReportsProps> = ({ sales, inventory, expenses }) => {
    const { theme } = useTheme();
    const styles = getThemeClasses(theme);
    const [activeReport, setActiveReport] = useState<'gstr1' | 'stock' | 'daybook'>('gstr1');

    // --- GSTR-1 LOGIC ---
    const gstr1Data = useMemo(() => {
        return sales.map(sale => {
            const tax = sale.totalTax || 0;
            const taxable = sale.totalAmount - tax;
            const cgst = tax / 2;
            const sgst = tax / 2;
            
            return {
                Date: new Date(sale.date).toLocaleDateString(),
                InvoiceNo: sale.invoiceNumber,
                Customer_ID: sale.customerId || 'Cash',
                Total_Value: sale.totalAmount.toFixed(2),
                Taxable_Value: taxable.toFixed(2),
                Total_Tax: tax.toFixed(2),
                CGST: cgst.toFixed(2),
                SGST: sgst.toFixed(2),
                Items_Count: sale.items.length
            };
        });
    }, [sales]);

    // --- STOCK SUMMARY LOGIC ---
    const stockData = useMemo(() => {
        return inventory.map(item => {
            const stockValue = item.stock * (item.buyingPrice || 0);
            return {
                ItemName: item.name,
                Category: item.category || 'General',
                Stock_Qty: item.stock,
                Unit: item.unit,
                Buying_Price: item.buyingPrice || 0,
                Selling_Price: item.sellingPrice,
                Stock_Value: stockValue.toFixed(2),
                HSN: item.hsnCode || '-'
            };
        });
    }, [inventory]);

    const totalStockValue = stockData.reduce((acc, item) => acc + Number(item.Stock_Value), 0);

    // --- DAYBOOK LOGIC ---
    const daybookData = useMemo(() => {
        const entries = [
            ...sales.map(s => ({
                id: s.id,
                date: new Date(s.date),
                desc: `Sale Inv #${s.invoiceNumber}`,
                type: 'IN',
                amount: s.totalAmount
            })),
            ...expenses.map(e => ({
                id: e.id,
                date: new Date(e.date),
                desc: `Exp: ${e.title}`,
                type: 'OUT',
                amount: e.amount
            }))
        ];
        
        return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [sales, expenses]);

    const downloadReport = () => {
        if (activeReport === 'gstr1') exportToCSV(gstr1Data, 'GSTR1_Report');
        if (activeReport === 'stock') exportToCSV(stockData, 'Stock_Summary');
        if (activeReport === 'daybook') {
            const csvData = daybookData.map(d => ({
                Date: d.date.toLocaleDateString(),
                Time: d.date.toLocaleTimeString(),
                Description: d.desc,
                Type: d.type,
                Amount: d.amount
            }));
            exportToCSV(csvData, 'Daybook_Report');
        }
    };

    return (
        <div className="space-y-6 pb-24">
            <div className="flex justify-between items-center">
                <h2 className={`text-xl font-bold flex items-center gap-2 ${styles.accentText}`}>
                    <FileText className="w-6 h-6" /> Business Reports
                </h2>
                <Button onClick={downloadReport} className="flex items-center gap-2 px-3 py-2 text-sm" variant="secondary">
                    <Download className="w-4 h-4" /> Export
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl overflow-x-auto scrollbar-hide">
                <button 
                    onClick={() => setActiveReport('gstr1')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeReport === 'gstr1' ? 'bg-white shadow text-blue-600 dark:bg-gray-800 dark:text-blue-400' : 'opacity-60'}`}
                >
                    <FileText className="w-4 h-4" /> GSTR-1
                </button>
                <button 
                    onClick={() => setActiveReport('stock')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeReport === 'stock' ? 'bg-white shadow text-purple-600 dark:bg-gray-800 dark:text-purple-400' : 'opacity-60'}`}
                >
                    <Package className="w-4 h-4" /> Stock
                </button>
                <button 
                    onClick={() => setActiveReport('daybook')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeReport === 'daybook' ? 'bg-white shadow text-green-600 dark:bg-gray-800 dark:text-green-400' : 'opacity-60'}`}
                >
                    <Calendar className="w-4 h-4" /> Daybook
                </button>
            </div>

            <Card className="min-h-[400px] overflow-hidden flex flex-col p-2">
                <AnimatePresence mode="wait">
                    {activeReport === 'gstr1' && (
                        <motion.div 
                            key="gstr1"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex-grow flex flex-col"
                        >
                            <div className="mb-4 text-xs md:text-sm opacity-60 px-2">
                                Sales invoices formatted for GSTR-1 (B2B/B2C).
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs md:text-sm min-w-[600px]">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Inv No</th>
                                            <th className="p-3 text-right">Taxable</th>
                                            <th className="p-3 text-right">CGST</th>
                                            <th className="p-3 text-right">SGST</th>
                                            <th className="p-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {gstr1Data.length > 0 ? gstr1Data.map((row, i) => (
                                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                                <td className="p-3 whitespace-nowrap">{row.Date}</td>
                                                <td className="p-3 font-mono">{row.InvoiceNo}</td>
                                                <td className="p-3 text-right">{row.Taxable_Value}</td>
                                                <td className="p-3 text-right text-[10px] md:text-xs">{row.CGST}</td>
                                                <td className="p-3 text-right text-[10px] md:text-xs">{row.SGST}</td>
                                                <td className="p-3 text-right font-bold">{row.Total_Value}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={6} className="p-8 text-center opacity-50">No sales recorded yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeReport === 'stock' && (
                        <motion.div 
                            key="stock"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                        >
                            <div className="flex justify-between items-end mb-4 bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl">
                                <div>
                                    <div className="text-sm font-bold text-purple-800 dark:text-purple-300">Total Assets</div>
                                    <div className="text-xs opacity-60">At Purchase Price</div>
                                </div>
                                <div className="text-xl md:text-2xl font-bold text-purple-700 dark:text-purple-400">
                                    {totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                             <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs md:text-sm min-w-[500px]">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                                            <th className="p-3">Item Name</th>
                                            <th className="p-3">HSN</th>
                                            <th className="p-3 text-right">Stock</th>
                                            <th className="p-3 text-right">Buy Price</th>
                                            <th className="p-3 text-right">Valuation</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {stockData.map((row, i) => (
                                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                                <td className="p-3 font-medium">{row.ItemName}</td>
                                                <td className="p-3 text-xs">{row.HSN}</td>
                                                <td className="p-3 text-right whitespace-nowrap">{row.Stock_Qty} {row.Unit}</td>
                                                <td className="p-3 text-right">{row.Buying_Price}</td>
                                                <td className="p-3 text-right font-bold">{row.Stock_Value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeReport === 'daybook' && (
                        <motion.div 
                            key="daybook"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                        >
                             <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-4 space-y-6 py-4">
                                {daybookData.map((entry, i) => (
                                    <div key={i} className="relative pl-6">
                                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${entry.type === 'IN' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold text-sm">{entry.desc}</div>
                                                <div className="text-xs opacity-50">
                                                    {entry.date.toLocaleTimeString()} - {entry.date.toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className={`font-bold ${entry.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                                {entry.type === 'IN' ? '+' : '-'} {entry.amount.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {daybookData.length === 0 && (
                                    <div className="pl-6 text-sm opacity-50">No transactions recorded.</div>
                                )}
                             </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </div>
    );
};

export default Reports;