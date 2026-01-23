
import React, { useState, useMemo } from 'react';
import { Product, CartItem, Customer, Transaction, Sale, ProductHistoryEvent, BusinessProfile } from '../types';
import { Card, Input, Button, Select } from './ui/BaseComponents';
import { ShoppingCart, Plus, Trash, Receipt, Printer, User, Save, Check, CreditCard, Banknote, ScanBarcode, Share2, MessageCircle, MapPin, Building2, Phone, ArrowRight, Grid, List, PauseCircle, PlayCircle, Clock, X, AlertTriangle, Filter } from 'lucide-react';
import { getThemeClasses } from '../utils/themeUtils';
import { useTheme } from '../contexts/ThemeContext';
import { speak, formatUnit, openWhatsApp, formatBillMessage } from '../utils/appUtils';
import BarcodeScanner from './BarcodeScanner';
import useLocalStorage from '../hooks/useLocalStorage';
import { motion, AnimatePresence } from 'framer-motion';

interface BillingProps {
  inventory: Product[];
  setInventory: (inv: Product[] | ((val: Product[]) => Product[])) => void;
  cart: CartItem[];
  setCart: (cart: CartItem[] | ((val: CartItem[]) => CartItem[])) => void;
  customers: Customer[];
  setCustomers: (customers: Customer[] | ((val: Customer[]) => Customer[])) => void;
  sales: Sale[];
  setSales: (sales: Sale[] | ((val: Sale[]) => Sale[])) => void;
}

interface ParkedBill {
    id: string;
    timestamp: string;
    cart: CartItem[];
    customerName?: string;
}

