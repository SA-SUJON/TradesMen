
import React, { useState, useMemo } from 'react';
import { Product, ProductHistoryEvent } from '../types';
import { Card, Input, Button, Select, Toggle } from './ui/BaseComponents';
import { Package, Search, Plus, Trash2, Edit2, X, Sparkles, Loader2, Calendar, Phone, Tag, Truck, ScanBarcode, MapPin, History, ShoppingBag, Clock, PlusCircle, Receipt, ChevronDown, ChevronUp, ArrowUp, ArrowDown, ArrowUpDown, Star, Palette, Smile, Copy, CheckCircle2, AlertTriangle, Camera, UploadCloud, FileImage, Download } from 'lucide-react';
import { getThemeClasses } from '../utils/themeUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAI } from '../contexts/AIContext';
import { speak, formatUnit, UNIT_OPTIONS, openWhatsApp } from '../utils/appUtils';
import BarcodeScanner from './BarcodeScanner';
import { GoogleGenAI } from '@google/genai';

interface InventoryProps {
  inventory: Product[];
  setInventory: (inv: Product[] | ((val: Product[]) => Product[])) => void;
  userRole?: 'admin' | 'staff'; // Added Role Prop
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

const Inventory: React.FC<InventoryProps> = ({ inventory, setInventory, userRole = 'admin' }) => {
  const { theme, unitSystem, voiceEnabled, currencySymbol } = useTheme();
  const styles = getThemeClasses(theme);
  const { filterInventory, apiKey, aiModel } = useAI();

  const [activeTab, setActiveTab] = useState<'items' | 'restock'>('items');
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanningFor, setScanningFor] = useState<'search' | 'add'>('search');
  
