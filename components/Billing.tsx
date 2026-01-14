import React, { useState } from 'react';
import { Product, CartItem, Customer, Transaction, Sale, ProductHistoryEvent } from '../types';
import { Card, Input, Button, Select } from './ui/BaseComponents';
import { ShoppingCart, Plus, Trash, Receipt, Printer, User, Save, Check, CreditCard, Banknote, ScanBarcode, Share2, MessageCircle, MapPin } from 'lucide-react';
import { getThemeClasses } from '../utils/themeUtils';
import { useTheme } from '../contexts/ThemeContext';
import { speak, formatUnit, openWhatsApp, formatBillMessage } from '../utils/appUtils';
import BarcodeScanner from './BarcodeScanner';

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
  
  // Adding Item State
  const [selectedId, setSelectedId] = useState('');
  const [qty, setQty] = useState<number | ''>(1);
  const [discount, setDiscount] = useState<number | ''>(0);
  const [showScanner, setShowScanner] = useState(false);
  
  // Customer State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const addItem = () => {
    if(!selectedId || !qty) return;
    const product = inventory.find(p => p.id === selectedId);
    if(!product) return;

    const newItem: CartItem = {
        ...product,
        cartId: Date.now().toString(),
        quantity: Number(qty),
        discount: Number(discount) || 0
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

  const calculateTotal = () => {
    return cart.reduce((acc, item) => {
        const gross = item.sellingPrice * item.quantity; // sellingPrice usually per unit (kg)
        const disc = gross * (item.discount / 100);
        return acc + (gross - disc);
    }, 0);
  };

  const calculateTotalProfit = () => {
      return cart.reduce((acc, item) => {
          const revenue = (item.sellingPrice * item.quantity) * (1 - item.discount/100);
          const cost = (item.buyingPrice || 0) * item.quantity;
          return acc + (revenue - cost);
      }, 0);
  };

  const handlePrint = () => {
      window.print();
  }

  const handleWhatsAppShare = () => {
      if (cart.length === 0) return;
      
      const total = calculateTotal();
      let phone = '';
      let name = 'Valued Customer';

      if (selectedCustomerId) {
          const c = customers.find(cust => cust.id === selectedCustomerId);
          if (c) {
              phone = c.phone;
              name = c.name;
          }
      }

      // If no phone from customer record, prompt user
      if (!phone) {
          const input = prompt("Enter Customer WhatsApp Number (with country code):", "");
          if (!input) return;
          phone = input;
      }

      const message = formatBillMessage(cart, total, name);
      openWhatsApp(phone, message);
  };

  const handleCompleteOrder = (method: 'cash' | 'credit') => {
    if (cart.length === 0) return;

    const total = calculateTotal();
    const profit = calculateTotalProfit();
    
    // 1. Create Sale Record (Global Analytics)
    const newSale: Sale = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        totalAmount: total,
        totalProfit: profit,
        paymentMethod: method,
        items: [...cart],
        customerId: selectedCustomerId || undefined
    };
    setSales([...sales, newSale]);

    // 2. Update Stock and Product History
    const updatedInventory = inventory.map(prod => {
        const cartItem = cart.find(c => c.id === prod.id);
        if (cartItem) {
            // Create History Event
            const newHistory: ProductHistoryEvent[] = [...(prod.history || [])];
            newHistory.push({
                id: Date.now().toString() + Math.random(),
                date: new Date().toISOString(),
                type: 'sale',
                description: `Sold ${formatUnit(cartItem.quantity, cartItem.unit, unitSystem)}`
            });

            return {
                ...prod,
                stock: prod.stock - cartItem.quantity,
                history: newHistory
            };
        }
        return prod;
    });
    setInventory(updatedInventory);

    // 3. Update Customer History & Debt
    if (selectedCustomerId) {
        const customer = customers.find(c => c.id === selectedCustomerId);
        if (customer) {
            const summary = cart.map(i => `${i.quantity}${i.unit} ${i.name}`).join(', ');
            
            const newTransaction: Transaction = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                amount: total,
                summary: summary,
                type: method === 'credit' ? 'credit' : 'sale'
            };
            
            const updatedCustomer = {
                ...customer,
                history: [...customer.history, newTransaction],
                // Add to debt if credit, otherwise debt remains same (or handled via separate payment)
                debt: method === 'credit' ? (customer.debt || 0) + total : (customer.debt || 0)
            };
            
            setCustomers(customers.map(c => c.id === selectedCustomerId ? updatedCustomer : c));
        }
    } else if (method === 'credit') {
        alert("Please select a customer to sell on credit.");
        return;
    }

    // Clear cart
    setCart([]);
    const msg = method === 'credit' ? "Order added to customer debt." : "Order completed successfully!";
    alert(msg);
    speak(`Order completed. Total is ${total}`, voiceEnabled);
  };

  // Helper to get selected product for info display
  const getSelectedProductInfo = () => {
      return inventory.find(p => p.id === selectedId);
  }
  const selectedProduct = getSelectedProductInfo();

  return (
    <div className="space-y-6">
      {showScanner && <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Input Section */}
        <div className="lg:col-span-1 space-y-6">
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
                                    <option key={p.id} value={p.id}>{p.name} ({p.sellingPrice}/{p.unit})</option>
                                ))}
                            </Select>
                         </div>
                         <Button onClick={() => setShowScanner(true)} className="mb-[2px] px-3">
                             <ScanBarcode className="w-5 h-5" />
                         </Button>
                    </div>

                    {/* Product Meta Hint */}
                    {selectedProduct && selectedProduct.shelfId && (
                        <div className="text-xs flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                            <MapPin className="w-3 h-3" /> Location: {selectedProduct.shelfId}
                        </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Quantity" type="number" value={qty} onChange={(e) => setQty(e.target.valueAsNumber)} />
                        <Input label="Discount %" type="number" value={discount} onChange={(e) => setDiscount(e.target.valueAsNumber)} />
                    </div>

                    <Button onClick={addItem} className="w-full flex justify-center items-center gap-2">
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </Button>
                </div>
            </Card>

            <Card>
                 <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${styles.accentText}`}>
                    <User className="w-5 h-5" /> Customer (Optional)
                </h2>
                <Select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)}>
                    <option value="">-- Walk-in Customer --</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                    ))}
                </Select>
                <p className="text-xs opacity-60 mt-2">Select a customer to track history or allow credit sales.</p>
            </Card>
        </div>

        {/* Bill Preview Section */}
        <div className="lg:col-span-2">
            <Card className="min-h-[500px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-xl font-bold flex items-center gap-2 ${styles.accentText}`}>
                        <Receipt className="w-5 h-5" /> Current Bill
                    </h2>
                    <Button variant="secondary" onClick={() => setCart([])} className="text-sm py-2 px-4 h-auto">
                        Clear
                    </Button>
                </div>

                <div className="flex-grow overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-white/10 opacity-70 text-sm">
                                <th className="pb-2">Item</th>
                                <th className="pb-2 text-right">Qty</th>
                                <th className="pb-2 text-right">Price</th>
                                <th className="pb-2 text-right">Disc %</th>
                                <th className="pb-2 text-right">Total</th>
                                <th className="pb-2 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {cart.map(item => {
                                const lineTotal = (item.sellingPrice * item.quantity) * (1 - item.discount/100);
                                return (
                                    <tr key={item.cartId} className="group">
                                        <td className="py-3 font-medium">
                                            {item.name}
                                            {item.shelfId && <div className="text-[10px] opacity-50 flex items-center gap-0.5"><MapPin className="w-2 h-2" />{item.shelfId}</div>}
                                        </td>
                                        <td className="py-3 text-right">
                                            {formatUnit(item.quantity, item.unit, unitSystem)}
                                        </td>
                                        <td className="py-3 text-right">{item.sellingPrice}</td>
                                        <td className="py-3 text-right text-red-500">{item.discount > 0 ? item.discount + '%' : '-'}</td>
                                        <td className="py-3 text-right font-bold">{lineTotal.toFixed(2)}</td>
                                        <td className="py-3 text-center">
                                            <button onClick={() => removeItem(item.cartId)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 p-1">
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {cart.length === 0 && (
                                <tr><td colSpan={6} className="py-12 text-center opacity-50">Cart is empty</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10 space-y-4">
                    <div className="flex justify-between items-center text-xl font-bold">
                        <span>Grand Total</span>
                        <span className={styles.accentText}>{calculateTotal().toFixed(2)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                         <Button variant="secondary" className="flex justify-center gap-2" onClick={handlePrint}>
                            <Printer className="w-4 h-4" /> <span className="hidden md:inline">Print</span>
                        </Button>
                         <Button 
                            className="flex justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-700 border border-green-200 dark:text-green-400 dark:border-green-800"
                            onClick={handleWhatsAppShare}
                            disabled={cart.length === 0}
                            variant="secondary"
                        >
                            <MessageCircle className="w-4 h-4" /> <span className="hidden md:inline">WhatsApp</span>
                        </Button>
                        <Button 
                            className="flex justify-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 border-none"
                            onClick={() => handleCompleteOrder('credit')}
                            disabled={cart.length === 0}
                        >
                            <CreditCard className="w-4 h-4" /> <span className="hidden md:inline">Credit</span>
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
    </div>
  );
};

export default Billing;