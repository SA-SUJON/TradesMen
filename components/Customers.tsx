
import React, { useState } from 'react';
import { Customer, Transaction } from '../types';
import { Card, Input, Button } from './ui/BaseComponents';
import { Users, Search, Plus, Trash2, Edit2, X, Phone, History, Calendar, AlertCircle, MapPin, Key, StickyNote, ExternalLink } from 'lucide-react';
import { getThemeClasses } from '../utils/themeUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { openWhatsApp } from '../utils/appUtils';

interface CustomersProps {
  customers: Customer[];
  setCustomers: (customers: Customer[] | ((val: Customer[]) => Customer[])) => void;
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
    address: '',
    gateCode: '',
    notes: ''
  });

  const handleSave = () => {
    if (!formData.name) return;

    if (editId) {
        setCustomers(prev => prev.map(c => c.id === editId ? { ...c, ...formData } as Customer : c));
        // Update selected view if editing currently selected
        if (selectedCustomer?.id === editId) {
            setSelectedCustomer(prev => prev ? { ...prev, ...formData } as Customer : null);
        }
    } else {
        const newCustomer: Customer = {
            id: Date.now().toString(),
            name: formData.name,
            phone: formData.phone || '',
            address: formData.address || '',
            gateCode: formData.gateCode || '',
            notes: formData.notes || '',
            debt: 0,
            history: []
        };
        setCustomers(prev => [...prev, newCustomer]);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    // Timeout ensuring click release before confirm
    setTimeout(() => {
        if(window.confirm("Are you sure? This will delete the customer and their history.")) {
            setCustomers(prev => prev.filter(c => c.id !== id));
            if (selectedCustomer?.id === id) setSelectedCustomer(null);
        }
    }, 50);
  };

  const handleEdit = (customer: Customer) => {
      setFormData({ 
          name: customer.name, 
          phone: customer.phone,
          address: customer.address || '',
          gateCode: customer.gateCode || '',
          notes: customer.notes || ''
      });
      setEditId(customer.id);
      setIsAdding(true);
  };

  const resetForm = () => {
      setFormData({ name: '', phone: '', address: '', gateCode: '', notes: '' });
      setIsAdding(false);
      setEditId(null);
  }

  const openMap = (address: string) => {
      if (!address) return;
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6 pb-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {/* Customer List Column */}
        <div className="md:col-span-1 space-y-4">
            <Card className="h-full flex flex-col">
                 <div className="flex flex-col gap-4 mb-4 flex-shrink-0">
                    <h2 className={`text-xl font-bold flex items-center gap-2 ${styles.accentText}`}>
                        <Users className="w-5 h-5" /> Clients
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

                {/* Removed fixed max-height on mobile to allow page scroll with padding */}
                <div className="md:overflow-y-auto md:flex-grow space-y-2 pr-1 custom-scrollbar min-h-[300px]">
                    {filteredCustomers.length > 0 ? (
                        filteredCustomers.map(customer => (
                            <motion.div
                                key={customer.id}
                                onClick={() => setSelectedCustomer(customer)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`p-3 rounded-xl cursor-pointer border transition-all relative ${
                                    selectedCustomer?.id === customer.id 
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                        : theme === 'glass' ? 'bg-white/5 border-white/10' : 'border-gray-100 bg-white dark:bg-gray-800 dark:border-gray-700'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold">{customer.name}</div>
                                        <div className="text-xs opacity-60 flex items-center gap-1 mt-0.5">
                                            <Phone className="w-3 h-3" /> {customer.phone || 'No Phone'}
                                        </div>
                                        {customer.address && (
                                            <div className="text-[10px] opacity-50 mt-1 truncate max-w-[150px]">
                                                {customer.address}
                                            </div>
                                        )}
                                        {customer.debt > 0 && (
                                            <div className="mt-1 text-[10px] font-bold text-orange-500 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> Due: {customer.debt}
                                            </div>
                                        )}
                                    </div>
                                    <div 
                                        className="flex gap-2 relative z-20 bg-gray-50/50 dark:bg-black/20 p-1 rounded-lg"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                         <button 
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleEdit(customer); }}
                                            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full cursor-pointer"
                                         >
                                            <Edit2 className="w-4 h-4 text-blue-500" />
                                         </button>
                                          <button 
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleDelete(customer.id); }}
                                            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full cursor-pointer"
                                         >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                         </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center opacity-50 py-8">No clients found.</div>
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
                            {/* CRM Header Profile */}
                            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 border-b border-gray-100 dark:border-white/10 pb-4 gap-4">
                                <div>
                                    <h2 className="text-3xl font-display font-bold">{selectedCustomer.name}</h2>
                                    <div className="flex gap-4 mt-2">
                                        {selectedCustomer.phone && (
                                            <button 
                                                onClick={() => openWhatsApp(selectedCustomer.phone, "Hello!")}
                                                className="opacity-70 hover:opacity-100 text-sm flex items-center gap-1 hover:text-green-600 transition-colors"
                                            >
                                                <Phone className="w-4 h-4" /> {selectedCustomer.phone}
                                            </button>
                                        )}
                                        <span className="opacity-40 text-sm">ID: {selectedCustomer.id.slice(-4)}</span>
                                    </div>
                                </div>
                                <div className="text-left md:text-right p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 min-w-[140px]">
                                    <div className="text-xs opacity-60 uppercase tracking-wide">Balance Due</div>
                                    <div className={`text-2xl font-black ${selectedCustomer.debt > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                                        {selectedCustomer.debt.toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {/* Address Card */}
                                <div className="p-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 relative group">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 opacity-50 mt-0.5 flex-shrink-0" />
                                        <div className="flex-grow">
                                            <div className="text-xs font-bold opacity-50 uppercase mb-1">Service Address</div>
                                            <div className="text-sm font-medium leading-relaxed">
                                                {selectedCustomer.address || "No address provided"}
                                            </div>
                                            {selectedCustomer.address && (
                                                <button 
                                                    onClick={() => openMap(selectedCustomer.address!)}
                                                    className="mt-2 text-xs flex items-center gap-1 text-blue-600 hover:underline"
                                                >
                                                    View on Map <ExternalLink className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Gate Code / Notes Card */}
                                <div className="space-y-3">
                                    {selectedCustomer.gateCode && (
                                        <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800 flex items-center gap-3">
                                            <Key className="w-5 h-5 flex-shrink-0" />
                                            <div>
                                                <div className="text-[10px] font-bold uppercase opacity-70">Gate / Access Code</div>
                                                <div className="text-lg font-mono font-bold tracking-wider">{selectedCustomer.gateCode}</div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {selectedCustomer.notes && (
                                        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                                            <div className="flex items-center gap-2 mb-1 text-blue-700 dark:text-blue-300">
                                                <StickyNote className="w-3 h-3" />
                                                <span className="text-xs font-bold uppercase">Notes</span>
                                            </div>
                                            <p className="text-sm opacity-80 whitespace-pre-wrap">{selectedCustomer.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto border-t border-gray-100 dark:border-white/10 pt-4">
                                <h3 className="font-bold mb-4 flex items-center gap-2 opacity-80">
                                    <History className="w-4 h-4" /> Transaction History
                                </h3>
                                {selectedCustomer.history.length > 0 ? (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="opacity-60 text-xs uppercase tracking-wide border-b border-gray-200 dark:border-white/10">
                                                <th className="pb-2">Date</th>
                                                <th className="pb-2">Type</th>
                                                <th className="pb-2">Details</th>
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
                                                    <td className="py-3 text-xs">
                                                        <span className={`px-1.5 py-0.5 rounded ${
                                                            tx.type === 'credit' ? 'bg-orange-100 text-orange-700' : 
                                                            tx.type === 'payment' ? 'bg-green-100 text-green-700' : 
                                                            'bg-gray-100 dark:bg-white/10'
                                                        }`}>
                                                            {tx.type || 'sale'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-sm opacity-80">{tx.summary}</td>
                                                    <td className={`py-3 font-bold text-right ${tx.type === 'payment' ? 'text-green-600' : ''}`}>
                                                        {tx.type === 'payment' ? '-' : ''}{tx.amount.toFixed(2)}
                                                    </td>
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
                        className="h-full flex items-center justify-center opacity-30 min-h-[400px]"
                    >
                        <div className="text-center">
                            <Users className="w-16 h-16 mx-auto mb-4" />
                            <p>Select a client to view profile</p>
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
                    initial={{ scale: 0.9, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 50 }}
                    className="w-full max-w-md max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Card>
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-white/10 pb-4">
                            <h3 className={`text-lg font-bold ${styles.accentText}`}>{editId ? 'Edit Client Profile' : 'New Client'}</h3>
                            <button onClick={resetForm}><X className="w-6 h-6 opacity-60 hover:opacity-100" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Input label="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <Input label="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Mobile" />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <Input label="Gate / Entry Code" value={formData.gateCode} onChange={e => setFormData({...formData, gateCode: e.target.value})} placeholder="e.g. #1234" icon={<Key className="w-4 h-4" />} />
                                </div>
                            </div>
                            
                            <Input label="Service Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Street, City, Zip" icon={<MapPin className="w-4 h-4" />} />
                            
                            <div>
                                <label className={`${styles.label} mb-2`}>Notes</label>
                                <textarea 
                                    className={`w-full p-3 rounded-xl min-h-[100px] outline-none ${theme === 'glass' ? 'bg-black/20 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white'}`}
                                    placeholder="Important client details..."
                                    value={formData.notes}
                                    onChange={e => setFormData({...formData, notes: e.target.value})}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button className="w-full" onClick={handleSave}>Save Profile</Button>
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
