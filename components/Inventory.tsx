
import React, { useState, useMemo } from 'react';
import { Product, ProductHistoryEvent } from '../types';
import { Card, Input, Button, Select } from './ui/BaseComponents';
import { Package, Search, Plus, Trash2, Edit2, X, Sparkles, Loader2, Calendar, Phone, Tag, Truck, ScanBarcode, MapPin, History, ShoppingBag, Clock, PlusCircle, Receipt, ChevronDown, ChevronUp, ArrowUp, ArrowDown, ArrowUpDown, Star, Palette, Smile, Copy } from 'lucide-react';
import { getThemeClasses } from '../utils/themeUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAI } from '../contexts/AIContext';
import { speak, formatUnit, UNIT_OPTIONS } from '../utils/appUtils';
import BarcodeScanner from './BarcodeScanner';

interface InventoryProps {
  inventory: Product[];
  setInventory: (inv: Product[] | ((val: Product[]) => Product[])) => void;
}

// Visual POS Constants
const POS_COLORS = [
    { id: 'red', bg: 'bg-red-200' },
    { id: 'orange', bg: 'bg-orange-200' },
    { id: 'amber', bg: 'bg-amber-200' },
    { id: 'yellow', bg: 'bg-yellow-200' },
    { id: 'lime', bg: 'bg-lime-200' },
    { id: 'green', bg: 'bg-green-200' },
    { id: 'emerald', bg: 'bg-emerald-200' },
    { id: 'teal', bg: 'bg-teal-200' },
    { id: 'cyan', bg: 'bg-cyan-200' },
    { id: 'sky', bg: 'bg-sky-200' },
    { id: 'blue', bg: 'bg-blue-200' },
    { id: 'indigo', bg: 'bg-indigo-200' },
    { id: 'violet', bg: 'bg-violet-200' },
    { id: 'purple', bg: 'bg-purple-200' },
    { id: 'fuchsia', bg: 'bg-fuchsia-200' },
    { id: 'pink', bg: 'bg-pink-200' },
    { id: 'rose', bg: 'bg-rose-200' },
    { id: 'slate', bg: 'bg-slate-200' },
    { id: 'gray', bg: 'bg-gray-200' },
    { id: 'stone', bg: 'bg-stone-200' },
];

