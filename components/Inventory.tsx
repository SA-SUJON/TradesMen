import React, { useState } from 'react';
import { Product } from '../types';
import { Card, Input, Button } from './ui/BaseComponents';
import { Package, Search, Plus, Trash2, Edit2, X, Sparkles, Loader2 } from 'lucide-react';
import { getThemeClasses } from '../utils/themeUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAI } from '../contexts/AIContext';

interface InventoryProps {
  inventory: Product[];
  setInventory: (inv: Product[]) => void;
}

const Inventory: React.FC<InventoryProps> = ({ inventory, setInventory }) => {
  const { theme } = useTheme();
  const styles = getThemeClasses(theme);
  const { filterInventory } = useAI();

  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // AI Search State
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [aiFilteredIds, setAiFilteredIds] = useState<string[] | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    buyingPrice: 0,
    sellingPrice: 0,
    stock: 0,
    unit: 'kg'
  });

  const handleSave = () => {
    if (!formData.name || !formData.sellingPrice) return;

    if (editId) {
        setInventory(inventory.map(item => item.id === editId ? { ...item, ...formData } as Product : item));
    } else {
        const newItem: Product = {
            id: Date.now().toString(),
            name: formData.name,
            buyingPrice: formData.buyingPrice || 0,
            sellingPrice: formData.sellingPrice,
            stock: formData.stock || 0,
            unit: formData.unit || 'kg'
        };
        setInventory([...inventory, newItem]);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if(window.confirm("Are you sure?")) {
        setInventory(inventory.filter(i => i.id !== id));
    }
  };

  const handleEdit = (product: Product) => {
      setFormData(product);
      setEditId(product.id);
      setIsAdding(true);
  };

  const resetForm = () => {
      setFormData({ name: '', buyingPrice: 0, sellingPrice: 0, stock: 0, unit: 'kg' });
      setIsAdding(false);
      setEditId(null);
  }

  // AI Search Handler
  const handleAISearch = async () => {
    if (!search.trim()) return;
    setIsSearchingAI(true);
    try {
        const ids = await filterInventory(search, inventory);
        setAiFilteredIds(ids);
    } catch (e) {
        console.error(e);
    } finally {
        setIsSearchingAI(false);
    }
  };

  // Determine which items to show
  let filteredInventory = inventory;
  if (aiFilteredIds) {
      filteredInventory = inventory.filter(p => aiFilteredIds.includes(p.id));
  } else if (search) {
      filteredInventory = inventory.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <h2 className={`text-xl font-bold flex items-center gap-2 ${styles.accentText}`}>
                <Package className="w-5 h-5" /> Inventory Management
            </h2>
            <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-grow md:w-64">
                    <Input 
                        placeholder="Search or ask AI..." 
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            // If user types, reset AI filter to allow normal search
                            if (aiFilteredIds) setAiFilteredIds(null);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAISearch();
                        }}
                        className="pl-10 pr-20"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-[20%] w-4 h-4 opacity-50" />
                    
                    {/* Search Actions */}
                    <div className="absolute right-2 top-1/2 transform -translate-y-[20%] flex items-center gap-1">
                        {search && (
                            <button 
                                onClick={() => { setSearch(''); setAiFilteredIds(null); }} 
                                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                            >
                                <X className="w-3 h-3 opacity-50" />
                            </button>
                        )}
                        <button 
                            onClick={handleAISearch}
                            disabled={!search.trim() || isSearchingAI}
                            className={`p-1.5 rounded-lg transition-all ${
                                aiFilteredIds ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-50 text-blue-500'
                            }`}
                            title="AI Smart Search"
                        >
                            {isSearchingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
                <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2 whitespace-nowrap">
                    <Plus className="w-4 h-4" /> Add Item
                </Button>
            </div>
        </div>

        {/* AI Filter Status Banner */}
        {aiFilteredIds && (
            <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-sm rounded-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Showing results for: <strong>"{search}"</strong>
                </span>
                <button onClick={() => setAiFilteredIds(null)} className="underline opacity-70 hover:opacity-100">Clear Filter</button>
            </div>
        )}

        {/* Product List */}
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="opacity-60 text-sm border-b border-gray-200 dark:border-white/10">
                        <th className="p-3">Name</th>
                        <th className="p-3 text-right">Stock</th>
                        <th className="p-3 text-right">Buy Price</th>
                        <th className="p-3 text-right">Sell Price</th>
                        <th className="p-3 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <AnimatePresence>
                        {filteredInventory.length > 0 ? (
                            filteredInventory.map(item => (
                                <motion.tr 
                                    key={item.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="border-b border-gray-100 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                >
                                    <td className="p-3 font-medium">{item.name}</td>
                                    <td className="p-3 text-right">{item.stock} {item.unit}</td>
                                    <td className="p-3 text-right opacity-70">{item.buyingPrice}</td>
                                    <td className="p-3 text-right font-bold">{item.sellingPrice}</td>
                                    <td className="p-3 flex justify-center gap-2">
                                        <button onClick={() => handleEdit(item)} className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center opacity-50">
                                    {isSearchingAI ? "Thinking..." : "No items found."}
                                </td>
                            </tr>
                        )}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>
      </Card>

      {/* Add/Edit Modal Overlay */}
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
                    className="w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={`text-lg font-bold ${styles.accentText}`}>{editId ? 'Edit Product' : 'Add New Product'}</h3>
                            <button onClick={resetForm}><X className="w-6 h-6 opacity-60 hover:opacity-100" /></button>
                        </div>
                        <div className="space-y-4">
                            <Input label="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Selling Price / Unit" type="number" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.valueAsNumber})} />
                                <Input label="Buying Price / Unit" type="number" value={formData.buyingPrice} onChange={e => setFormData({...formData, buyingPrice: e.target.valueAsNumber})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Initial Stock" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.valueAsNumber})} />
                                <Input label="Unit (kg/g/pc)" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <Button className="w-full" onClick={handleSave}>Save Item</Button>
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

export default Inventory;
