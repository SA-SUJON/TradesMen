import React, { useState } from 'react';
import { Product, CartItem, Customer, Transaction, Sale, ProductHistoryEvent, BusinessProfile } from '../types';
import { Card, Input, Button, Select } from './ui/BaseComponents';
import { ShoppingCart, Plus, Trash, Receipt, Printer, User, Save, Check, CreditCard, Banknote, ScanBarcode, Share2, MessageCircle, MapPin, Building2, Phone, ArrowRight } from 'lucide-react';
import { getThemeClasses } from '../utils/themeUtils';
import { useTheme } from '../contexts/ThemeContext';
import { speak, formatUnit, openWhatsApp, formatBillMessage } from '../utils/appUtils';
import BarcodeScanner from './BarcodeScanner';
import useLocalStorage from '../hooks/useLocalStorage';

interface BillingProps {
  inventory: Product[];
  setInventory: (inv: Product[]) => void;
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  sales: Sale[];
  setSales: (sales: Sale[]) => void;
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
  
  // Customer & Bill State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(sales.length + 1001);

  const addItem = () => {
    if(!selectedId || !qty) return;
    const product = inventory.find(p => p.id === selectedId);
    if(!product) return;

    const baseTotal = product.sellingPrice * Number(qty);
    const taxRate = product.gstRate || 0;
    const taxAmount = (baseTotal * taxRate) / 100;

    const newItem: CartItem = {
        ...product,
        cartId: Date.now().toString(),
        quantity: Number(qty),
        discount: Number(discount) || 0,
        taxAmount: taxAmount
    };

    setCart([...cart, newItem]);
    speak(`Added ${qty} ${product.unit} of ${product.name}`, voiceEnabled);

    // Reset inputs
    setQty(1);
    setDiscount(0);
    setSelectedId('');
  };

  const handleScan = (code: string) => {
      const product = inventory.find(p => p.barcode === code || p.id === code);
      if (product) {
          setSelectedId(product.id);
          speak(`${product.name} found`, voiceEnabled);
      } else {
          speak("Item not found", voiceEnabled);
          alert("Item not found!");
      }
      setShowScanner(false);
  };