const Billing: React.FC<BillingProps> = ({ inventory, setInventory, cart, setCart, customers, setCustomers, sales, setSales }) => {
  const { theme, voiceEnabled, unitSystem } = useTheme();
  const styles = getThemeClasses(theme);
  
  // Business Profile for Invoice Printing
  const [profile] = useLocalStorage<BusinessProfile>('tradesmen-business-profile', {
      name: 'My Store',
      address: 'City, Country',
      phone: '',
      terms: 'Thank you!'
  });

  // Adding Item State
  const [selectedId, setSelectedId] = useState('');
  const [qty, setQty] = useState<number | ''>(1);
  const [discount, setDiscount] = useState<number | ''>(0);
  const [showScanner, setShowScanner] = useState(false);
  
  // POS Grid State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Customer & Bill State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(sales.length + 1001);

  // New Features State
  const [parkedBills, setParkedBills] = useLocalStorage<ParkedBill[]>('tradesmen-parked-bills', []);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [showParkedList, setShowParkedList] = useState(false);
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [tenderedAmount, setTenderedAmount] = useState<number | ''>('');

  // Extract unique categories for filter
  const categories = useMemo(() => {
      const cats = new Set(inventory.map(i => i.category).filter(Boolean));
      return ['All', 'Favorites', ...Array.from(cats).sort()];
  }, [inventory]);

  // Filter items for grid
  const gridItems = useMemo(() => {
      if (selectedCategory === 'All') return inventory;
      if (selectedCategory === 'Favorites') return inventory.filter(i => i.isFavorite);
      return inventory.filter(i => i.category === selectedCategory);
  }, [inventory, selectedCategory]);

  const addItem = (prodId = selectedId, quantity = qty) => {
    if(!prodId || !quantity) return;
    const product = inventory.find(p => p.id === prodId);
    if(!product) return;

    // Logic: Check Stock
    const currentStock = product.stock;
    const itemInCart = cart.find(c => c.id === prodId);
    const cartQty = itemInCart ? itemInCart.quantity : 0;
    
    if (currentStock < (cartQty + Number(quantity))) {
        if(!window.confirm(`Low Stock Warning!\nAvailable: ${currentStock}\nAlready in Cart: ${cartQty}\nAdding: ${quantity}\n\nProceed anyway?`)) {
            return;
        }
    }

    const baseTotal = product.sellingPrice * Number(quantity);
    const taxRate = product.gstRate || 0;
    const taxAmount = (baseTotal * taxRate) / 100;

    // Logic: Merge with existing item in cart if same price/discount
    const existingIndex = cart.findIndex(c => c.id === prodId && c.discount === Number(discount));
    
    if (existingIndex > -1) {
        setCart(prev => {
            const newCart = [...prev];
            newCart[existingIndex].quantity += Number(quantity);
            newCart[existingIndex].taxAmount = ((newCart[existingIndex].sellingPrice * newCart[existingIndex].quantity) * taxRate) / 100;
            return newCart;
        });
        speak(`Updated ${product.name} quantity`, voiceEnabled);
    } else {
        const newItem: CartItem = {
            ...product,
            cartId: Date.now().toString() + Math.random(),
            quantity: Number(quantity),
            discount: Number(discount) || 0,
            taxAmount: taxAmount
        };
        setCart(prev => [...prev, newItem]);
        speak(`Added ${product.name}`, voiceEnabled);
    }

    // Reset inputs
    setQty(1);
    setDiscount(0);
    setSelectedId('');
  };

  const handleScan = (code: string) => {
      const product = inventory.find(p => p.barcode === code || p.id === code);
      if (product) {
          addItem(product.id, 1);
      } else {
          speak("Item not found", voiceEnabled);
          alert("Item not found!");
      }
      setShowScanner(false);
  };

  const removeItem = (cartId: string) => {
    setCart(prev => prev.filter(c => c.cartId !== cartId));
  };

  const calculateSubTotal = () => {
    return cart.reduce((acc, item) => {
        const gross = item.sellingPrice * item.quantity;
        const disc = gross * (item.discount / 100);
        return acc + (gross - disc);
    }, 0);
  };

  const calculateTotalTax = () => {
      return cart.reduce((acc, item) => {
          const gross = item.sellingPrice * item.quantity;
          const disc = gross * (item.discount / 100);
          const taxableValue = gross - disc;
          return acc + ((taxableValue * (item.gstRate || 0)) / 100);
      }, 0);
  }

  const calculateGrandTotal = () => {
      return calculateSubTotal() + calculateTotalTax();
  }

  const handlePrint = () => {
      window.print();
  }

  const handleWhatsAppShare = () => {
      if (cart.length === 0) return;
      const total = calculateGrandTotal();
      let phone = '';
      let name = 'Valued Customer';
      if (selectedCustomerId) {
          const c = customers.find(cust => cust.id === selectedCustomerId);
          if (c) { phone = c.phone; name = c.name; }
      }
      if (!phone) {
          const input = prompt("Enter Customer WhatsApp Number:", "");
          if (!input) return;
          phone = input;
      }
      const message = formatBillMessage(cart, total, name);
      openWhatsApp(phone, message);
  };

  // --- Park Bill Feature ---
  const handleParkBill = () => {
      if (cart.length === 0) return;
      
      const custName = selectedCustomerId ? customers.find(c => c.id === selectedCustomerId)?.name : 'Walk-in';
      const newParked: ParkedBill = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          cart: [...cart],
          customerName: custName
      };
      
      setParkedBills(prev => [newParked, ...prev]);
      setCart([]);
      setSelectedCustomerId('');
      speak("Bill on hold", voiceEnabled);
  };

  const retrieveBill = (bill: ParkedBill) => {
      if (cart.length > 0) {
          if(!window.confirm("Current cart is not empty. Overwrite it?")) return;
      }
      setCart(bill.cart);
      setParkedBills(prev => prev.filter(p => p.id !== bill.id));
      setShowParkedList(false);
      speak("Bill retrieved", voiceEnabled);
  };

  const handleCompleteOrder = (method: 'cash' | 'credit') => {
    if (cart.length === 0) return;

    const total = calculateGrandTotal();
    const totalTax = calculateTotalTax();
    
    // Check Credit Limit
    if (method === 'credit' && selectedCustomerId) {
        const cust = customers.find(c => c.id === selectedCustomerId);
        if (cust && cust.creditLimit && cust.creditLimit > 0) {
            const newDebt = cust.debt + total;
            if (newDebt > cust.creditLimit) {
                alert(`CREDIT LIMIT EXCEEDED!\n\nLimit: ${cust.creditLimit}\nCurrent Debt: ${cust.debt}\nNew Total: ${newDebt}\n\nTransaction blocked.`);
                return;
            }
        }
    } else if (method === 'credit' && !selectedCustomerId) {
        alert("Please select a customer to sell on credit.");
        return;
    }
    
    // Profit Calc
    const profit = cart.reduce((acc, item) => {
        const revenue = (item.sellingPrice * item.quantity) * (1 - item.discount/100);
        const cost = (item.buyingPrice || 0) * item.quantity;
        // If buying price is 0, we treat revenue as profit for now, but in reality its undefined cost
        return acc + (revenue - cost);
    }, 0);

    // 1. Create Sale Record
    const newSale: Sale = {
        id: Date.now().toString(),
        invoiceNumber: invoiceNumber.toString(),
        date: new Date().toISOString(),
        totalAmount: total,
        totalTax: totalTax,
        totalProfit: profit,
        paymentMethod: method,
        items: [...cart],
        customerId: selectedCustomerId || undefined
    };
    setSales(prev => [...prev, newSale]);

    // 2. Update Stock
    setInventory(prev => prev.map(prod => {
        const cartItem = cart.find(c => c.id === prod.id);
        if (cartItem) {
            const newHistory: ProductHistoryEvent[] = [...(prod.history || [])];
            newHistory.push({
                id: Date.now().toString() + Math.random(),
                date: new Date().toISOString(),
                type: 'sale',
                description: `Inv #${invoiceNumber}: Sold ${formatUnit(cartItem.quantity, cartItem.unit, unitSystem)}`
            });
            return { ...prod, stock: prod.stock - cartItem.quantity, history: newHistory };
        }
        return prod;
    }));

    // 3. Update Customer
    if (selectedCustomerId) {
        setCustomers(prev => {
             const customer = prev.find(c => c.id === selectedCustomerId);
             if (customer) {
                const newTransaction: Transaction = {
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    amount: total,
                    summary: `Invoice #${invoiceNumber}`,
                    type: method === 'credit' ? 'credit' : 'sale'
                };
                const updatedCustomer = {
                    ...customer,
                    history: [...customer.history, newTransaction],
                    debt: method === 'credit' ? (customer.debt || 0) + total : (customer.debt || 0)
                };
                return prev.map(c => c.id === selectedCustomerId ? updatedCustomer : c);
             }
             return prev;
        });
    }

    setInvoiceNumber(prev => prev + 1);
    setCart([]);
    setShowPaymentModal(false);
    setTenderedAmount('');
    // Optionally trigger print here automatically
    // window.print();
  };

  const getSelectedProductInfo = () => inventory.find(p => p.id === selectedId);
  const selectedProduct = getSelectedProductInfo();

  // Dynamic Styles for Sticky Action Bar based on Theme
  const dockStyles = (() => {
      const baseIcon = "w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95";
      const basePay = "h-11 px-6 rounded-full font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-transform flex-grow justify-center";

      switch(theme) {
          case 'glass':
              return {
                  container: 'bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl',
                  label: 'text-white/60',
                  value: 'text-white',
                  iconBtn: `${baseIcon} bg-white/10 text-white hover:bg-white/20 border border-white/5`,
                  payBtn: `${basePay} bg-white text-black hover:bg-gray-100`
              };
          case 'neumorphism':
              return {
                  container: 'bg-[#E0E5EC] dark:bg-[#292d3e] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#1f2330,-6px_-6px_12px_#33374a] border border-white/40 dark:border-white/5',
                  label: 'text-slate-500 dark:text-gray-400 font-bold',
                  value: 'text-slate-700 dark:text-blue-400',
                  iconBtn: `${baseIcon} bg-[#E0E5EC] dark:bg-[#292d3e] text-slate-600 dark:text-gray-300 shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#1f2330,-4px_-4px_8px_#33374a] active:shadow-[inset_2px_2px_4px_#bebebe,inset_-2px_-2px_4px_#ffffff] dark:active:shadow-[inset_2px_2px_4px_#1f2330,inset_-2px_-2px_4px_#33374a]`,
                  payBtn: `${basePay} bg-[#E0E5EC] dark:bg-[#292d3e] text-green-600 dark:text-green-400 shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#1f2330,-4px_-4px_8px_#33374a] active:shadow-[inset_2px_2px_4px_#bebebe,inset_-2px_-2px_4px_#ffffff] dark:active:shadow-[inset_2px_2px_4px_#1f2330,inset_-2px_-2px_4px_#33374a]`
              };
          case 'fluent':
             return {
                  container: 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl',
                  label: 'text-gray-500 dark:text-gray-400',
                  value: 'text-gray-900 dark:text-white',
                  iconBtn: `${baseIcon} bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100`,
                  payBtn: `${basePay} bg-[#0078D4] text-white hover:bg-[#106EBE]`
             }
          default: // Material / Default
              return {
                  container: 'bg-[#EADDFF] text-[#21005D] shadow-lg dark:bg-[#2B2930] dark:text-[#E6E1E5]',
                  label: 'text-[#21005D]/70 dark:text-[#E6E1E5]/70',
                  value: 'text-[#21005D] dark:text-[#E6E1E5]',
                  iconBtn: `${baseIcon} bg-white/50 dark:bg-[#4A4458] text-[#21005D] dark:text-[#E6E1E5] hover:bg-white/80 dark:hover:bg-[#4A4458]/80`,
                  payBtn: `${basePay} bg-[#6750A4] dark:bg-[#D0BCFF] text-white dark:text-[#381E72] hover:bg-[#5f4998]`
              };
      }
  })();

  return (
    <div className="space-y-6 pb-64 md:pb-0 relative">
      
      {/* 
        INVOICE PREVIEW / PRINT TEMPLATE 
        Note: We maintain 'id="printable-invoice"' for the print @media query in index.html, 
        but use Tailwind classes to style it beautifully for the screen.
      */}
      <motion.div 
        id="printable-invoice"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto max-w-[320px] md:max-w-[380px] bg-white text-black p-6 shadow-2xl my-6 relative overflow-hidden font-mono text-sm leading-relaxed select-none"
        style={{ borderRadius: '12px' }} // Smooth rounded corners for screen
      >
           {/* Decorative Top Gradient for Screen Only */}
           <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 print:hidden" />
           
           {/* Floating Animation Wrapper for visual flair */}
           <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
           >
               <div className="text-center mb-6">
                   <div className="font-black text-xl tracking-widest uppercase mb-1">{profile.name}</div>
                   <div className="text-xs opacity-70">{profile.address}</div>
                   <div className="text-xs opacity-70">{profile.phone}</div>
               </div>
    
               <div className="border-b-2 border-dashed border-gray-300 my-4 opacity-50" />
    
               <div className="flex justify-between text-xs opacity-80 mb-1">
                   <span>Inv: <span className="font-bold text-black">{invoiceNumber}</span></span>
                   <span>{new Date().toLocaleDateString()}</span>
               </div>
               {selectedCustomerId && (
                    <div className="text-center text-xs font-bold my-2 bg-gray-100 py-1 rounded">
                        Cust: {customers.find(c => c.id === selectedCustomerId)?.name}
                    </div>
               )}
    
               <div className="border-b-2 border-dashed border-gray-300 my-4 opacity-50" />
    
               {/* Headers */}
               <div className="flex justify-between font-bold text-xs uppercase tracking-wide mb-2">
                    <span className="flex-[2]">Item</span>
                    <span className="flex-1 text-right">Qty</span>
                    <span className="flex-1 text-right">Val</span>
               </div>
    
               {/* Items */}
               <div className="space-y-2">
                   {cart.map(item => {
                       const val = ((item.sellingPrice * item.quantity) * (1 - item.discount/100));
                       return (
                           <div key={item.cartId} className="flex flex-col">
                               <div className="font-bold text-xs">{item.name}</div>
                               <div className="flex justify-between text-xs opacity-80">
                                   <span className="flex-[2] pl-2 opacity-70">@{item.sellingPrice}</span>
                                   <span className="flex-1 text-right">{item.quantity}{item.unit}</span>
                                   <span className="flex-1 text-right font-medium">{val.toFixed(2)}</span>
                               </div>
                           </div>
                       )
                   })}
                   {cart.length === 0 && <div className="text-center opacity-30 italic py-4">Cart is empty</div>}
               </div>
    
               <div className="border-b-2 border-black my-4" />
    
               <div className="flex justify-between items-center text-xl font-black">
                   <span>TOTAL</span>
                   <motion.span 
                      key={calculateGrandTotal()}
                      initial={{ scale: 1.2, color: '#2563eb' }}
                      animate={{ scale: 1, color: '#000000' }}
                      transition={{ duration: 0.3 }}
                   >
                      {calculateGrandTotal().toFixed(2)}
                   </motion.span>
               </div>
    
               <div className="border-b-2 border-dashed border-gray-300 my-4 opacity-50" />
    
               <div className="text-center text-[10px] opacity-60 italic mt-4">
                   {profile.terms || 'Thank You!'}
               </div>
               
               {/* Barcode visual for screen only */}
               <div className="mt-4 flex justify-center opacity-40 print:hidden">
                    <div className="h-8 w-48 bg-current" style={{ clipPath: 'polygon(0% 0%, 5% 0%, 5% 100%, 10% 100%, 10% 0%, 15% 0%, 15% 100%, 20% 100%, 20% 0%, 25% 0%, 25% 100%, 30% 100%, 30% 0%, 40% 0%, 40% 100%, 45% 100%, 45% 0%, 50% 0%, 50% 100%, 55% 100%, 55% 0%, 65% 0%, 65% 100%, 70% 100%, 70% 0%, 80% 0%, 80% 100%, 85% 100%, 85% 0%, 90% 0%, 90% 100%, 95% 100%, 95% 0%, 100% 0%, 100% 100%, 0% 100%)' }}></div>
               </div>

           </motion.div>
      </motion.div>

      {showScanner && <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
      
      {/* Cash Payment / Change Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl">Confirm Payment</h3>
                    <button onClick={() => setShowPaymentModal(false)}><X className="w-6 h-6" /></button>
                </div>

                <div className="text-center mb-6">
                    <div className="text-sm opacity-60 uppercase tracking-wide">Total Amount to Pay</div>
                    <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mt-1">
                        {calculateGrandTotal().toFixed(2)}
                    </div>
                </div>

                <div className="mb-6 space-y-4">
                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                        <label className="text-xs font-bold opacity-60 uppercase block mb-2">Cash Tendered (Received)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">$</span>
                            <input 
                                type="number" 
                                autoFocus
                                className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg py-3 pl-8 text-xl font-bold outline-none focus:border-blue-500"
                                placeholder="0.00"
                                value={tenderedAmount}
                                onChange={e => setTenderedAmount(e.target.valueAsNumber)}
                            />
                        </div>
                        {/* Quick Cash Buttons */}
                        <div className="flex gap-2 mt-2">
                             {[100, 500, 1000, 2000].map(amt => (
                                 <button 
                                    key={amt} 
                                    onClick={() => setTenderedAmount(amt)}
                                    className="px-2 py-1 text-xs bg-white dark:bg-gray-800 border rounded hover:bg-gray-100"
                                 >
                                     +{amt}
                                 </button>
                             ))}
                        </div>
                    </div>

                    {tenderedAmount && tenderedAmount >= calculateGrandTotal() && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-xl text-center">
                            <div className="text-xs font-bold uppercase opacity-70">Change Due</div>
                            <div className="text-3xl font-bold">
                                {(Number(tenderedAmount) - calculateGrandTotal()).toFixed(2)}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button 
                        onClick={() => handleCompleteOrder('credit')} 
                        className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none"
                    >
                        Credit Bill
                    </Button>
                    <Button 
                        onClick={() => handleCompleteOrder('cash')} 
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        Mark Paid
                    </Button>
                </div>
            </motion.div>
        </div>
      )}

      {/* Retrieve Bill Modal */}
      {showParkedList && (
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl p-4 shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">Held Bills</h3>
                      <button onClick={() => setShowParkedList(false)}><X className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                      {parkedBills.length === 0 ? <div className="text-center opacity-50 py-4">No held bills.</div> : (
                          parkedBills.map(bill => (
                              <div key={bill.id} className="p-3 border rounded-xl flex justify-between items-center hover:bg-gray-50 dark:hover:bg-white/5">
                                  <div>
                                      <div className="font-bold">{bill.customerName}</div>
                                      <div className="text-xs opacity-60">{new Date(bill.timestamp).toLocaleTimeString()} - {bill.cart.length} items</div>
                                  </div>
                                  <Button onClick={() => retrieveBill(bill)} className="px-3 py-1 text-xs">Retrieve</Button>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Input Section */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
             <Card>
                <div className="flex justify-between items-center mb-4">
                     <h2 className={`text-lg font-bold flex items-center gap-2 ${styles.accentText}`}>
                        <Plus className="w-5 h-5" /> Add to Bill
                    </h2>
                    
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow' : 'opacity-50'}`}><List className="w-4 h-4" /></button>
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow' : 'opacity-50'}`}><Grid className="w-4 h-4" /></button>
                    </div>
                </div>

                {viewMode === 'list' ? (
                    <div className="space-y-4">
                        <div className="flex gap-2 items-end">
                             <div className="flex-grow">
                                 <Select label="Product" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                                    <option value="">-- Select Item --</option>
                                    {inventory.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </Select>
                             </div>
                             <Button onClick={() => setShowScanner(true)} className="mb-[1px] px-3">
                                 <ScanBarcode className="w-5 h-5" />
                             </Button>
                        </div>

                        {selectedProduct && (
                            <div className="text-xs space-y-1 bg-gray-50 dark:bg-white/5 p-2 rounded flex justify-between">
                                 <span className="font-bold">{selectedProduct.sellingPrice} / {selectedProduct.unit}</span>
                                 <span className={selectedProduct.stock < 10 ? 'text-red-500 font-bold' : 'text-green-600'}>
                                     Stock: {selectedProduct.stock}
                                 </span>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Quantity" type="number" value={qty} onChange={(e) => setQty(e.target.valueAsNumber)} />
                            <Input label="Discount %" type="number" value={discount} onChange={(e) => setDiscount(e.target.valueAsNumber)} />
                        </div>

                        <Button onClick={() => addItem()} className="w-full flex justify-center items-center gap-2 py-3">
                            <ShoppingCart className="w-4 h-4" /> Add to Cart
                        </Button>
                    </div>
                ) : (
                    // Quick Grid View (Visual POS)
                    <div className="space-y-4">
                        {/* Categories Filter Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                                        selectedCategory === cat 
                                            ? 'bg-blue-600 text-white border-blue-600' 
                                            : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-50'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                         <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto content-start">
                             {gridItems.length > 0 ? gridItems.map(item => (
                                 <motion.button 
                                    whileTap={{ scale: 0.95 }}
                                    key={item.id}
                                    onClick={() => addItem(item.id, 1)}
                                    className={`flex flex-col items-center justify-between p-2 rounded-2xl h-24 shadow-sm transition-all relative overflow-hidden group ${item.color || (theme === 'glass' ? 'bg-white/10 border-white/20' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 border')}`}
                                 >
                                     <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                                     
                                     {/* Emoji / Icon */}
                                     <div className="text-3xl mt-1 filter drop-shadow-sm group-hover:scale-110 transition-transform">
                                         {item.emoji || '📦'}
                                     </div>
                                     
                                     <div className="w-full text-center z-10">
                                         <div className="font-bold text-xs truncate w-full opacity-90 leading-tight mb-0.5 text-black dark:text-white">
                                             {item.name}
                                         </div>
                                         <div className="text-[10px] font-bold opacity-70 text-black dark:text-white">
                                             {item.sellingPrice}
                                         </div>
                                     </div>
                                     {/* Stock Low Indicator */}
                                     {item.stock < (item.lowStockThreshold || 5) && (
                                         <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Low Stock"></div>
                                     )}
                                 </motion.button>
                             )) : (
                                <div className="col-span-3 text-center opacity-50 text-xs py-10 flex flex-col items-center gap-2">
                                    <Grid className="w-8 h-8 opacity-20" />
                                    No items in this category.
                                </div>
                             )}
                         </div>
                    </div>
                )}
            </Card>

            <Card className="hidden md:block">
                 <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${styles.accentText}`}>
                    <User className="w-5 h-5" /> Customer
                </h2>
                <Select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)}>
                    <option value="">-- Walk-in Customer --</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                    ))}
                </Select>
            </Card>
        </div>

        {/* Bill Preview Section */}
        <div className="lg:col-span-2">
            <Card className="min-h-[300px] md:min-h-[600px] flex flex-col pb-20 md:pb-6 relative">
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-xl font-bold flex items-center gap-2 ${styles.accentText}`}>
                        <Receipt className="w-5 h-5" /> Cart ({cart.length})
                    </h2>
                    
                    <div className="flex gap-2">
                         <Button variant="secondary" onClick={() => setShowParkedList(true)} className="text-xs py-1 px-3 h-auto min-h-[32px] relative">
                             <Clock className="w-4 h-4" /> 
                             {parkedBills.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>}
                        </Button>
                        {cart.length > 0 && (
                            <Button variant="secondary" onClick={handleParkBill} className="text-xs py-1 px-3 h-auto min-h-[32px]" title="Hold Bill">
                                <PauseCircle className="w-4 h-4 text-orange-500" />
                            </Button>
                        )}
                        <Button variant="secondary" onClick={() => setCart([])} className="text-xs py-1 px-3 h-auto min-h-[32px]">
                            Clear
                        </Button>
                    </div>
                </div>
                
                {/* Mobile Customer Select (Visible only on small screens) */}
                <div className="md:hidden mb-4">
                     <Select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} className="text-sm">
                        <option value="">-- Walk-in Customer --</option>
                        {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </Select>
                </div>

                <div className="flex-grow overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-white/10 opacity-70 text-xs md:text-sm">
                                <th className="pb-2 pl-1">Item</th>
                                <th className="pb-2 text-right">Qty</th>
                                <th className="pb-2 text-right hidden md:table-cell">Price</th>
                                <th className="pb-2 text-right">Total</th>
                                <th className="pb-2 text-center w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {cart.map(item => {
                                const gross = item.sellingPrice * item.quantity;
                                const disc = gross * (item.discount / 100);
                                const taxable = gross - disc;
                                const tax = (taxable * (item.gstRate || 0)) / 100;
                                const lineTotal = taxable + tax;
                                
                                return (
                                    <tr key={item.cartId} className="group text-sm">
                                        <td className="py-3 font-medium pl-1 flex items-center gap-2">
                                            {item.emoji && <span className="text-lg">{item.emoji}</span>}
                                            <div>
                                                {item.name}
                                                <div className="md:hidden text-[10px] opacity-60">@{item.sellingPrice}</div>
                                            </div>
                                        </td>
                                        <td className="py-3 text-right">
                                            {formatUnit(item.quantity, item.unit, unitSystem)}
                                        </td>
                                        <td className="py-3 text-right hidden md:table-cell">{item.sellingPrice}</td>
                                        <td className="py-3 text-right font-bold">{lineTotal.toFixed(2)}</td>
                                        <td className="py-3 text-center">
                                            <button 
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); removeItem(item.cartId); }} 
                                                className="text-red-500 p-2 cursor-pointer relative z-10"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {cart.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center opacity-40">Cart is empty</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Desktop Totals */}
                <div className="hidden md:block mt-6 pt-6 border-t border-gray-200 dark:border-white/10 space-y-4">
                    <div className="flex justify-between items-center text-xl font-bold border-t border-dashed border-gray-300 dark:border-gray-700 pt-2">
                        <span>Grand Total</span>
                        <span className={styles.accentText}>{calculateGrandTotal().toFixed(2)}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                         <Button variant="secondary" className="flex justify-center gap-2" onClick={handlePrint}>
                            <Printer className="w-4 h-4" /> Print
                        </Button>
                         <Button 
                            className="flex justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-700 border border-green-200"
                            onClick={handleWhatsAppShare}
                            disabled={cart.length === 0}
                            variant="secondary"
                        >
                            <MessageCircle className="w-4 h-4" /> Share
                        </Button>
                        <Button 
                            className="flex justify-center gap-2 bg-green-600 hover:bg-green-700 text-white" 
                            onClick={() => setShowPaymentModal(true)} 
                            disabled={cart.length === 0}
                        >
                            <Banknote className="w-4 h-4" /> Checkout
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
      </div>

      {/* Redesigned Mobile Floating Dock */}
      {/* Positioned above the bottom nav (approx 80px from bottom) */}
      <div className={`md:hidden fixed bottom-[76px] left-3 right-3 z-50 rounded-2xl p-3 transition-all duration-300 ${dockStyles.container}`}>
         <div className="flex items-center gap-3 w-full">
             
             {/* Total Value */}
             <div className="flex flex-col flex-shrink-0 min-w-[80px]">
                 <span className={`text-[10px] uppercase font-bold tracking-wider ${dockStyles.label}`}>
                    Total ({cart.length})
                 </span>
                 <span className={`text-xl font-black leading-none ${dockStyles.value}`}>
                    {calculateGrandTotal().toFixed(0)}<span className="text-sm opacity-70">.{calculateGrandTotal().toFixed(2).split('.')[1]}</span>
                 </span>
             </div>

             {/* Actions Group */}
             <div className="flex items-center gap-2 flex-grow justify-end">
                 {/* Share */}
                 <button 
                    onClick={handleWhatsAppShare}
                    disabled={cart.length === 0}
                    className={dockStyles.iconBtn}
                 >
                    <Share2 className="w-5 h-5" />
                 </button>

                 {/* Pay */}
                 <button 
                    onClick={() => setShowPaymentModal(true)} 
                    disabled={cart.length === 0}
                    className={dockStyles.payBtn}
                 >
                    <span>PAY</span>
                    <ArrowRight className="w-4 h-4" />
                 </button>
             </div>
         </div>
      </div>
    </div>
  );
};

export default Billing;