const SUGGESTED_EMOJIS = ['🍎', '🍌', '🥛', '🍞', '🥚', '🧀', '🥩', '🍗', '🍟', '🍕', '🥤', '🍺', '🧼', '🧻', '💊', '🔋', '🎁', '🖊️'];

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
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'stock' | 'sellingPrice'; direction: 'asc' | 'desc' }>({ 
      key: 'name', 
      direction: 'asc' 
  });
  
  // AI Search State
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [aiFilteredIds, setAiFilteredIds] = useState<string[] | null>(null);
  
  // Modal Tab State
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'price' | 'meta'>('basic');

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
    gstRate: 0,
    isFavorite: false,
    color: 'bg-gray-200',
    emoji: ''
  });

  const handleSave = () => {
    if (!formData.name || !formData.sellingPrice) return;
    const now = new Date().toISOString();

    if (editId) {
        setInventory(prev => {
            const oldItem = prev.find(i => i.id === editId);
            if (!oldItem) return prev;

            const newHistory: ProductHistoryEvent[] = [...(oldItem.history || [])];

            // Track History: Price Change
            if (formData.sellingPrice !== oldItem.sellingPrice) {
                newHistory.push({
                    id: Date.now().toString() + 'p',
                    date: now,
                    type: 'update',
                    description: `Price changed from ${oldItem.sellingPrice} to ${formData.sellingPrice}`
                });
            }
            // Track History: Stock Adjustment (Manual)
            if (formData.stock !== oldItem.stock) {
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
            
            return prev.map(item => item.id === editId ? updatedItem : item);
        });
    } else {
        const newItem: Product = {
            id: Date.now().toString(),
            name: formData.name || '',
            buyingPrice: formData.buyingPrice || 0,
            sellingPrice: formData.sellingPrice || 0,
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
            isFavorite: formData.isFavorite || false,
            color: formData.color || 'bg-gray-200',
            emoji: formData.emoji || '',
            history: [{
                id: Date.now().toString(),
                date: now,
                type: 'create',
                description: 'Added to inventory'
            }]
        };
        setInventory(prev => [...prev, newItem]);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    // We use a small timeout to ensure the UI event clears before confirm blocking
    setTimeout(() => {
        if(window.confirm("Are you sure you want to delete this item?")) {
            setInventory(prev => prev.filter(i => i.id !== id));
        }
    }, 50);
  };

  const handleEdit = (product: Product) => {
      setFormData(product);
      setEditId(product.id);
      setActiveFormTab('basic');
      setIsAdding(true);
  };

  const handleDuplicate = (product: Product) => {
      setFormData({
          ...product,
          name: `${product.name} (Copy)`,
          id: undefined, // ensure new ID on save
          barcode: '' // clear unique identifier
      });
      setEditId(null); // Add mode
      setActiveFormTab('basic');
      setIsAdding(true);
  };

  const resetForm = () => {
      setFormData({ 
        name: '', buyingPrice: 0, sellingPrice: 0, stock: 0, unit: 'kg', 
        category: '', supplierName: '', supplierContact: '', notes: '', lowStockThreshold: 10, purchaseDate: '', barcode: '', shelfId: '', hsnCode: '', gstRate: 0, isFavorite: false, color: 'bg-gray-200', emoji: ''
      });
      setIsAdding(false);
      setEditId(null);
      setActiveFormTab('basic');
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

  // Sorting Handler
  const handleSort = (key: 'name' | 'stock' | 'sellingPrice') => {
      setSortConfig(current => ({
          key,
          direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
      }));
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

  // Determine which items to show and sort them
  const processedInventory = useMemo(() => {
      let data = inventory;

      // 1. Filter
      if (aiFilteredIds) {
          data = inventory.filter(p => aiFilteredIds.includes(p.id));
      } else if (search) {
          const q = search.toLowerCase();
          data = inventory.filter(p => 
            p.name.toLowerCase().includes(q) || 
            p.category?.toLowerCase().includes(q) ||
            p.supplierName?.toLowerCase().includes(q) ||
            p.barcode?.includes(q) ||
            p.shelfId?.toLowerCase().includes(q)
          );
      }

      // 2. Sort
      return [...data].sort((a, b) => {
          const aValue = a[sortConfig.key];
          const bValue = b[sortConfig.key];
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
              return sortConfig.direction === 'asc' 
                ? aValue.localeCompare(bValue) 
                : bValue.localeCompare(aValue);
          }
          
          // Numeric sort
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
      });
  }, [inventory, aiFilteredIds, search, sortConfig]);

  const ProductDetailView = ({ item }: { item: Product }) => (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 p-4 ${theme === 'neumorphism' ? 'bg-black/5 dark:bg-white/5' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
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
    <div className="space-y-4 md:space-y-6 pb-24">
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
            {/* ... Sort controls kept same ... */}
        </div>
      </Card>

      {/* Desktop Table View */}
      <Card className="hidden md:block !p-0 overflow-hidden">
            <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className={`opacity-60 text-sm border-b ${theme === 'neumorphism' ? 'bg-[#E0E5EC] dark:bg-[#292d3e] border-gray-300 dark:border-gray-700' : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10'}`}>
                            <th className="p-4 cursor-pointer" onClick={() => handleSort('name')}>Name</th>
                            <th className="p-4 text-right cursor-pointer" onClick={() => handleSort('stock')}>Stock</th>
                            <th className="p-4 text-right cursor-pointer" onClick={() => handleSort('sellingPrice')}>Price</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {processedInventory.length > 0 ? (
                                processedInventory.map(item => (
                                    <React.Fragment key={item.id}>
                                        <motion.tr 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                                            className={`border-b hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group relative ${theme === 'neumorphism' ? 'border-gray-300 dark:border-gray-700' : 'border-gray-100 dark:border-white/5'}`}
                                        >
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                                    {item.isFavorite && <Star className="w-3 h-3 text-orange-400 fill-orange-400" />}
                                                    {item.emoji && <span className="text-xl">{item.emoji}</span>}
                                                    {item.name}
                                                </div>
                                                <div className="flex gap-1 mt-1">
                                                    {item.category && <div className="text-xs opacity-60 bg-gray-100 dark:bg-white/10 inline-block px-1.5 py-0.5 rounded">{item.category}</div>}
                                                    {item.shelfId && <div className="text-xs opacity-80 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 inline-block px-1.5 py-0.5 rounded flex items-center gap-0.5"><MapPin className="w-3 h-3" />{item.shelfId}</div>}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className={`font-mono ${item.stock < (item.lowStockThreshold || 10) ? 'text-orange-600 bg-orange-50 px-2 py-1 rounded inline-block font-bold' : ''}`}>
                                                    {formatUnit(item.stock, item.unit, unitSystem)}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right font-bold text-lg">{item.sellingPrice}</td>
                                            <td className="p-4 flex justify-center gap-2 relative z-20" onClick={(e) => e.stopPropagation()}>
                                                <button 
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleDuplicate(item); }} 
                                                    className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 transition-colors"
                                                    title="Duplicate"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(item); }} 
                                                    className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"
                                                    title="Edit Item"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} 
                                                    className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                                                    title="Delete Item"
                                                >
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
      </Card>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
             <AnimatePresence>
                {processedInventory.length > 0 ? (
                    processedInventory.map(item => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`${styles.card} p-4 !rounded-2xl relative overflow-hidden`}
                            onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                        >
                            {item.color && (
                                <div className={`absolute top-0 bottom-0 left-0 w-1 ${item.color.replace('bg-', 'bg-').replace('200', '500')}`} />
                            )}

                            <div className="flex justify-between items-start pl-2">
                                <div className="flex-1 pr-10">
                                    <div className="font-bold text-lg leading-tight flex items-center gap-2">
                                        {item.isFavorite && <Star className="w-3 h-3 text-orange-400 fill-orange-400" />}
                                        {item.emoji && <span>{item.emoji}</span>}
                                        {item.name}
                                    </div>
                                    <div className="text-xs opacity-60 mt-1 flex flex-wrap gap-2">
                                        {item.category && <span className="bg-gray-100 dark:bg-white/10 px-1.5 rounded">{item.category}</span>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold">{item.sellingPrice}</div>
                                    <div className={`text-xs ${item.stock < (item.lowStockThreshold || 10) ? 'text-orange-500 font-bold' : 'opacity-60'}`}>
                                        Stock: {formatUnit(item.stock, item.unit, unitSystem)}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Actions Bar */}
                            <div 
                                className="mt-3 pt-3 border-t border-gray-100 dark:border-white/10 flex justify-between items-center relative z-30"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button 
                                    type="button"
                                    onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                                    className="text-xs flex items-center gap-1 opacity-50 p-2 -ml-2"
                                >
                                    {expandedRow === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    Details
                                </button>
                                <div className="flex gap-2">
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleDuplicate(item); }}
                                        className="text-green-600 p-3 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                                        className="text-blue-600 p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                        className="text-red-600 p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            {/* Expanded details ... */}
                             <AnimatePresence>
                                {expandedRow === item.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden mt-2 relative z-10"
                                        onClick={(e) => e.stopPropagation()}
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

      {/* Add/Edit Modal Overlay - Tabbed Interface */}
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
                    className="w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl overflow-hidden bg-white dark:bg-gray-900 flex flex-col shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 z-10">
                        <h3 className={`text-lg font-bold ${styles.accentText}`}>{editId ? 'Edit Product' : 'Add New Product'}</h3>
                        <button onClick={resetForm} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-6 h-6" /></button>
                    </div>

                    {/* Form Tabs */}
                    <div className="flex p-2 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                        <button onClick={() => setActiveFormTab('basic')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeFormTab === 'basic' ? 'bg-white shadow text-blue-600' : 'opacity-50'}`}>Basic</button>
                        <button onClick={() => setActiveFormTab('price')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeFormTab === 'price' ? 'bg-white shadow text-green-600' : 'opacity-50'}`}>Pricing</button>
                        <button onClick={() => setActiveFormTab('meta')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeFormTab === 'meta' ? 'bg-white shadow text-purple-600' : 'opacity-50'}`}>Advanced</button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                        <div className="space-y-4 pb-20 sm:pb-0">
                            
                            {activeFormTab === 'basic' && (
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
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

                                    {/* Visual POS Settings inside Basic for Accessibility */}
                                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg space-y-3 mt-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Palette className="w-4 h-4 opacity-50" />
                                            <span className="text-xs font-bold opacity-70 uppercase">POS Appearance</span>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                            <div className="flex-grow">
                                                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                                    {POS_COLORS.map(c => (
                                                        <button key={c.id} type="button" onClick={() => setFormData({...formData, color: c.bg})} className={`w-8 h-8 rounded-full ${c.bg} border-2 flex-shrink-0 ${formData.color === c.bg ? 'border-black dark:border-white scale-110' : 'border-transparent'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <input className="w-12 text-center text-xl bg-transparent border-b" value={formData.emoji} onChange={e => setFormData({...formData, emoji: e.target.value})} placeholder="📦" />
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer pt-2">
                                            <input type="checkbox" checked={formData.isFavorite || false} onChange={e => setFormData({...formData, isFavorite: e.target.checked})} className="w-4 h-4 rounded text-blue-600" />
                                            <span className="text-sm font-medium">Add to Quick Grid</span>
                                        </label>
                                    </div>
                                </motion.div>
                            )}

                            {activeFormTab === 'price' && (
                                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                     <div className="grid grid-cols-2 gap-4">
                                        <Input label="Selling Price" type="number" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.valueAsNumber})} className="font-bold" />
                                        <Input label="Buying Price" type="number" value={formData.buyingPrice} onChange={e => setFormData({...formData, buyingPrice: e.target.valueAsNumber})} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Current Stock" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.valueAsNumber})} />
                                        <Input label="Low Stock Alert" type="number" value={formData.lowStockThreshold} onChange={e => setFormData({...formData, lowStockThreshold: e.target.valueAsNumber})} />
                                    </div>
                                    
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg space-y-3 mt-4">
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
                                </motion.div>
                            )}

                            {activeFormTab === 'meta' && (
                                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                    <Input label="Supplier Name" value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Supplier Contact" value={formData.supplierContact} onChange={e => setFormData({...formData, supplierContact: e.target.value})} />
                                        <Input label="Purchase Date" type="date" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} />
                                    </div>
                                    <Input label="Shelf / Rack ID" placeholder="e.g. A-1" value={formData.shelfId} onChange={e => setFormData({...formData, shelfId: e.target.value})} />
                                    <Input label="Notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Additional info..." />
                                </motion.div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex-shrink-0 p-4 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 pb-safe z-10 flex gap-2">
                         {activeFormTab !== 'basic' && (
                             <Button variant="secondary" onClick={() => setActiveFormTab(activeFormTab === 'meta' ? 'price' : 'basic')}>Back</Button>
                         )}
                         {activeFormTab === 'meta' || activeFormTab === 'price' ? (
                              <Button className="w-full text-lg py-3" onClick={handleSave}>Save Item</Button>
                         ) : (
                              <Button className="w-full text-lg py-3" onClick={() => setActiveFormTab('price')}>Next</Button>
                         )}
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;
