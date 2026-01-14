import React, { useState } from 'react';
import { Product, CartItem, Customer, Transaction } from '../types';
import { Card, Input, Button, Select } from './ui/BaseComponents';
import { ShoppingCart, Plus, Trash, Receipt, Printer, User, Save, Check } from 'lucide-react';
import { getThemeClasses } from '../utils/themeUtils';
import { useTheme } from '../contexts/ThemeContext';

interface BillingProps {
  inventory: Product[];
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
}

const Billing: React.FC<BillingProps> = ({ inventory, cart, setCart, customers, setCustomers }) => {
  const { theme } = useTheme();
  const styles = getThemeClasses(theme);
  
  // Adding Item State
  const [selectedId, setSelectedId] = useState('');
  const [qty, setQty] = useState<number | ''>(1);
  const [discount, setDiscount] = useState<number | ''>(0);
  
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
    // Reset inputs
    setQty(1);
    setDiscount(0);
    setSelectedId('');
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

  const handlePrint = () => {
      window.print();
  }

  const handleCompleteOrder = () => {
    const total = calculateTotal();
    
    // Save to customer history if selected
    if (selectedCustomerId) {
        const customer = customers.find(c => c.id === selectedCustomerId);
        if (customer) {
            const summary = cart.map(i => `${i.quantity}${i.unit} ${i.name}`).join(', ');
            const newTransaction: Transaction = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                amount: total,
                summary: summary
            };
            
            const updatedCustomer = {
                ...customer,
                history: [...customer.history, newTransaction]
            };
            
            setCustomers(customers.map(c => c.id === selectedCustomerId ? updatedCustomer : c));
        }
    }

    // Clear cart
    setCart([]);
    alert("Order completed successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Input Section */}
        <div className="lg:col-span-1 space-y-6">
             <Card>
                <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${styles.accentText}`}>
                    <Plus className="w-5 h-5" /> Add to Bill
                </h2>
                <div className="space-y-4">
                    <Select label="Product" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                        <option value="">-- Select Item --</option>
                        {inventory.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.sellingPrice}/{p.unit})</option>
                        ))}
                    </Select>
                    
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
                <p className="text-xs opacity-60 mt-2">Select a customer to save this transaction to their history.</p>
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
                                        <td className="py-3 font-medium">{item.name}</td>
                                        <td className="py-3 text-right">{item.quantity} {item.unit}</td>
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
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="secondary" className="w-full flex justify-center gap-2" onClick={handlePrint}>
                            <Printer className="w-4 h-4" /> Print
                        </Button>
                        <Button className="w-full flex justify-center gap-2 bg-green-600 hover:bg-green-700 text-white" onClick={handleCompleteOrder} disabled={cart.length === 0}>
                            <Check className="w-4 h-4" /> Complete Order
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
