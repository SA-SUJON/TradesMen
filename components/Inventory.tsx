import React, { useState } from 'react';
import { Product, ProductHistoryEvent } from '../types';
import { Card, Input, Button, Select } from './ui/BaseComponents';
import { Package, Search, Plus, Trash2, Edit2, X, Sparkles, Loader2, Calendar, Phone, Tag, Truck, ScanBarcode, MapPin, History, ShoppingBag, Clock, PlusCircle, Receipt, ChevronDown, ChevronUp } from 'lucide-react';
import { getThemeClasses } from '../utils/themeUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAI } from '../contexts/AIContext';
import { speak, formatUnit, UNIT_OPTIONS } from '../utils/appUtils';
import BarcodeScanner from './BarcodeScanner';

interface InventoryProps {
  inventory: Product[];
  setInventory: (inv: Product[]) => void;
}

const Inventory: React.FC<InventoryProps> = ({ inventory, setInventory }) => {
  const { theme, unitSystem, voiceEnabled } = useTheme();
  const styles = getThemeClasses(theme);
  const { filterInventory } = useAI();

  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanningFor, setScanningFor] = useState<'search' | 'add'>('search');
  
  // AI Search State
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [aiFilteredIds, setAiFilteredIds] = useState<string[] | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    buyingPrice: 0,
    sellingPrice: 0,
    stock: 0,
    unit: 'kg',
    category: '',
    supplierName: '',
    supplierContact: '',
    notes: '',
    lowStockThreshold: 10,
    purchaseDate: '',
    barcode: '',
    shelfId: '',
    hsnCode: '',
    gstRate: 0
  });

  const handleSave = () => {
    if (!formData.name || !formData.sellingPrice) return;
    const now = new Date().toISOString();

    if (editId) {
        const oldItem = inventory.find(i => i.id === editId);
        const newHistory: ProductHistoryEvent[] = [...(oldItem?.history || [])];

        // Track History: Price Change
        if (oldItem && formData.sellingPrice !== oldItem.sellingPrice) {
            newHistory.push({
                id: Date.now().toString() + 'p',
                date: now,
                type: 'update',
                description: `Price changed from ${oldItem.sellingPrice} to ${formData.sellingPrice}`
            });
        }
        // Track History: Stock Adjustment (Manual)
        if (oldItem && formData.stock !== oldItem.stock) {
             newHistory.push({
                id: Date.now().toString() + 'st',
                date: now,
                type: 'stock',
                description: `Stock adjusted from ${oldItem.stock} to ${formData.stock}`
            });
        }

        const updatedItem: Product = { 
            ...oldItem, 
            ...formData, 
            history: newHistory 
        } as Product;
        setInventory(inventory.map(item => item.id === editId ? updatedItem : item));
    } else {
        const newItem: Product = {
            id: Date.now().toString(),
            name: formData.name,
            buyingPrice: formData.buyingPrice || 0,
            sellingPrice: formData.sellingPrice,
            stock: formData.stock || 0,
            unit: formData.unit || 'kg',
            category: formData.category,
            supplierName: formData.supplierName,
            supplierContact: formData.supplierContact,
            notes: formData.notes,
            purchaseDate: formData.purchaseDate,
            lowStockThreshold: formData.lowStockThreshold || 10,
            barcode: formData.barcode,
            shelfId: formData.shelfId,
            hsnCode: formData.hsnCode,
            gstRate: formData.gstRate,
            history: [{
                id: Date.now().toString(),
                date: now,
                type: 'create',
                description: 'Added to inventory'
            }]
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
      setFormData({ 
        name: '', buyingPrice: 0, sellingPrice: 0, stock: 0, unit: 'kg', 
        category: '', supplierName: '', supplierContact: '', notes: '', lowStockThreshold: 10, purchaseDate: '', barcode: '', shelfId: '', hsnCode: '', gstRate: 0
      });
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

  const handleScan = (code: string) => {
      if (scanningFor === 'search') {
          setSearch(code); // Put code in search bar
          setAiFilteredIds(null); // Clear AI filter to rely on strict text match
          speak("Barcode scanned", voiceEnabled);
      } else {
          // Scanning for Add/Edit form
          setFormData(prev => ({ ...prev, barcode: code }));
          speak("Barcode added to product", voiceEnabled);
      }
      setShowScanner(false);
  };

  const getEventIcon = (type: string) => {
      switch(type) {
          case 'create': return <PlusCircle className="w-3 h-3 text-green-500" />;
          case 'sale': return <ShoppingBag className="w-3 h-3 text-blue-500" />;
          case 'update': return <Tag className="w-3 h-3 text-orange-500" />;
          case 'stock': return <Package className="w-3 h-3 text-purple-500" />;
          default: return <Clock className="w-3 h-3 text-gray-500" />;
      }
  };

  // Determine which items to show
  let filteredInventory = inventory;
  if (aiFilteredIds) {
      filteredInventory = inventory.filter(p => aiFilteredIds.includes(p.id));
  } else if (search) {
      const q = search.toLowerCase();
      filteredInventory = inventory.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category?.toLowerCase().includes(q) ||
        p.supplierName?.toLowerCase().includes(q) ||
        p.barcode?.includes(q) ||
        p.shelfId?.toLowerCase().includes(q)
      );
  }

  const ProductDetailView = ({ item }: { item: Product }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 bg-gray-50 dark:bg-gray-900/50">
        {/* Left: Standard Details */}
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <div className="opacity-50 text-xs mb-1">SUPPLIER</div>
                    <div className="flex items-center gap-2"><Truck className="w-3 h-3" /> {item.supplierName || 'N/A'}</div>
                    <div className="flex items-center gap-2 mt-1"><Phone className="w-3 h-3" /> {item.supplierContact || 'N/A'}</div>
                </div>
                <div>
                    <div className="opacity-50 text-xs mb-1">META</div>
                    <div className="flex items-center gap-2"><Tag className="w-3 h-3" /> Buy: {item.buyingPrice}</div>
                    <div className="flex items-center gap-2 mt-1"><ScanBarcode className="w-3 h-3" /> {item.barcode || '-'}</div>
                    {item.hsnCode && <div className="flex items-center gap-2 mt-1"><Receipt className="w-3 h-3" /> HSN: {item.hsnCode}</div>}
                </div>
            </div>
            <div>
                <div className="opacity-50 text-xs mb-1">NOTES</div>
                <p className="opacity-80 italic text-sm">{item.notes || 'No notes.'}</p>
            </div>
        </div>

        {/* Right: History Timeline */}
        <div className="border-l border-gray-200 dark:border-white/10 pl-4 md:pl-8">
            <div className="flex items-center gap-2 font-bold mb-4 opacity-80">
                <History className="w-4 h-4" /> Timeline
            </div>
            <div className="space-y-0 relative">
                <div className="absolute left-[5px] top-2 bottom-2 w-[1px] bg-gray-200 dark:bg-white/10"></div>
                {item.history && item.history.length > 0 ? (
                    item.history.slice().reverse().slice(0, 3).map((event) => (
                        <div key={event.id} className="relative pl-6 pb-4 last:pb-0 group">
                            <div className="absolute left-0 top-1 w-[11px] h-[11px] rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 group-hover:border-blue-500 z-10 flex items-center justify-center">
                                <div className="w-1 h-1 rounded-full bg-transparent group-hover:bg-blue-500"></div>
                            </div>
                            <div className="text-[10px] opacity-50 mb-0.5 flex items-center gap-1">
                                {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-xs font-medium flex items-start gap-2">
                                <span className="mt-0.5 opacity-70">{getEventIcon(event.type)}</span>
                                <span className="truncate w-32 md:w-auto">{event.description}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-sm opacity-40 italic pl-4">No history.</div>
                )}
            </div>
        </div>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {showScanner && (
          <BarcodeScanner 
            onScan={handleScan} 
            onClose={() => setShowScanner(false)} 
          />
      )}

      <Card className="!p-4">
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                 <h2 className={`text-lg md:text-xl font-bold flex items-center gap-2 ${styles.accentText}`}>
                    <Package className="w-5 h-5" /> Inventory
                </h2>
                <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm">
                    <Plus className="w-4 h-4" /> Add Item
                </Button>
            </div>
            
            <div className="relative w-full">
                <Input 
                    placeholder="Search items, barcodes..." 
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        if (aiFilteredIds) setAiFilteredIds(null);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAISearch();
                    }}
                    className="pl-10 pr-24 py-3"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50" />
                
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <button 
                        onClick={() => { setScanningFor('search'); setShowScanner(true); }}
                        className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                        title="Scan Barcode"
                    >
                        <ScanBarcode className="w-5 h-5 opacity-70" />
                    </button>
                    {search && (
                        <button 
                            onClick={() => { setSearch(''); setAiFilteredIds(null); }} 
                            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                        >
                            <X className="w-4 h-4 opacity-50" />
                        </button>
                    )}
                    <button 
                        onClick={handleAISearch}
                        disabled={!search.trim() || isSearchingAI}
                        className={`p-2 rounded-lg transition-all ${
                            aiFilteredIds ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-50 text-blue-500'
                        }`}
                    >
                        {isSearchingAI ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>

        {/* AI Filter Status Banner */}
        {aiFilteredIds && (
            <div className="mt-4 p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-sm rounded-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Showing results for: <strong>"{search}"</strong>
                </span>
                <button onClick={() => setAiFilteredIds(null)} className="underline opacity-70 hover:opacity-100">Clear</button>
            </div>
        )}
      </Card>

        {/* Desktop Table View (Hidden on Mobile) */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="opacity-60 text-sm border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                        <th className="p-4">Name</th>
                        <th className="p-4 text-right">Stock</th>
                        <th className="p-4 text-right">Sell Price</th>
                        <th className="p-4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <AnimatePresence>
                        {filteredInventory.length > 0 ? (
                            filteredInventory.map(item => (
                                <React.Fragment key={item.id}>
                                    <motion.tr 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                                        className="border-b border-gray-100 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                                    >
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800 dark:text-white">{item.name}</div>
                                            <div className="flex gap-1 mt-1">
                                                {item.category && <div className="text-xs opacity-60 bg-gray-100 dark:bg-gray-700 inline-block px-1.5 py-0.5 rounded">{item.category}</div>}
                                                {item.shelfId && <div className="text-xs opacity-80 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 inline-block px-1.5 py-0.5 rounded flex items-center gap-0.5"><MapPin className="w-3 h-3" />{item.shelfId}</div>}
                                                {item.gstRate ? <div className="text-xs opacity-80 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 inline-block px-1.5 py-0.5 rounded flex items-center gap-0.5"><Receipt className="w-3 h-3" /> GST {item.gstRate}%</div> : null}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className={`font-mono ${item.stock < (item.lowStockThreshold || 10) ? 'text-orange-600 bg-orange-50 px-2 py-1 rounded inline-block font-bold' : ''}`}>
                                                {formatUnit(item.stock, item.unit, unitSystem)}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right font-bold text-lg">{item.sellingPrice}</td>
                                        <td className="p-4 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                    {expandedRow === item.id && (
                                        <motion.tr 
                                            initial={{ opacity: 0, height: 0 }} 
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <td colSpan={4} className="p-0">
                                                <ProductDetailView item={item} />
                                            </td>
                                        </motion.tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="p-12 text-center opacity-50">
                                    {isSearchingAI ? "Analyzing Inventory..." : "No items found."}
                                </td>
                            </tr>
                        )}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>

        {/* Mobile Card List View */}
        <div className="md:hidden space-y-3 pb-24">
             <AnimatePresence>
                {filteredInventory.length > 0 ? (
                    filteredInventory.map(item => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`${styles.card} p-4 !rounded-2xl relative`}
                            onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1 pr-10">
                                    <div className="font-bold text-lg leading-tight">{item.name}</div>
                                    <div className="text-xs opacity-60 mt-1 flex flex-wrap gap-2">
                                        {item.category && <span className="bg-gray-100 dark:bg-white/10 px-1.5 rounded">{item.category}</span>}
                                        {item.shelfId && <span className="flex items-center gap-0.5 text-blue-600"><MapPin className="w-3 h-3" /> {item.shelfId}</span>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold">{item.sellingPrice}</div>
                                    <div className={`text-xs ${item.stock < (item.lowStockThreshold || 10) ? 'text-orange-500 font-bold' : 'opacity-60'}`}>
                                        Stock: {formatUnit(item.stock, item.unit, unitSystem)}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Actions Bar - Increased touch targets and improved Z-index */}
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/10 flex justify-between items-center relative z-20">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setExpandedRow(expandedRow === item.id ? null : item.id); }}
                                    className="text-xs flex items-center gap-1 opacity-50 p-2 -ml-2"
                                >
                                    {expandedRow === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    Details
                                </button>
                                <div className="flex gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="text-blue-600 p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors">
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="text-red-600 p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Expanded Details */}
                            <AnimatePresence>
                                {expandedRow === item.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden mt-2"
                                    >
                                        <ProductDetailView item={item} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))
                ) : (
                    <div className="p-8 text-center opacity-50">
                        {isSearchingAI ? "Analyzing..." : "No items found."}
                    </div>
                )}
            </AnimatePresence>
        </div>

      {/* Add/Edit Modal Overlay - Full Screen on Mobile */}
      <AnimatePresence>
        {isAdding && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4"
                onClick={resetForm}
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 100 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 100 }}
                    className="w-full h-full sm:h-auto sm:max-w-lg sm:rounded-2xl overflow-hidden bg-white dark:bg-gray-900 flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-100 dark:border-white/10">
                        <h3 className={`text-lg font-bold ${styles.accentText}`}>{editId ? 'Edit Product' : 'Add New Product'}</h3>
                        <button onClick={resetForm} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-6 h-6" /></button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4 pb-24">
                        <div className="space-y-4">
                            {/* Basic Info */}
                            <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg space-y-3">
                                <h4 className="text-xs font-bold opacity-50 uppercase tracking-wide">Product Details</h4>
                                <div className="flex gap-2 items-end">
                                    <div className="flex-grow">
                                        <Input label="Barcode / ID" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} placeholder="Scan or type..." />
                                    </div>
                                    <Button onClick={() => { setScanningFor('add'); setShowScanner(true); }} className="mb-[1px] px-3"><ScanBarcode className="w-5 h-5" /></Button>
                                </div>
                                
                                <Input label="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus />
                                <div className="grid grid-cols-2 gap-4">
                                     <Input label="Category" placeholder="e.g. Grains" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                                     <div className="flex-grow">
                                        <Select 
                                            label="Unit" 
                                            value={formData.unit} 
                                            onChange={e => setFormData({...formData, unit: e.target.value})}
                                        >
                                            {UNIT_OPTIONS.map(u => (
                                                <option key={u.value} value={u.value}>{u.label}</option>
                                            ))}
                                        </Select>
                                     </div>
                                </div>
                                <Input label="Shelf / Rack ID" placeholder="e.g. A-1, B-5" value={formData.shelfId} onChange={e => setFormData({...formData, shelfId: e.target.value})} />
                            </div>

                            {/* GST & Taxation */}
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg space-y-3">
                                <h4 className="text-xs font-bold opacity-70 text-blue-800 dark:text-blue-300 uppercase tracking-wide flex items-center gap-2"><Receipt className="w-3 h-3" /> Taxation (GST)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                     <Input label="HSN Code" placeholder="e.g. 1006" value={formData.hsnCode} onChange={e => setFormData({...formData, hsnCode: e.target.value})} />
                                     <Select label="GST Rate (%)" value={formData.gstRate} onChange={e => setFormData({...formData, gstRate: Number(e.target.value)})}>
                                         <option value="0">0% (Exempt)</option>
                                         <option value="5">5%</option>
                                         <option value="12">12%</option>
                                         <option value="18">18%</option>
                                         <option value="28">28%</option>
                                     </Select>
                                </div>
                            </div>

                            {/* Pricing & Stock */}
                            <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg space-y-3">
                                <h4 className="text-xs font-bold opacity-50 uppercase tracking-wide">Pricing & Stock</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Selling Price" type="number" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.valueAsNumber})} />
                                    <Input label="Buying Price" type="number" value={formData.buyingPrice} onChange={e => setFormData({...formData, buyingPrice: e.target.valueAsNumber})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Current Stock" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.valueAsNumber})} />
                                    <Input label="Low Stock Alert Level" type="number" value={formData.lowStockThreshold} onChange={e => setFormData({...formData, lowStockThreshold: e.target.valueAsNumber})} />
                                </div>
                            </div>

                            {/* Supplier Info */}
                            <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg space-y-3">
                                <h4 className="text-xs font-bold opacity-50 uppercase tracking-wide">Supplier Details</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <Input label="Supplier Name" value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Supplier Contact" value={formData.supplierContact} onChange={e => setFormData({...formData, supplierContact: e.target.value})} />
                                        <Input label="Purchase Date" type="date" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} />
                                    </div>
                                </div>
                                <Input label="Notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Additional info..." />
                            </div>
                        </div>
                    </div>
                    
                    {/* Fixed Bottom Action Bar for Mobile Modal */}
                    <div className="p-4 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 pb-safe">
                        <Button className="w-full text-lg py-3" onClick={handleSave}>Save Item</Button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;