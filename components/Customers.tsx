import React, { useState } from 'react';
import { Customer, Transaction } from '../types';
import { Card, Input, Button } from './ui/BaseComponents';
import { Users, Search, Plus, Trash2, Edit2, X, Phone, History, Calendar } from 'lucide-react';
import { getThemeClasses } from '../utils/themeUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

interface CustomersProps {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
}

const Customers: React.FC<CustomersProps> = ({ customers, setCustomers }) => {
  const { theme } = useTheme();
  const styles = getThemeClasses(theme);

  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
  });

  const handleSave = () => {
    if (!formData.name) return;

    if (editId) {
        setCustomers(customers.map(c => c.id === editId ? { ...c, ...formData } as Customer : c));
    } else {
        const newCustomer: Customer = {
            id: Date.now().toString(),
            name: formData.name,
            phone: formData.phone || '',
            history: []
        };
        setCustomers([...customers, newCustomer]);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if(window.confirm("Are you sure? This will delete the customer and their history.")) {
        setCustomers(customers.filter(c => c.id !== id));
        if (selectedCustomer?.id === id) setSelectedCustomer(null);
    }
  };

  const handleEdit = (customer: Customer) => {
      setFormData({ name: customer.name, phone: customer.phone });
      setEditId(customer.id);
      setIsAdding(true);
  };

  const resetForm = () => {
      setFormData({ name: '', phone: '' });
      setIsAdding(false);
      setEditId(null);
  }

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {/* Customer List Column */}
        <div className="md:col-span-1 space-y-4">
            <Card className="h-full">
                 <div className="flex flex-col gap-4 mb-4">
                    <h2 className={`text-xl font-bold flex items-center gap-2 ${styles.accentText}`}>
                        <Users className="w-5 h-5" /> Customers
                    </h2>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Search name/phone..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button onClick={() => setIsAdding(true)} className="px-3">
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="overflow-y-auto max-h-[60vh] space-y-2 pr-1">
                    {filteredCustomers.length > 0 ? (
                        filteredCustomers.map(customer => (
                            <motion.div
                                key={customer.id}
                                onClick={() => setSelectedCustomer(customer)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`p-3 rounded-xl cursor-pointer border transition-all ${
                                    selectedCustomer?.id === customer.id 
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                        : theme === 'glass' ? 'bg-white/5 border-white/10' : 'border-gray-100 bg-white dark:bg-gray-800 dark:border-gray-700'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold">{customer.name}</div>
                                        <div className="text-xs opacity-60 flex items-center gap-1">
                                            <Phone className="w-3 h-3" /> {customer.phone || 'No Phone'}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); handleEdit(customer); }}
                                            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
                                         >
                                            <Edit2 className="w-3 h-3 text-blue-500" />
                                         </button>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); handleDelete(customer.id); }}
                                            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
                                         >
                                            <Trash2 className="w-3 h-3 text-red-500" />
                                         </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center opacity-50 py-8">No customers found.</div>
                    )}
                </div>
            </Card>
        </div>

        {/* Details & History Column */}
        <div className="md:col-span-2">
            <AnimatePresence mode="wait">
                {selectedCustomer ? (
                    <motion.div 
                        key={selectedCustomer.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="h-full"
                    >
                        <Card className="h-full flex flex-col">
                            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-white/10 pb-4">
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedCustomer.name}</h2>
                                    <p className="opacity-60 text-sm flex items-center gap-2 mt-1">
                                        <Phone className="w-4 h-4" /> {selectedCustomer.phone || 'N/A'}
                                        <span className="mx-2">•</span>
                                        <span>ID: {selectedCustomer.id.slice(-6)}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm opacity-60">Total Visits</div>
                                    <div className={`text-xl font-bold ${styles.accentText}`}>{selectedCustomer.history.length}</div>
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <History className="w-4 h-4" /> Transaction History
                                </h3>
                                {selectedCustomer.history.length > 0 ? (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="opacity-60 text-xs uppercase tracking-wide border-b border-gray-200 dark:border-white/10">
                                                <th className="pb-2">Date</th>
                                                <th className="pb-2">Items</th>
                                                <th className="pb-2 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedCustomer.history.slice().reverse().map((tx) => (
                                                <tr key={tx.id} className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-black/5 dark:hover:bg-white/5">
                                                    <td className="py-3 text-sm flex items-center gap-2">
                                                        <Calendar className="w-3 h-3 opacity-50" />
                                                        {new Date(tx.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3 text-sm opacity-80">{tx.summary}</td>
                                                    <td className="py-3 font-bold text-right">{tx.amount.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-center py-12 opacity-40">
                                        No purchase history available.
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="h-full flex items-center justify-center opacity-30"
                    >
                        <div className="text-center">
                            <Users className="w-16 h-16 mx-auto mb-4" />
                            <p>Select a customer to view details</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>

       {/* Add/Edit Modal */}
       <AnimatePresence>
        {isAdding && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={resetForm}
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={`text-lg font-bold ${styles.accentText}`}>{editId ? 'Edit Customer' : 'New Customer'}</h3>
                            <button onClick={resetForm}><X className="w-6 h-6 opacity-60 hover:opacity-100" /></button>
                        </div>
                        <div className="space-y-4">
                            <Input label="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus />
                            <Input label="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Optional" />
                            <div className="pt-2 flex gap-3">
                                <Button className="w-full" onClick={handleSave}>Save</Button>
                                <Button variant="secondary" onClick={resetForm}>Cancel</Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Customers;
