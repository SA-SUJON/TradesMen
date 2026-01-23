
import React, { useState, useMemo } from 'react';
import { Sale, Expense, Customer, Transaction } from '../types';
import { Card, Input, Button, Select } from './ui/BaseComponents';
import { getThemeClasses } from '../utils/themeUtils';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, TrendingUp, DollarSign, Wallet, ArrowUpRight, ArrowDownLeft, AlertCircle, Calendar, Trash2, Plus, Bell, MessageCircle, CheckCircle2, BarChart3, Clock } from 'lucide-react';
import { openWhatsApp } from '../utils/appUtils';

interface FinanceProps {
    sales: Sale[];
    expenses: Expense[];
    setExpenses: (expenses: Expense[] | ((val: Expense[]) => Expense[])) => void;
    customers: Customer[];
    setCustomers: (customers: Customer[] | ((val: Customer[]) => Customer[])) => void;
}

// --- Reusable SVG Charts ---

const LineChart: React.FC<{ data: number[], labels: string[] }> = ({ data, labels }) => {
    if (data.length === 0) return null;
    const max = Math.max(...data) || 1;
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (d / max) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-32 relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                {/* Gradient Fill */}
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <polyline points={`${points} 100,100 0,100`} fill="url(#chartGradient)" />
                <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                {/* Dots */}
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * 100;
                    const y = 100 - (d / max) * 100;
                    return <circle key={i} cx={x} cy={y} r="1.5" fill="white" stroke="#3b82f6" strokeWidth="1" vectorEffect="non-scaling-stroke" />;
                })}
            </svg>
            <div className="flex justify-between mt-2 text-[10px] opacity-60">
                {labels.map((l, i) => <span key={i}>{l}</span>)}
            </div>
        </div>
    );
};

const DonutChart: React.FC<{ segments: { value: number, color: string }[] }> = ({ segments }) => {
    const total = segments.reduce((acc, s) => acc + s.value, 0);
    let cumulative = 0;

    return (
        <div className="w-32 h-32 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {segments.map((s, i) => {
                    if(s.value === 0) return null;
                    const percent = s.value / total;
                    const dashArray = `${percent * 314} 314`; // 2 * PI * R (R=50 approx)
                    const dashOffset = -cumulative * 314;
                    cumulative += percent;
                    return (
                        <circle 
                            key={i} 
                            cx="50" cy="50" r="40" 
                            fill="transparent" 
                            stroke={s.color} 
                            strokeWidth="20" 
                            strokeDasharray={dashArray} 
                            strokeDashoffset={dashOffset} 
                        />
                    );
                })}
                {total === 0 && <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e5e7eb" strokeWidth="20" />}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-xs opacity-60">
                Total<br/>{total}
            </div>
        </div>
    );
};

const BarChart: React.FC<{ data: number[], labels: string[] }> = ({ data, labels }) => {
    const max = Math.max(...data) || 1;
    return (
        <div className="w-full h-32 flex items-end gap-1">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group">
                    <div 
                        className="w-full bg-blue-500/50 dark:bg-blue-500/30 rounded-t-sm hover:bg-blue-500 transition-all relative group-hover:scale-y-105 origin-bottom" 
                        style={{ height: `${(d / max) * 100}%` }}
                    >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {d}
                        </div>
                    </div>
                    <span className="text-[10px] opacity-50 mt-1">{labels[i]}</span>
                </div>
            ))}
        </div>
    );
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
        const totalProfit = monthlySales.reduce((acc, s) => acc + (s.totalProfit || 0), 0);
        const totalCost = monthlyExpenses.reduce((acc, e) => acc + e.amount, 0);
        const netProfit = totalProfit - totalCost;
        
        // --- CHARTS DATA PREP ---
        
        // 1. Weekly Trend (Last 7 days)
        const last7Days = Array.from({length: 7}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });
        
        const trendData = last7Days.map(dateStr => {
            return sales
                .filter(s => s.date.startsWith(dateStr))
                .reduce((acc, s) => acc + s.totalAmount, 0);
        });
        const trendLabels = last7Days.map(d => new Date(d).toLocaleDateString(undefined, {weekday: 'short'}));

        // 2. Category Pie
        const categoryMap = new Map<string, number>();
        monthlySales.forEach(s => {
            s.items.forEach(item => {
                const cat = item.category || 'General';
                categoryMap.set(cat, (categoryMap.get(cat) || 0) + (item.sellingPrice * item.quantity));
            });
        });
        const catSegments = Array.from(categoryMap.entries())
            .sort((a,b) => b[1] - a[1])
            .slice(0, 5)
            .map(([label, value], i) => ({
                label,
                value: Math.round(value),
                color: ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'][i] || '#9ca3af'
            }));

        // 3. Peak Hours
        const hourCounts = new Array(24).fill(0);
        monthlySales.forEach(s => {
            const h = new Date(s.date).getHours();
            hourCounts[h]++;
        });
        // Group into 4-hour blocks for simpler chart: 0-4, 4-8, 8-12, 12-16, 16-20, 20-24
        const hourBlocks = [0,0,0,0,0,0];
        const blockLabels = ['Late', 'Early', 'Morn', 'Aftn', 'Eve', 'Night'];
        hourCounts.forEach((count, h) => {
            const blockIdx = Math.floor(h / 4);
            hourBlocks[blockIdx] += count;
        });

        // Average Basket Size
        const avgSaleValue = monthlySales.length > 0 ? totalRevenue / monthlySales.length : 0;

        return { 
            totalRevenue, totalProfit, totalCost, netProfit, avgSaleValue,
            trendData, trendLabels, catSegments, hourBlocks, blockLabels
        };
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
                    { id: 'dashboard', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
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
                                <div className="text-sm opacity-60 mb-1">Avg Ticket</div>
                                <div className="text-2xl font-bold flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                    <BarChart3 className="w-5 h-5" /> {dashboardData.avgSaleValue.toFixed(0)}
                                </div>
                            </Card>
                        </div>

                        {/* Interactive Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Revenue Trend Chart */}
                            <Card>
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-blue-500" /> Revenue Trend (7 Days)
                                </h3>
                                <LineChart data={dashboardData.trendData} labels={dashboardData.trendLabels} />
                            </Card>

                            {/* Peak Hours Bar Chart */}
                            <Card>
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-orange-500" /> Peak Sales Hours
                                </h3>
                                <BarChart data={dashboardData.hourBlocks} labels={dashboardData.blockLabels} />
                            </Card>

                            {/* Category Pie Chart */}
                            <Card className="flex flex-col md:flex-row items-center gap-6">
                                <div className="flex-1">
                                    <h3 className="font-bold mb-2 flex items-center gap-2">
                                        <PieChart className="w-5 h-5 text-purple-500" /> Sales by Category
                                    </h3>
                                    <p className="text-xs opacity-60 mb-4">Top product categories by revenue.</p>
                                    <div className="space-y-2">
                                        {dashboardData.catSegments.map((s, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                                                <span className="flex-grow">{s.label}</span>
                                                <span className="font-bold">{s.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <DonutChart segments={dashboardData.catSegments} />
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
