
import React, { useState } from 'react';
import { Customer, Supplier, Transaction } from '../types';
import { Card, Input, Button } from './ui/BaseComponents';
import { Users, Search, Plus, Trash2, Edit2, X, Phone, History, Calendar, AlertCircle, MapPin, Key, StickyNote, ExternalLink, Truck, Factory, Building2, Contact, Wallet, Banknote } from 'lucide-react';
import { getThemeClasses } from '../utils/themeUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { openWhatsApp } from '../utils/appUtils';

interface CustomersProps {
  customers: Customer[];
  setCustomers: (customers: Customer[] | ((val: Customer[]) => Customer[])) => void;
  suppliers: Supplier[];
  setSuppliers: (suppliers: Supplier[] | ((val: Supplier[]) => Supplier[])) => void;
}

const Customers: React.FC<CustomersProps> = ({ customers, setCustomers, suppliers, setSuppliers }) => {
  const { theme } = useTheme();
  const styles = getThemeClasses(theme);

  const [activeTab, setActiveTab] = useState<'clients' | 'suppliers'>('clients');
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Selection State
  const [selectedClient, setSelectedClient] = useState<Customer | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Unified Form State (Superset of both)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    gateCode: '', // Client Only
    contactPerson: '', // Supplier Only
    gstin: '', // Supplier Only
    category: '', // Supplier Only
    notes: '',
    creditLimit: 0, // Client Only
  });

  const handleSave = () => {
    if (!formData.name) return;

    if (activeTab === 'clients') {
        if (editId) {
            setCustomers(prev => prev.map(c => c.id === editId ? { ...c, ...formData } as Customer : c));
            if (selectedClient?.id === editId) setSelectedClient(prev => prev ? { ...prev, ...formData } as Customer : null);
        } else {
            const newCustomer: Customer = {
                id: Date.now().toString(),
                name: formData.name,
                phone: formData.phone || '',
                address: formData.address || '',
                gateCode: formData.gateCode || '',
                notes: formData.notes || '',
                debt: 0,
                creditLimit: formData.creditLimit || 0,
                history: []
            };
            setCustomers(prev => [...prev, newCustomer]);
        }
    } else {
        if (editId) {
            setSuppliers(prev => prev.map(s => s.id === editId ? { ...s, ...formData } as Supplier : s));
            if (selectedSupplier?.id === editId) setSelectedSupplier(prev => prev ? { ...prev, ...formData } as Supplier : null);
        } else {
            const newSupplier: Supplier = {
                id: Date.now().toString(),
                name: formData.name,
                contactPerson: formData.contactPerson || '',
                phone: formData.phone || '',
                address: formData.address || '',
                gstin: formData.gstin || '',
                category: formData.category || '',
                notes: formData.notes || ''
            };
            setSuppliers(prev => [...prev, newSupplier]);
        }
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    setTimeout(() => {
        if(window.confirm(`Are you sure you want to delete this ${activeTab === 'clients' ? 'client' : 'supplier'}?`)) {
            if (activeTab === 'clients') {
                setCustomers(prev => prev.filter(c => c.id !== id));
                if (selectedClient?.id === id) setSelectedClient(null);
            } else {
                setSuppliers(prev => prev.filter(s => s.id !== id));
                if (selectedSupplier?.id === id) setSelectedSupplier(null);
            }
        }
    }, 50);
  };

  const handleEdit = (item: any) => {
      setFormData({ 
          name: item.name, 
          phone: item.phone,
          address: item.address || '',
          gateCode: item.gateCode || '',
          contactPerson: item.contactPerson || '',
          gstin: item.gstin || '',
          category: item.category || '',
          notes: item.notes || '',
          creditLimit: item.creditLimit || 0
      });
      setEditId(item.id);
      setIsAdding(true);
  };

  const handleSettleDebt = (amount: number) => {
      if (!selectedClient || amount <= 0) return;
      
      const newTransaction: Transaction = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          amount: amount,
          summary: "Direct Payment Received",
          type: "payment"
      };

      const updatedCustomer = {
          ...selectedClient,
          debt: selectedClient.debt - amount,
          history: [...selectedClient.history, newTransaction]
      };

      setCustomers(prev => prev.map(c => c.id === selectedClient.id ? updatedCustomer : c));
      setSelectedClient(updatedCustomer);
  };

  const resetForm = () => {
      setFormData({ name: '', phone: '', address: '', gateCode: '', contactPerson: '', gstin: '', category: '', notes: '', creditLimit: 0 });
      setIsAdding(false);
      setEditId(null);
  }

  const openMap = (address: string) => {
      if (!address) return;
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  // Filter Lists
  const filteredClients = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
  const filteredSuppliers = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search));

  return (
    <div className="space-y-6 pb-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {/* List Column */}
        <div className="md:col-span-1 space-y-4">
            <Card className="h-full flex flex-col">
                 <div className="flex flex-col gap-4 mb-4 flex-shrink-0">
                    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl">
                        <button 
                            onClick={() => { setActiveTab('clients'); setSelectedSupplier(null); setSearch(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'clients' ? 'bg-white shadow text-blue-600 dark:bg-gray-800 dark:text-blue-400' : 'opacity-60 hover:opacity-100'}`}
                        >
                            <Users className="w-4 h-4" /> Clients
                        </button>
                        <button 
                            onClick={() => { setActiveTab('suppliers'); setSelectedClient(null); setSearch(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'suppliers' ? 'bg-white shadow text-purple-600 dark:bg-gray-800 dark:text-purple-400' : 'opacity-60 hover:opacity-100'}`}
                        >
                            <Truck className="w-4 h-4" /> Suppliers
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <Input 
                            placeholder="Search..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button onClick={() => setIsAdding(true)} className={`px-3 ${activeTab === 'suppliers' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}>
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="md:overflow-y-auto md:flex-grow space-y-2 pr-1 custom-scrollbar min-h-[300px]">
                    {activeTab === 'clients' ? (
                        filteredClients.length > 0 ? filteredClients.map(customer => (
                            <motion.div
                                key={customer.id}
                                onClick={() => setSelectedClient(customer)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`p-3 rounded-xl cursor-pointer border transition-all relative ${
                                    selectedClient?.id === customer.id 
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
                                        {customer.debt > 0 && (
                                            <div className="mt-1 text-[10px] font-bold text-orange-500 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> Due: {customer.debt}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 relative z-20 bg-gray-50/50 dark:bg-black/20 p-1 rounded-lg" onClick={(e) => e.stopPropagation()}>
                                         <button type="button" onClick={(e) => { e.stopPropagation(); handleEdit(customer); }} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full cursor-pointer">
                                            <Edit2 className="w-4 h-4 text-blue-500" />
                                         </button>
                                          <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(customer.id); }} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full cursor-pointer">
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                         </button>
                                    </div>
                                </div>
                            </motion.div>
                        )) : <div className="text-center opacity-50 py-8">No clients found.</div>
                    ) : (
                        /* ... Supplier list rendering remains similar ... */
                        filteredSuppliers.length > 0 ? filteredSuppliers.map(supplier => (
                            <motion.div
                                key={supplier.id}
                                onClick={() => setSelectedSupplier(supplier)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`p-3 rounded-xl cursor-pointer border transition-all relative ${
                                    selectedSupplier?.id === supplier.id 
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                                        : theme === 'glass' ? 'bg-white/5 border-white/10' : 'border-gray-100 bg-white dark:bg-gray-800 dark:border-gray-700'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold">{supplier.name}</div>
                                        <div className="text-xs opacity-60 flex items-center gap-1 mt-0.5">
                                            <Phone className="w-3 h-3" /> {supplier.phone || 'No Phone'}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 relative z-20 bg-gray-50/50 dark:bg-black/20 p-1 rounded-lg" onClick={(e) => e.stopPropagation()}>
                                         <button type="button" onClick={(e) => { e.stopPropagation(); handleEdit(supplier); }} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full cursor-pointer">
                                            <Edit2 className="w-4 h-4 text-purple-500" />
                                         </button>
                                          <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(supplier.id); }} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full cursor-pointer">
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                         </button>
                                    </div>
                                </div>
                            </motion.div>
                        )) : <div className="text-center opacity-50 py-8">No suppliers found.</div>
                    )}
                </div>
            </Card>
        </div>

        {/* Details Column */}
        <div className="md:col-span-2">
            <AnimatePresence mode="wait">
                {activeTab === 'clients' && selectedClient ? (
                    <motion.div 
                        key={selectedClient.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="h-full"
                    >
                        <Card className="h-full flex flex-col">
                            {/* Client Header */}
                            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 border-b border-gray-100 dark:border-white/10 pb-4 gap-4">
                                <div>
                                    <h2 className="text-3xl font-display font-bold">{selectedClient.name}</h2>
                                    <div className="flex gap-4 mt-2">
                                        {selectedClient.phone && (
                                            <button 
                                                onClick={() => openWhatsApp(selectedClient.phone, "Hello!")}
                                                className="opacity-70 hover:opacity-100 text-sm flex items-center gap-1 hover:text-green-600 transition-colors"
                                            >
                                                <Phone className="w-4 h-4" /> {selectedClient.phone}
                                            </button>
                                        )}
                                        <span className="opacity-40 text-sm">ID: {selectedClient.id.slice(-4)}</span>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="text-left md:text-right p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 min-w-[140px]">
                                        <div className="text-xs opacity-60 uppercase tracking-wide">Balance Due</div>
                                        <div className={`text-2xl font-black ${selectedClient.debt > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                                            {selectedClient.debt.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action Bar */}
                            <div className="flex gap-2 mb-6">
                                <Button 
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => {
                                        const amt = prompt("Enter Payment Amount Received:", selectedClient.debt.toString());
                                        if(amt) handleSettleDebt(Number(amt));
                                    }}
                                >
                                    <Banknote className="w-4 h-4" /> Take Payment
                                </Button>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {/* ... Same details as before ... */}
                                <div className="p-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 opacity-50 mt-0.5 flex-shrink-0" />
                                        <div className="flex-grow">
                                            <div className="text-xs font-bold opacity-50 uppercase mb-1">Service Address</div>
                                            <div className="text-sm font-medium leading-relaxed">{selectedClient.address || "No address provided"}</div>
                                        </div>
                                    </div>
                                </div>
                                {/* ... Notes/GateCode ... */}
                            </div>

                             {/* Transaction History */}
                             <div className="flex-grow overflow-y-auto border-t border-gray-100 dark:border-white/10 pt-4">
                                <h3 className="font-bold mb-4 flex items-center gap-2 opacity-80">
                                    <History className="w-4 h-4" /> Transaction History
                                </h3>
                                {selectedClient.history.length > 0 ? (
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
                                            {selectedClient.history.slice().reverse().map((tx) => (
                                                <tr key={tx.id} className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-black/5 dark:hover:bg-white/5">
                                                    <td className="py-3 text-sm flex items-center gap-2"><Calendar className="w-3 h-3 opacity-50" />{new Date(tx.date).toLocaleDateString()}</td>
                                                    <td className="py-3 text-xs"><span className={`px-1.5 py-0.5 rounded ${tx.type === 'credit' ? 'bg-orange-100 text-orange-700' : tx.type === 'payment' ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-white/10'}`}>{tx.type || 'sale'}</span></td>
                                                    <td className="py-3 text-sm opacity-80">{tx.summary}</td>
                                                    <td className={`py-3 font-bold text-right ${tx.type === 'payment' ? 'text-green-600' : ''}`}>{tx.type === 'payment' ? '-' : ''}{tx.amount.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : <div className="text-center py-12 opacity-40">No purchase history available.</div>}
                            </div>
                        </Card>
                    </motion.div>
                ) : activeTab === 'suppliers' && selectedSupplier ? (
                     <motion.div key={selectedSupplier.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                         <Card className="h-full flex flex-col">
                             {/* ... Supplier Details (No changes needed logic wise here) ... */}
                             <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                                <h2 className="text-3xl font-display font-bold">{selectedSupplier.name}</h2>
                                {selectedSupplier.category && <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-bold">{selectedSupplier.category}</span>}
                             </div>
                             {/* ... */}
                         </Card>
                     </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex items-center justify-center opacity-30 min-h-[400px]">
                        <div className="text-center">
                            {activeTab === 'clients' ? <Users className="w-16 h-16 mx-auto mb-4" /> : <Truck className="w-16 h-16 mx-auto mb-4" />}
                            <p>Select a {activeTab === 'clients' ? 'client' : 'supplier'} to view details</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
      
      {/* Add/Edit Modal (Existing Code) */}
      <AnimatePresence>
        {isAdding && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4"
                onClick={resetForm}
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 50 }}
                    className="w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-md flex flex-col bg-white dark:bg-gray-900 sm:rounded-2xl shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ... Existing Modal Content ... */}
                    <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-100 dark:border-white/10 z-10 bg-white dark:bg-gray-900">
                        <h3 className={`text-lg font-bold ${styles.accentText}`}>
                            {editId ? 'Edit Profile' : `New ${activeTab === 'clients' ? 'Client' : 'Supplier'}`}
                        </h3>
                        <button onClick={resetForm} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-6 h-6 opacity-60 hover:opacity-100" /></button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                         <div className="space-y-4 pb-20 sm:pb-0">
                            {/* ... Form Fields ... */}
                            <Input label={activeTab === 'clients' ? "Full Name" : "Company Name"} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus />
                            <Input label="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Mobile" />
                            <Input label={activeTab === 'clients' ? "Service Address" : "Warehouse Address"} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                            {/* ... more fields ... */}
                         </div>
                    </div>

                    <div className="flex-shrink-0 p-4 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 pb-safe z-10 flex gap-3">
                        <Button className={`w-full ${activeTab === 'suppliers' ? 'bg-purple-600 hover:bg-purple-700' : ''}`} onClick={handleSave}>Save Profile</Button>
                        <Button variant="secondary" onClick={resetForm}>Cancel</Button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Customers;