  // Catalog Modal
  const [showCatalog, setShowCatalog] = useState(false);

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'stock' | 'sellingPrice'; direction: 'asc' | 'desc' }>({ 
      key: 'name', 
      direction: 'asc' 
  });
  
  // AI Search & Audit State
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [aiFilteredIds, setAiFilteredIds] = useState<string[] | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResults, setAuditResults] = useState<{name: string, count: number, systemStock: number, id: string}[] | null>(null);
  
  // Modal Tab State
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'price' | 'meta'>('basic');

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', buyingPrice: 0, sellingPrice: 0, stock: 0, unit: 'kg', 
    category: '', supplierName: '', supplierContact: '', notes: '', lowStockThreshold: 10, purchaseDate: '', barcode: '', shelfId: '', hsnCode: '', gstRate: 0, isFavorite: false, color: 'bg-gray-200', emoji: ''
  });

  // --- CRUD Operations ---
  const handleSave = () => {
    if (!formData.name || !formData.sellingPrice) return;
    const now = new Date().toISOString();

    if (editId) {
        setInventory(prev => {
            const oldItem = prev.find(i => i.id === editId);
            if (!oldItem) return prev;

            const newHistory: ProductHistoryEvent[] = [...(oldItem.history || [])];
            if (formData.sellingPrice !== oldItem.sellingPrice) {
                newHistory.push({ id: Date.now() + 'p', date: now, type: 'update', description: `Price: ${oldItem.sellingPrice} -> ${formData.sellingPrice}` });
            }
            if (formData.stock !== oldItem.stock) {
                 newHistory.push({ id: Date.now() + 'st', date: now, type: 'stock', description: `Stock Manual: ${oldItem.stock} -> ${formData.stock}` });
            }

            return prev.map(item => item.id === editId ? { ...oldItem, ...formData, history: newHistory } as Product : item);
        });
    } else {
        const newItem: Product = {
            ...formData,
            id: Date.now().toString(),
            name: formData.name || '',
            stock: formData.stock || 0,
            sellingPrice: formData.sellingPrice || 0,
            buyingPrice: formData.buyingPrice || 0,
            unit: formData.unit || 'kg',
            history: [{ id: Date.now().toString(), date: now, type: 'create', description: 'Added to inventory' }]
        } as Product;
        setInventory(prev => [...prev, newItem]);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (userRole === 'staff') return; // Guard
    setTimeout(() => {
        if(window.confirm("Delete this item?")) {
            setInventory(prev => prev.filter(i => i.id !== id));
        }
    }, 50);
  };

  const handleEdit = (product: Product) => {
      if (userRole === 'staff') return; // Guard
      setFormData(product);
      setEditId(product.id);
      setActiveFormTab('basic');
      setIsAdding(true);
  };

  const handleDuplicate = (product: Product) => {
      setFormData({ ...product, name: `${product.name} (Copy)`, id: undefined, barcode: '' });
      setEditId(null);
      setActiveFormTab('basic');
      setIsAdding(true);
  };

  const resetForm = () => {
      setFormData({ name: '', buyingPrice: 0, sellingPrice: 0, stock: 0, unit: 'kg', category: '', supplierName: '', supplierContact: '', notes: '', lowStockThreshold: 10, purchaseDate: '', barcode: '', shelfId: '', hsnCode: '', gstRate: 0, isFavorite: false, color: 'bg-gray-200', emoji: '' });
      setIsAdding(false);
      setEditId(null);
      setActiveFormTab('basic');
  }

  // --- Features Logic ---

  // 1. Restock Features
  const restockItems = useMemo(() => {
      return inventory.filter(p => p.stock <= (p.lowStockThreshold || 10));
  }, [inventory]);

  const handleOrder = (id: string, qty: number) => {
      setInventory(prev => prev.map(p => p.id === id ? { ...p, onOrder: qty } : p));
  };

  const handleReceive = (id: string) => {
      setInventory(prev => prev.map(p => {
          if (p.id === id && p.onOrder) {
              const newHistory = [...(p.history || []), {
                  id: Date.now().toString(),
                  date: new Date().toISOString(),
                  type: 'stock',
                  description: `Received Stock: +${p.onOrder}`
              } as ProductHistoryEvent];
              return { ...p, stock: p.stock + p.onOrder, onOrder: 0, history: newHistory };
          }
          return p;
      }));
  };

  const generateOrderList = () => {
      const itemsToOrder = restockItems.map(p => {
          const orderQty = p.onOrder || ((p.lowStockThreshold || 10) * 2 - p.stock); // Auto suggest double threshold
          return `${p.name}: ${Math.max(orderQty, 1)} ${p.unit}`;
      }).join('\n');
      
      const msg = `🛒 *PURCHASE ORDER*\n\n${itemsToOrder}\n\nPlease confirm availability.`;
      // In a real app, you'd select a supplier. Here we just open WA generally or copy.
      if (navigator.share) {
          navigator.share({ text: msg }).catch(() => openWhatsApp('', msg));
      } else {
          openWhatsApp('', msg);
      }
  };

  // 2. AI Shelf Audit
  const handleAuditUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!apiKey) {
          alert("Please configure API Key in Settings > Manager first.");
          return;
      }

      setIsAuditing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          try {
              const client = new GoogleGenAI({ apiKey });
              // Prompt specifically for JSON array
              const response = await client.models.generateContent({
                  model: aiModel,
                  contents: [
                      {
                          inlineData: { mimeType: file.type, data: base64Data }
                      },
                      {
                          text: `Identify retail items in this image. Count them. 
                          Return a JSON array of objects with keys: "name" (generic product name) and "count" (number). 
                          Do not wrap in markdown code blocks. Just raw JSON.`
                      }
                  ]
              });
              
              const text = response.response.text();
              const jsonStr = text.replace(/```json|```/g, '').trim();
              const detectedItems: {name: string, count: number}[] = JSON.parse(jsonStr);

              // Match with system inventory
              const results = detectedItems.map(d => {
                  // Simple fuzzy match
                  const match = inventory.find(p => p.name.toLowerCase().includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(p.name.toLowerCase()));
                  return {
                      name: d.name,
                      count: d.count,
                      systemStock: match ? match.stock : 0,
                      id: match ? match.id : ''
                  };
              });
              setAuditResults(results);

          } catch (err) {
              console.error(err);
              alert("Failed to analyze image. Try again.");
          } finally {
              setIsAuditing(false);
          }
      };
      reader.readAsDataURL(file);
  };

  const applyAudit = (item: {id: string, count: number}) => {
      if (!item.id) return;
      setInventory(prev => prev.map(p => {
          if (p.id === item.id) {
               const newHistory = [...(p.history || []), {
                  id: Date.now().toString(),
                  date: new Date().toISOString(),
                  type: 'stock',
                  description: `AI Audit Correction: ${p.stock} -> ${item.count}`
              } as ProductHistoryEvent];
              return { ...p, stock: item.count, history: newHistory };
          }
          return p;
      }));
      setAuditResults(prev => prev ? prev.filter(r => r.id !== item.id) : null);
  };

  // --- Common Handlers ---
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
          setSearch(code); 
          setAiFilteredIds(null); 
          speak("Barcode scanned", voiceEnabled);
      } else {
          setFormData(prev => ({ ...prev, barcode: code }));
          speak("Barcode added", voiceEnabled);
      }
      setShowScanner(false);
  };

  // Determine items to show
  const processedInventory = useMemo(() => {
      let data = inventory;
      if (activeTab === 'restock') data = restockItems;
      else if (aiFilteredIds) data = inventory.filter(p => aiFilteredIds.includes(p.id));
      else if (search) {
          const q = search.toLowerCase();
          data = inventory.filter(p => p.name.toLowerCase().includes(q) || p.barcode?.includes(q));
      }

      return [...data].sort((a, b) => {
          const aValue = a[sortConfig.key];
          const bValue = b[sortConfig.key];
          if (typeof aValue === 'string' && typeof bValue === 'string') {
              return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
          }
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
      });
  }, [inventory, aiFilteredIds, search, sortConfig, activeTab, restockItems]);

  const ProductDetailView = ({ item }: { item: Product }) => (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 p-4 ${theme === 'neumorphism' ? 'bg-black/5 dark:bg-white/5' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <div className="opacity-50 text-xs mb-1">SUPPLIER</div>
                    <div className="flex items-center gap-2"><Truck className="w-3 h-3" /> {item.supplierName || 'N/A'}</div>
                </div>
                <div>
                    <div className="opacity-50 text-xs mb-1">META</div>
                    {/* Hide Buying Price for Staff */}
                    {userRole === 'admin' && (
                        <div className="flex items-center gap-2"><Tag className="w-3 h-3" /> Buy: {currencySymbol}{item.buyingPrice}</div>
                    )}
                    <div className="flex items-center gap-2 mt-1"><ScanBarcode className="w-3 h-3" /> {item.barcode || '-'}</div>
                </div>
            </div>
            <div>
                <div className="opacity-50 text-xs mb-1">NOTES</div>
                <p className="opacity-80 italic text-sm">{item.notes || 'No notes.'}</p>
            </div>
        </div>
        <div className="border-l border-gray-200 dark:border-white/10 pl-4 md:pl-8">
            <div className="flex items-center gap-2 font-bold mb-4 opacity-80">
                <History className="w-4 h-4" /> Timeline
            </div>
            <div className="space-y-0 relative">
                <div className="absolute left-[5px] top-2 bottom-2 w-[1px] bg-gray-200 dark:bg-white/10"></div>
                {item.history && item.history.length > 0 ? (
                    item.history.slice().reverse().slice(0, 3).map((event) => (
                        <div key={event.id} className="relative pl-6 pb-4 last:pb-0 group">
                            <div className="absolute left-0 top-1 w-[11px] h-[11px] rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 group-hover:border-blue-500 z-10"></div>
                            <div className="text-[10px] opacity-50 mb-0.5">{new Date(event.date).toLocaleDateString()}</div>
                            <div className="text-xs font-medium">{event.description}</div>
                        </div>
                    ))
                ) : <div className="text-sm opacity-40 italic pl-4">No history.</div>}
            </div>
        </div>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6 pb-24">
      {showScanner && <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}

      <Card className="!p-4">
        {/* Optimized Header Layout for Mobile */}
        <div className="flex flex-col gap-4">
            
            {/* Top Row: Segmented Tab Control */}
            <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                 <button 
                    onClick={() => setActiveTab('items')} 
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'items' ? 'bg-white text-blue-600 shadow dark:bg-gray-800 dark:text-blue-400' : 'opacity-60'}`}
                 >
                     <Package className="w-4 h-4" /> Items
                 </button>
                 <button 
                    onClick={() => setActiveTab('restock')} 
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'restock' ? 'bg-white text-orange-600 shadow dark:bg-gray-800 dark:text-orange-400' : 'opacity-60'}`}
                 >
                     <Truck className="w-4 h-4" /> Restock
                     {restockItems.length > 0 && <span className="bg-orange-100 text-orange-700 px-1.5 rounded-full text-[10px] ml-1">{restockItems.length}</span>}
                 </button>
            </div>

            {/* Middle Row: Action Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                 {/* Catalog */}
                 <Button onClick={() => setShowCatalog(true)} variant="secondary" className="text-xs h-9 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100">
                     <FileImage className="w-3.5 h-3.5" /> Catalog
                 </Button>

                 {/* AI Audit */}
                 {userRole === 'admin' && (
                     <label className="flex items-center justify-center gap-2 h-9 px-3 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-purple-100 transition-colors border border-purple-100 dark:border-purple-900/50">
                         <input type="file" accept="image/*" className="hidden" onChange={handleAuditUpload} />
                         {isAuditing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                         <span>Audit</span>
                     </label>
                 )}

                 {/* Add Item (Primary) - Spans 2 cols on mobile if odd count, else fits grid */}
                 <Button onClick={() => setIsAdding(true)} className="col-span-2 md:col-span-1 h-9 text-xs flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Add Item
                </Button>
            </div>
            
            {/* Bottom Row: Search */}
            <div className="w-full">
                <Input 
                    wrapperClassName="!bg-white dark:!bg-gray-900/80 !shadow-sm !border-gray-200 dark:!border-white/10 !rounded-xl focus-within:!border-blue-500 transition-all"
                    placeholder="Search items, barcodes..." 
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); if (aiFilteredIds) setAiFilteredIds(null); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAISearch(); }}
                    icon={<Search className="w-4 h-4 text-gray-400" />}
                    rightIcon={
                        <div className="flex items-center gap-1">
                             <button onClick={() => { setScanningFor('search'); setShowScanner(true); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" title="Scan Barcode">
                                <ScanBarcode className="w-4 h-4 opacity-60" />
                            </button>
                             {search && (
                                <button onClick={() => { setSearch(''); setAiFilteredIds(null); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                                    <X className="w-4 h-4 opacity-50" />
                                </button>
                            )}
                            <button 
                                onClick={handleAISearch} 
                                disabled={!search.trim() || isSearchingAI} 
                                className={`p-1.5 rounded-lg transition-all ${aiFilteredIds ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-50 text-blue-500'}`}
                                title="AI Search"
                            >
                                {isSearchingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            </button>
                        </div>
                    }
                />
            </div>
        </div>
      </Card>

      {/* Catalog Modal */}
      <AnimatePresence>
          {showCatalog && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-gray-900 w-full max-w-4xl h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                          <div>
                              <h3 className="font-bold text-lg flex items-center gap-2"><FileImage className="w-5 h-5 text-indigo-500" /> Digital Catalog</h3>
                              <p className="text-xs opacity-60">Ready to share via Screenshot or PDF</p>
                          </div>
                          <div className="flex gap-2">
                              <Button onClick={() => window.print()} className="bg-blue-600 text-white flex gap-2 text-xs h-8 px-3">
                                  <Download className="w-3 h-3" /> Print / PDF
                              </Button>
                              <button onClick={() => setShowCatalog(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
                          </div>
                      </div>
                      <div className="flex-grow overflow-y-auto p-6 bg-white">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="printable-catalog">
                              {inventory.filter(i => i.stock > 0).map(item => (
                                  <div key={item.id} className="border border-gray-100 rounded-xl p-4 flex flex-col items-center text-center">
                                      <div className="text-4xl mb-2">{item.emoji || '📦'}</div>
                                      <div className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 h-10">{item.name}</div>
                                      <div className="text-blue-600 font-bold text-lg">{currencySymbol}{item.sellingPrice} <span className="text-xs text-gray-400 font-normal">/ {item.unit}</span></div>
                                  </div>
                              ))}
                          </div>
                          <div className="mt-8 text-center text-xs text-gray-400">
                              Generated by TradesMen Pro
                          </div>
                      </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      {/* AI Audit Results Modal */}
      <AnimatePresence>
          {auditResults && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
                      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <h3 className="font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-500" /> Audit Results</h3>
                          <button onClick={() => setAuditResults(null)}><X className="w-5 h-5" /></button>
                      </div>
                      <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
                          {auditResults.map((res, i) => (
                              <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-gray-100 dark:border-white/10">
                                  <div>
                                      <div className="font-bold">{res.name}</div>
                                      <div className="text-xs opacity-60">System: {res.systemStock}</div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                      <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm font-bold">Count: {res.count}</div>
                                      {res.id ? (
                                          <button onClick={() => applyAudit({id: res.id, count: res.count})} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                                              <CheckCircle2 className="w-4 h-4" />
                                          </button>
                                      ) : (
                                          <span className="text-xs text-orange-500">Unknown Item</span>
                                      )}
                                  </div>
                              </div>
                          ))}
                          {auditResults.length === 0 && <div className="text-center opacity-50">No items detected.</div>}
                      </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      {/* Main Table / List */}
      <div className="space-y-3">
          {activeTab === 'restock' && (
              <div className="flex justify-end gap-2 mb-2">
                  <Button onClick={generateOrderList} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm py-1.5 h-auto">
                      <UploadCloud className="w-4 h-4" /> Share Order
                  </Button>
              </div>
          )}

          <AnimatePresence>
            {processedInventory.length > 0 ? (
                processedInventory.map(item => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`${styles.card} p-4 !rounded-2xl relative overflow-hidden`}
                        onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                    >
                        {item.color && <div className={`absolute top-0 bottom-0 left-0 w-1 ${item.color.replace('bg-', 'bg-').replace('200', '500')}`} />}
                        
                        <div className="flex justify-between items-start pl-2">
                            <div className="flex-1 pr-4">
                                <div className="font-bold text-lg leading-tight flex items-center gap-2">
                                    {item.isFavorite && <Star className="w-3 h-3 text-orange-400 fill-orange-400" />}
                                    {item.emoji && <span>{item.emoji}</span>}
                                    {item.name}
                                </div>
                                <div className="text-xs opacity-60 mt-1 flex gap-2">
                                    {item.category && <span className="bg-gray-100 dark:bg-white/10 px-1.5 rounded">{item.category}</span>}
                                    {item.shelfId && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {item.shelfId}</span>}
                                </div>
                            </div>
                            
                            {activeTab === 'restock' ? (
                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                    {item.onOrder ? (
                                        <Button onClick={() => handleReceive(item.id)} className="bg-green-100 text-green-700 h-8 px-3 text-xs border-none hover:bg-green-200">
                                            Receive {item.onOrder}
                                        </Button>
                                    ) : (
                                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/10 rounded-lg p-1">
                                            <input 
                                                type="number" 
                                                placeholder="Qty" 
                                                className="w-12 bg-transparent text-center text-sm outline-none"
                                                defaultValue={Math.max((item.lowStockThreshold || 10) * 2 - item.stock, 5)}
                                                onBlur={(e) => handleOrder(item.id, Number(e.target.value))}
                                            />
                                            <button className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"><Plus className="w-3 h-3" /></button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-right">
                                    <div className="text-xl font-bold">{currencySymbol}{item.sellingPrice}</div>
                                    <div className={`text-xs ${item.stock < (item.lowStockThreshold || 10) ? 'text-orange-500 font-bold' : 'opacity-60'}`}>
                                        Stock: {formatUnit(item.stock, item.unit, unitSystem)}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions (Only for Admin or Restock mode partials) */}
                        <AnimatePresence>
                            {expandedRow === item.id && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden mt-2 border-t border-gray-100 dark:border-white/10 pt-2">
                                    <ProductDetailView item={item} />
                                    {userRole === 'admin' && (
                                        <div className="flex justify-end gap-2 mt-4">
                                            <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleDuplicate(item); }} className="text-xs h-8 px-3">Duplicate</Button>
                                            <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="text-xs h-8 px-3">Edit</Button>
                                            <Button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="text-xs h-8 px-3 bg-red-50 text-red-600 border-none hover:bg-red-100">Delete</Button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))
            ) : <div className="p-8 text-center opacity-50">{isSearchingAI ? "Analyzing..." : "No items found."}</div>}
          </AnimatePresence>
      </div>

      {/* Add/Edit Modal (Same as before but ensures correct styles applied) */}
      <AnimatePresence>
        {isAdding && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4" onClick={resetForm}>
                <motion.div initial={{ scale: 0.9, y: 100 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 100 }} className="w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl overflow-hidden bg-white dark:bg-gray-900 flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 z-10">
                        <h3 className={`text-lg font-bold ${styles.accentText}`}>{editId ? 'Edit Product' : 'Add New Product'}</h3>
                        <button onClick={resetForm} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-6 h-6" /></button>
                    </div>
                    {/* Tabs */}
                    <div className="flex p-2 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                        <button onClick={() => setActiveFormTab('basic')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeFormTab === 'basic' ? 'bg-white shadow text-blue-600' : 'opacity-50'}`}>Basic</button>
                        <button onClick={() => setActiveFormTab('price')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeFormTab === 'price' ? 'bg-white shadow text-green-600' : 'opacity-50'}`}>Pricing</button>
                        <button onClick={() => setActiveFormTab('meta')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeFormTab === 'meta' ? 'bg-white shadow text-purple-600' : 'opacity-50'}`}>Advanced</button>
                    </div>
                    {/* Form Content */}
                    <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                        <div className="space-y-4 pb-20 sm:pb-0">
                            {activeFormTab === 'basic' && (
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                     <div className="flex gap-2 items-end">
                                        <div className="flex-grow"><Input label="Barcode / ID" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} placeholder="Scan or type..." /></div>
                                        <Button onClick={() => { setScanningFor('add'); setShowScanner(true); }} className="mb-[1px] px-3"><ScanBarcode className="w-5 h-5" /></Button>
                                    </div>
                                    <Input label="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Category" placeholder="e.g. Grains" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                                        <div className="flex-grow"><Select label="Unit" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>{UNIT_OPTIONS.map(u => (<option key={u.value} value={u.value}>{u.label}</option>))}</Select></div>
                                    </div>
                                    {/* POS Visuals */}
                                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg space-y-3 mt-4">
                                        <div className="flex items-center gap-2 mb-2"><Palette className="w-4 h-4 opacity-50" /><span className="text-xs font-bold opacity-70 uppercase">POS Appearance</span></div>
                                        <div className="flex gap-4 items-center">
                                            <div className="flex-grow"><div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">{POS_COLORS.map(c => (<button key={c.id} type="button" onClick={() => setFormData({...formData, color: c.bg})} className={`w-8 h-8 rounded-full ${c.bg} border-2 flex-shrink-0 ${formData.color === c.bg ? 'border-black dark:border-white scale-110' : 'border-transparent'}`} />))}</div></div>
                                            <input className="w-12 text-center text-xl bg-transparent border-b" value={formData.emoji} onChange={e => setFormData({...formData, emoji: e.target.value})} placeholder="📦" />
                                        </div>
                                        <div className="flex items-center gap-3 pt-2">
                                            <span className="text-sm font-medium">Add to Quick Grid</span>
                                            <Toggle 
                                                checked={formData.isFavorite || false} 
                                                onChange={(val) => setFormData({...formData, isFavorite: val})} 
                                            />
                                        </div>
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
                         {activeFormTab !== 'basic' && <Button variant="secondary" onClick={() => setActiveFormTab(activeFormTab === 'meta' ? 'price' : 'basic')}>Back</Button>}
                         {activeFormTab === 'meta' || activeFormTab === 'price' ? <Button className="w-full text-lg py-3" onClick={handleSave}>Save Item</Button> : <Button className="w-full text-lg py-3" onClick={() => setActiveFormTab('price')}>Next</Button>}
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;
