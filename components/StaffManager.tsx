
import React, { useState, useMemo } from 'react';
import { Card, Input, Button, Select } from './ui/BaseComponents';
import { Users, UserPlus, Calendar, Clock, DollarSign, Plus, Phone, CheckCircle2, XCircle, AlertCircle, History, Briefcase, Trash2, Edit2, X, Wallet } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { Staff, Attendance, StaffPayment } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { getThemeClasses } from '../utils/themeUtils';

const StaffManager: React.FC = () => {
    const { theme, currencySymbol } = useTheme();
    const styles = getThemeClasses(theme);

    // State
    const [staff, setStaff] = useLocalStorage<Staff[]>('tradesmen-staff', []);
    const [attendance, setAttendance] = useLocalStorage<Attendance[]>('tradesmen-attendance', []);
    const [payments, setPayments] = useLocalStorage<StaffPayment[]>('tradesmen-staff-payments', []);
    
    const [activeTab, setActiveTab] = useState<'daily' | 'staff' | 'payments'>('daily');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isAdding, setIsAdding] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [viewStaffId, setViewStaffId] = useState<string | null>(null);

    // Form State for New Staff
    const [formData, setFormData] = useState<Partial<Staff>>({
        name: '', role: 'Helper', phone: '', salary: 0, balance: 0, isActive: true
    });

    // Form State for Payment
    const [paymentForm, setPaymentForm] = useState({ amount: '', note: '', type: 'salary' });

    // --- Actions ---

    const handleSaveStaff = () => {
        if (!formData.name) return;
        
        if (editId) {
            setStaff(prev => prev.map(s => s.id === editId ? { ...s, ...formData } as Staff : s));
        } else {
            const newStaff: Staff = {
                id: Date.now().toString(),
                name: formData.name,
                role: formData.role || 'Helper',
                phone: formData.phone || '',
                salary: Number(formData.salary) || 0,
                balance: Number(formData.balance) || 0,
                joinedDate: new Date().toISOString(),
                isActive: true
            };
            setStaff(prev => [...prev, newStaff]);
        }
        setIsAdding(false);
        setEditId(null);
        setFormData({ name: '', role: 'Helper', phone: '', salary: 0, balance: 0, isActive: true });
    };

    const handleDeleteStaff = (id: string) => {
        if(window.confirm("Remove this staff member? History will be kept but they won't appear in lists.")) {
            setStaff(prev => prev.map(s => s.id === id ? { ...s, isActive: false } : s));
            if(viewStaffId === id) setViewStaffId(null);
        }
    };

    const markAttendance = (staffId: string, status: Attendance['status']) => {
        setAttendance(prev => {
            // Remove existing record for this day if any
            const filtered = prev.filter(a => !(a.staffId === staffId && a.date === selectedDate));
            // Add new record
            return [...filtered, {
                id: Date.now().toString(),
                staffId,
                date: selectedDate,
                status,
                checkIn: new Date().toISOString()
            }];
        });
    };

    const recordPayment = () => {
        if (!viewStaffId || !paymentForm.amount) return;
        const amount = Number(paymentForm.amount);
        
        const newPayment: StaffPayment = {
            id: Date.now().toString(),
            staffId: viewStaffId,
            amount: amount,
            date: new Date().toISOString(),
            type: paymentForm.type as any,
            note: paymentForm.note
        };

        setPayments(prev => [newPayment, ...prev]);
        
        // Update balance
        setStaff(prev => prev.map(s => {
            if (s.id === viewStaffId) {
                // If it's an 'advance', balance decreases (becomes more negative). 
                // If it's 'salary' payout, balance decreases (assuming balance tracks Due Salary).
                // Let's simplify: Balance tracks "Amount Due TO Staff".
                // Paying salary decreases balance. Giving advance decreases balance (can go negative).
                // Bonus increases balance? No, usually paid out immediately or added to due.
                
                // Let's assume:
                // Balance = Pending Amount to pay to staff.
                // Advance = Money given before due. Reduces balance.
                // Salary Payout = Money given for due work. Reduces balance.
                
                return { ...s, balance: s.balance - amount };
            }
            return s;
        }));

        setPaymentForm({ amount: '', note: '', type: 'salary' });
        alert("Payment Recorded");
    };

    // --- Derived Data ---
    const activeStaff = staff.filter(s => s.isActive);
    
    const getAttendanceStatus = (staffId: string) => {
        return attendance.find(a => a.staffId === staffId && a.date === selectedDate)?.status;
    };

    const viewingStaff = staff.find(s => s.id === viewStaffId);
    
    // Calculate Monthly Stats
    const currentMonthStats = useMemo(() => {
        if (!viewingStaff) return null;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const monthlyAttendance = attendance.filter(a => {
            const d = new Date(a.date);
            return a.staffId === viewingStaff.id && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const present = monthlyAttendance.filter(a => a.status === 'present').length;
        const halfDay = monthlyAttendance.filter(a => a.status === 'half-day').length;
        const absent = monthlyAttendance.filter(a => a.status === 'absent').length;
        
        // Simple Salary Estimation: (Salary / 30) * (Present + 0.5 * HalfDay)
        const dailyRate = viewingStaff.salary / 30;
        const earned = Math.round(dailyRate * (present + (halfDay * 0.5)));

        return { present, halfDay, absent, earned };
    }, [viewingStaff, attendance]);

    const staffPayments = useMemo(() => {
        return payments.filter(p => p.staffId === viewStaffId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [payments, viewStaffId]);

    return (
        <div className="space-y-6 pb-24">
            {/* Header Card */}
            <Card className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-none">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                            <Briefcase className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Staff Book</h2>
                            <p className="opacity-80 text-sm">Attendance & Salary Manager</p>
                        </div>
                    </div>
                    <Button onClick={() => { setFormData({}); setIsAdding(true); }} className="bg-white/20 hover:bg-white/30 text-white border-none shadow-none">
                        <UserPlus className="w-5 h-5" /> <span className="hidden md:inline ml-2">Add Staff</span>
                    </Button>
                </div>
            </Card>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left: Staff List / Daily Attendance */}
                <div className="md:col-span-1 space-y-4">
                    <Card className="flex flex-col h-full min-h-[500px]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-500" /> Daily Attendance</h3>
                            <input 
                                type="date" 
                                value={selectedDate} 
                                onChange={e => setSelectedDate(e.target.value)} 
                                className="bg-gray-100 dark:bg-white/10 rounded-lg px-2 py-1 text-sm outline-none"
                            />
                        </div>

                        <div className="space-y-3 flex-grow overflow-y-auto custom-scrollbar pr-1">
                            {activeStaff.length > 0 ? activeStaff.map(s => {
                                const status = getAttendanceStatus(s.id);
                                return (
                                    <div key={s.id} onClick={() => setViewStaffId(s.id)} className={`p-3 rounded-xl border transition-all cursor-pointer ${viewStaffId === s.id ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-gray-100 dark:border-white/10 hover:bg-gray-50'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-bold">{s.name}</div>
                                                <div className="text-xs opacity-60">{s.role}</div>
                                            </div>
                                            {s.balance !== 0 && (
                                                <div className={`text-xs font-bold px-2 py-0.5 rounded ${s.balance > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    {s.balance > 0 ? 'Due' : 'Adv'}: {Math.abs(s.balance)}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Quick Actions */}
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); markAttendance(s.id, 'present'); }}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${status === 'present' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}
                                            >
                                                P
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); markAttendance(s.id, 'half-day'); }}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${status === 'half-day' ? 'bg-yellow-500 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}
                                            >
                                                H
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); markAttendance(s.id, 'absent'); }}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${status === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}
                                            >
                                                A
                                            </button>
                                        </div>
                                    </div>
                                )
                            }) : (
                                <div className="text-center py-10 opacity-50">
                                    <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                    No staff added.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right: Details Panel */}
                <div className="md:col-span-2">
                    <AnimatePresence mode="wait">
                        {viewingStaff ? (
                            <motion.div 
                                key={viewingStaff.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                {/* Profile Card */}
                                <Card>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-2xl font-bold">
                                                {viewingStaff.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold">{viewingStaff.name}</h2>
                                                <div className="flex items-center gap-4 opacity-60 text-sm mt-1">
                                                    <span>{viewingStaff.role}</span>
                                                    <span>•</span>
                                                    <span>{viewingStaff.phone}</span>
                                                </div>
                                                <div className="text-sm font-bold text-violet-600 mt-1">
                                                    Salary: {currencySymbol}{viewingStaff.salary}/mo
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="secondary" onClick={() => { setFormData(viewingStaff); setEditId(viewingStaff.id); setIsAdding(true); }} className="p-2 h-auto rounded-lg">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="secondary" onClick={() => handleDeleteStaff(viewingStaff.id)} className="p-2 h-auto rounded-lg text-red-500 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Monthly Stats */}
                                    <div className="grid grid-cols-4 gap-2 mt-6">
                                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl text-center border border-green-100 dark:border-green-900/30">
                                            <div className="text-xs opacity-60 uppercase font-bold">Present</div>
                                            <div className="text-xl font-black text-green-600">{currentMonthStats?.present}</div>
                                        </div>
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl text-center border border-yellow-100 dark:border-yellow-900/30">
                                            <div className="text-xs opacity-60 uppercase font-bold">Half Day</div>
                                            <div className="text-xl font-black text-yellow-600">{currentMonthStats?.halfDay}</div>
                                        </div>
                                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl text-center border border-red-100 dark:border-red-900/30">
                                            <div className="text-xs opacity-60 uppercase font-bold">Absent</div>
                                            <div className="text-xl font-black text-red-600">{currentMonthStats?.absent}</div>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl text-center border border-blue-100 dark:border-blue-900/30">
                                            <div className="text-xs opacity-60 uppercase font-bold">Est. Pay</div>
                                            <div className="text-xl font-black text-blue-600">{currencySymbol}{currentMonthStats?.earned}</div>
                                        </div>
                                    </div>
                                </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Payment Recorder */}
                                    <Card>
                                        <h3 className="font-bold mb-4 flex items-center gap-2"><Wallet className="w-5 h-5 text-green-600" /> Record Payment / Advance</h3>
                                        <div className="space-y-3">
                                            <Input 
                                                label="Amount" 
                                                type="number" 
                                                value={paymentForm.amount} 
                                                onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} 
                                                placeholder="0.00"
                                            />
                                            <Select 
                                                label="Type" 
                                                value={paymentForm.type} 
                                                onChange={e => setPaymentForm({...paymentForm, type: e.target.value})}
                                            >
                                                <option value="salary">Salary Payment</option>
                                                <option value="advance">Advance Given</option>
                                                <option value="bonus">Bonus</option>
                                            </Select>
                                            <Input 
                                                label="Note" 
                                                value={paymentForm.note} 
                                                onChange={e => setPaymentForm({...paymentForm, note: e.target.value})} 
                                                placeholder="e.g. For festival"
                                            />
                                            <Button onClick={recordPayment} className="w-full bg-green-600 hover:bg-green-700 text-white">Save Transaction</Button>
                                        </div>
                                    </Card>

                                    {/* History List */}
                                    <Card className="h-full max-h-[350px] overflow-hidden flex flex-col">
                                        <h3 className="font-bold mb-4 flex items-center gap-2"><History className="w-5 h-5 opacity-60" /> Payment History</h3>
                                        <div className="flex-grow overflow-y-auto custom-scrollbar space-y-2 pr-1">
                                            {staffPayments.length > 0 ? staffPayments.map(p => (
                                                <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                                                    <div>
                                                        <div className="font-bold text-sm capitalize">{p.type}</div>
                                                        <div className="text-xs opacity-50">{new Date(p.date).toLocaleDateString()}</div>
                                                        {p.note && <div className="text-xs opacity-70 italic">{p.note}</div>}
                                                    </div>
                                                    <div className="font-bold text-red-500">-{currencySymbol}{p.amount}</div>
                                                </div>
                                            )) : <div className="text-center opacity-40 py-8 text-sm">No payment records found.</div>}
                                        </div>
                                    </Card>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-30 min-h-[400px]">
                                <Briefcase className="w-20 h-20 mb-4" />
                                <p className="text-lg font-bold">Select a staff member</p>
                                <p className="text-sm">Manage attendance and payments</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Add Staff Modal */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg">{editId ? 'Edit Staff' : 'Add New Staff'}</h3>
                                <button onClick={() => setIsAdding(false)}><X className="w-6 h-6 opacity-60 hover:opacity-100" /></button>
                            </div>
                            <div className="space-y-4">
                                <Input label="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus />
                                <Input label="Role" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="e.g. Helper" />
                                <Input label="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                <Input label="Monthly Salary" type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: Number(e.target.value)})} />
                                <Input label="Initial Balance (Optional)" type="number" value={formData.balance} onChange={e => setFormData({...formData, balance: Number(e.target.value)})} placeholder="Positive = Due, Negative = Advance" />
                                <Button onClick={handleSaveStaff} className="w-full mt-4">Save Profile</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StaffManager;