  const removeItem = (cartId: string) => {
    setCart(cart.filter(c => c.cartId !== cartId));
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

  const handleCompleteOrder = (method: 'cash' | 'credit') => {
    if (cart.length === 0) return;

    const total = calculateGrandTotal();
    const totalTax = calculateTotalTax();
    const profit = cart.reduce((acc, item) => {
        const revenue = (item.sellingPrice * item.quantity) * (1 - item.discount/100);
        const cost = (item.buyingPrice || 0) * item.quantity;
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
    setSales([...sales, newSale]);

    // 2. Update Stock
    const updatedInventory = inventory.map(prod => {
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
    });
    setInventory(updatedInventory);

    // 3. Update Customer
    if (selectedCustomerId) {
        const customer = customers.find(c => c.id === selectedCustomerId);
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
            setCustomers(customers.map(c => c.id === selectedCustomerId ? updatedCustomer : c));
        }
    } else if (method === 'credit') {
        alert("Please select a customer to sell on credit.");
        return;
    }

    setInvoiceNumber(prev => prev + 1);
    setCart([]);
    alert("Invoice Saved Successfully!");
  };

  const getSelectedProductInfo = () => inventory.find(p => p.id === selectedId);
  const selectedProduct = getSelectedProductInfo();
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Dynamic Styles for Sticky Action Bar based on Theme
  // Returns classes for: container, label, value, iconBtn, payBtn
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
                  container: 'bg-[#E0E5EC] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] border border-white/40',
                  label: 'text-slate-500 font-bold',
                  value: 'text-slate-700',
                  iconBtn: `${baseIcon} bg-[#E0E5EC] text-slate-600 shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#bebebe,inset_-2px_-2px_4px_#ffffff]`,
                  payBtn: `${basePay} bg-[#E0E5EC] text-green-600 shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#bebebe,inset_-2px_-2px_4px_#ffffff]`
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
                  container: 'bg-[#EADDFF] text-[#21005D] shadow-lg dark:bg-gray-800 dark:text-white',
                  label: 'text-[#21005D]/70 dark:text-white/70',
                  value: 'text-[#21005D] dark:text-white',
                  iconBtn: `${baseIcon} bg-white/50 dark:bg-white/10 text-[#21005D] dark:text-white hover:bg-white/80`,
                  payBtn: `${basePay} bg-[#6750A4] text-white hover:bg-[#5f4998]`
              };
      }
  })();

  return (
    <div className="space-y-6 pb-64 md:pb-0">
      {/* HIDDEN INVOICE TEMPLATE (Visible only on Print) */}
      <div id="printable-invoice" className="hidden print:block p-8 bg-white text-black font-sans max-w-[210mm] mx-auto h-full">
           {/* ... Print Template Content ... */}
           {/* (Kept minimal for brevity as it's hidden on mobile view) */}
           <h1 className="text-3xl font-bold">{profile.name}</h1>
           <p>Invoice #{invoiceNumber}</p>
           {/* ... */}
      </div>

      {showScanner && <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Input Section */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
             <Card>
                <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${styles.accentText}`}>
                    <Plus className="w-5 h-5" /> Add to Bill
                </h2>
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
                             {selectedProduct.gstRate ? <span className="text-green-600">GST {selectedProduct.gstRate}%</span> : null}
                        </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Quantity" type="number" value={qty} onChange={(e) => setQty(e.target.valueAsNumber)} />
                        <Input label="Discount %" type="number" value={discount} onChange={(e) => setDiscount(e.target.valueAsNumber)} />
                    </div>

                    <Button onClick={addItem} className="w-full flex justify-center items-center gap-2 py-3">
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </Button>
                </div>
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
            <Card className="min-h-[300px] md:min-h-[600px] flex flex-col pb-20 md:pb-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-xl font-bold flex items-center gap-2 ${styles.accentText}`}>
                        <Receipt className="w-5 h-5" /> Cart ({cart.length})
                    </h2>
                    <Button variant="secondary" onClick={() => setCart([])} className="text-xs py-1 px-3 h-auto min-h-[32px]">
                        Clear
                    </Button>
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
                                        <td className="py-3 font-medium pl-1">
                                            {item.name}
                                            <div className="md:hidden text-[10px] opacity-60">@{item.sellingPrice}</div>
                                        </td>
                                        <td className="py-3 text-right">
                                            {formatUnit(item.quantity, item.unit, unitSystem)}
                                        </td>
                                        <td className="py-3 text-right hidden md:table-cell">{item.sellingPrice}</td>
                                        <td className="py-3 text-right font-bold">{lineTotal.toFixed(2)}</td>
                                        <td className="py-3 text-center">
                                            <button onClick={() => removeItem(item.cartId)} className="text-red-500 p-2">
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
                    
                    <div className="grid grid-cols-4 gap-4">
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
                            className="flex justify-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 border-none"
                            onClick={() => handleCompleteOrder('credit')}
                            disabled={cart.length === 0}
                        >
                            <CreditCard className="w-4 h-4" /> Credit
                        </Button>
                        <Button 
                            className="flex justify-center gap-2 bg-green-600 hover:bg-green-700 text-white" 
                            onClick={() => handleCompleteOrder('cash')} 
                            disabled={cart.length === 0}
                        >
                            <Banknote className="w-4 h-4" /> Pay
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

                 {/* Credit */}
                 <button 
                    onClick={() => handleCompleteOrder('credit')}
                    disabled={cart.length === 0}
                    className={dockStyles.iconBtn}
                 >
                    <User className="w-5 h-5" />
                 </button>

                 {/* Pay Cash */}
                 <button 
                    onClick={() => handleCompleteOrder('cash')} 
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