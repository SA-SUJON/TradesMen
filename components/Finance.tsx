
import React, { useState, useMemo } from 'react';
import { Sale, Expense, Customer, Transaction } from '../types';
import { Card, Input, Button, Select } from './ui/BaseComponents';
import { getThemeClasses } from '../utils/themeUtils';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, TrendingUp, DollarSign, Wallet, ArrowUpRight, ArrowDownLeft, AlertCircle, Calendar, Trash2, Plus, Bell, MessageCircle, CheckCircle2, BarChart3 } from 'lucide-react';
import { openWhatsApp } from '../utils/appUtils';

interface FinanceProps {
    sales: Sale[];
    expenses: Expense[];
    setExpenses: (expenses: Expense[] | ((val: Expense[]) => Expense[])) => void;
    customers: Customer[];
    setCustomers: (customers: Customer[] | ((val: Customer[]) => Customer[])) => void;
}

const Finance: React.FC<FinanceProps> = ({ sales, expenses, setExpenses, customers, setCustomers }) => {
    const { theme } = useTheme();
    const styles = getThemeClasses(theme);
    const [subTab, setSubTab] = useState<'dashboard' | 'expenses' | 'debt'>('dashboard');

    // --- DASHBOARD CALCULATIONS ---
    const dashboardData = useMemo(() => {
        // Time ranges
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Filter this month
        const monthlySales = sales.filter(s => new Date(s.date) >= startOfMonth);
        const monthlyExpenses = expenses.filter(e => new Date(e.date) >= startOfMonth);

        // Totals
        const totalRevenue = monthlySales.reduce((acc, s) => acc + s.totalAmount, 0);
        
        // Robust Profit Calculation: If buy price missing, treat revenue as profit is misleading.
        // We accumulate calculated profit from sale items.
        // Note: sales[].totalProfit is stored at time of sale.
        const totalProfit = monthlySales.reduce((acc, s) => acc + (s.totalProfit || 0), 0);
        
        const totalCost = monthlyExpenses.reduce((acc, e) => acc + e.amount, 0);
        const netProfit = totalProfit - totalCost;
        
        // Average Basket Size
        const avgSaleValue = monthlySales.length > 0 ? totalRevenue / monthlySales.length : 0;

        // Top Items Logic
        const itemMap = new Map<string, number>();
        monthlySales.forEach(sale => {
            sale.items.forEach(item => {
                const existing = itemMap.get(item.name) || 0;
                itemMap.set(item.name, existing + item.quantity);
            });
        });
        const topItems = Array.from(itemMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, qty], index) => ({ name, qty, color: ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500'][index] || 'bg-gray-500' }));

        return { totalRevenue, totalProfit, totalCost, netProfit, topItems, avgSaleValue };
    }, [sales, expenses]);

    // --- EXPENSE LOGIC ---
    const [newExpense, setNewExpense] = useState({ title: '', amount: '', category: 'Rent' });
    const addExpense = () => {
        if(!newExpense.title || !newExpense.amount) return;
        const exp: Expense = {
            id: Date.now().toString(),
            title: newExpense.title,
            amount: Number(newExpense.amount),
            category: newExpense.category,
            date: new Date().toISOString()
        };
        setExpenses(prev => [exp, ...prev]);
        setNewExpense({ title: '', amount: '', category: 'Rent' });
    };
    const deleteExpense = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id));

    // --- DEBT LOGIC ---
    const debtCustomers = useMemo(() => customers.filter(c => c.debt > 0), [customers]);
    
    const sendDebtReminder = (customer: Customer) => {
        const msg = `Hello ${customer.name}, your total outstanding balance at our shop is ${customer.debt.toFixed(2)}. Please pay at your earliest convenience. Thank you!`;
        openWhatsApp(customer.phone, msg);
    };

    const settleDebt = (id: string, amount: number) => {
        setCustomers(prev => {
             const customer = prev.find(c => c.id === id);
             if(!customer) return prev;
             
             // Ensure we don't pay more than debt
             const payAmount = Math.min(amount, customer.debt);
             
             const newTx: Transaction = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                amount: payAmount,
                summary: `Debt Payment Received`,
                type: 'payment'
             };

             const updated = {
                ...customer,
                debt: customer.debt - payAmount,
                history: [...customer.history, newTx]
             };
             return prev.map(c => c.id === id ? updated : c);
        });
    };

    return (
        <div className="space-y-6 pb-24">
            {/* Navigation Tabs for Finance Section */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl overflow-x-auto">
                {[
                    { id: 'dashboard', label: 'Dashboard', icon: <TrendingUp className="w-4 h-4" /> },
                    { id: 'expenses', label: 'Expenses', icon: <Wallet className="w-4 h-4" /> },
                    { id: 'debt', label: 'Credit Book', icon: <AlertCircle className="w-4 h-4" /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setSubTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-grow justify-center ${
                            subTab === tab.id 
                                ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400' 
                                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                        }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {subTab === 'dashboard' && (
                    <motion.div 
                        key="dash"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="!p-4">
                                <div className="text-sm opacity-60 mb-1">Monthly Revenue</div>
                                <div className="text-2xl font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                    <DollarSign className="w-5 h-5" /> {dashboardData.totalRevenue.toLocaleString()}
                                </div>
                            </Card>
                            <Card className="!p-4">
                                <div className="text-sm opacity-60 mb-1">Monthly Expenses</div>
                                <div className="text-2xl font-bold flex items-center gap-2 text-red-500 dark:text-red-400">
                                    <ArrowDownLeft className="w-5 h-5" /> {dashboardData.totalCost.toLocaleString()}
                                </div>
                            </Card>
                            <Card className="!p-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none">
                                <div className="text-sm opacity-80 mb-1 text-white">Net Profit</div>
                                <div className="text-2xl font-bold flex items-center gap-2">
                                    <ArrowUpRight className="w-5 h-5" /> {dashboardData.netProfit.toLocaleString()}
                                </div>
                            </Card>
                            <Card className="!p-4">
                                <div className="text-sm opacity-60 mb-1">Avg Sale Value</div>
                                <div className="text-2xl font-bold flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                    <BarChart3 className="w-5 h-5" /> {dashboardData.avgSaleValue.toFixed(0)}
                                </div>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Top Selling Items Custom Chart */}
                            <Card className="min-h-[300px]">
                                <h3 className="font-bold mb-6 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-blue-500" /> Best Selling Items (This Month)
                                </h3>
                                <div className="space-y-4">
                                    {dashboardData.topItems.length > 0 ? (
                                        dashboardData.topItems.map((item, i) => (
                                            <div key={i} className="relative">
                                                <div className="flex justify-between text-sm mb-1 font-medium z-10 relative">
                                                    <span>{item.name}</span>
                                                    <span>{item.qty} units</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(item.qty / dashboardData.topItems[0].qty) * 100}%` }}
                                                        className={`h-full rounded-full ${item.color}`}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center opacity-40 py-10">Not enough sales data</div>
                                    )}
                                </div>
                            </Card>

                            {/* Profit vs Expense Visual */}
                            <Card className="min-h-[300px] flex flex-col justify-center items-center">
                                <h3 className="font-bold mb-6 w-full text-left flex items-center gap-2">
                                    <PieChart className="w-5 h-5 text-purple-500" /> Income Breakdown
                                </h3>
                                <div className="relative w-48 h-48">
                                    <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
                                        {/* Background Circle */}
                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-100 dark:stroke-white/5" strokeWidth="3.8" />
                                        {/* Profit Segment */}
                                        <circle 
                                            cx="18" cy="18" r="16" fill="none" 
                                            className="stroke-green-500" strokeWidth="3.8" 
                                            strokeDasharray={`${(dashboardData.netProfit / (dashboardData.netProfit + dashboardData.totalCost)) * 100}, 100`} 
                                        />
                                        {/* Expense Segment (Overlay for simplicity visualization, improved for real logic usually) */}
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold">{dashboardData.totalRevenue > 0 ? Math.round((dashboardData.netProfit / dashboardData.totalRevenue) * 100) : 0}%</span>
                                        <span className="text-xs opacity-60">Profit Margin</span>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div> Profit
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-white/20"></div> Cost/Exp
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {subTab === 'expenses' && (
                    <motion.div
                        key="expenses"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-6"
                    >
                        <Card>
                            <h3 className="font-bold mb-4">Add New Expense</h3>
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                <Input label="Description" placeholder="e.g., Shop Rent" value={newExpense.title} onChange={e => setNewExpense({...newExpense, title: e.target.value})} />
                                <Select label="Category" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
                                    <option>Rent</option>
                                    <option>Utilities</option>
                                    <option>Salary</option>
                                    <option>Maintenance</option>
                                    <option>Other</option>
                                </Select>
                                <Input label="Amount" type="number" placeholder="0.00" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
                                <Button onClick={addExpense} className="mb-0.5"><Plus className="w-4 h-4" /> Add</Button>
                            </div>
                        </Card>

                        <div className="space-y-3">
                            {expenses.length > 0 ? expenses.map(exp => (
                                <motion.div 
                                    key={exp.id} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex justify-between items-center p-4 rounded-xl border ${theme === 'glass' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700'}`}
                                >
                                    <div>
                                        <div className="font-bold">{exp.title}</div>
                                        <div className="text-xs opacity-60 flex gap-2">
                                            <span className="bg-gray-100 dark:bg-white/10 px-1.5 rounded">{exp.category}</span>
                                            <span>{new Date(exp.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-red-500">- {exp.amount.toFixed(2)}</span>
                                        <button 
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); deleteExpense(exp.id); }}
                                            className="text-gray-400 hover:text-red-500 cursor-pointer p-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="text-center opacity-40 py-8">No expenses recorded yet.</div>
                            )}
                        </div>
                    </motion.div>
                )}
                {/* Debt Tab logic remains largely same... */}
                {subTab === 'debt' && (
                     <motion.div key="debt" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                         {/* ... Existing debt UI ... */}
                         <Card>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">Customer Khata (Credit Book)</h3>
                                    <p className="text-sm opacity-60">Manage outstanding customer balances</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs opacity-60">Total Receivables</div>
                                    <div className="text-2xl font-bold text-orange-500">
                                        {debtCustomers.reduce((acc, c) => acc + c.debt, 0).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                         </Card>
                         <div className="grid grid-cols-1 gap-4">
                            {debtCustomers.map(c => (
                                <Card key={c.id} className="!border-l-4 !border-l-orange-500">
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div>
                                            <div className="font-bold text-lg">{c.name}</div>
                                            <div className="text-sm opacity-60">{c.phone || 'No Phone'}</div>
                                            <div className="mt-2 text-xs font-mono bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 px-2 py-1 rounded inline-block">
                                                Due: {c.debt.toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <Button variant="secondary" onClick={() => sendDebtReminder(c)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 border-none">
                                                <MessageCircle className="w-4 h-4" /> Remind
                                            </Button>
                                            <Button onClick={() => { const amt = prompt(`Enter amount received from ${c.name}:`, c.debt.toString()); if(amt) settleDebt(c.id, Number(amt)); }} className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white">
                                                Settle
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {debtCustomers.length === 0 && <div className="text-center py-12 opacity-50"><CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500 opacity-50" />No outstanding debts. Great job!</div>}
                         </div>
                     </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Finance;
