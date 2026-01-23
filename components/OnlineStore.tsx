
import React, { useState, useEffect } from 'react';
import { OnlineOrder, Product, Sale, CartItem } from '../types';
import { Card, Button, Input } from './ui/BaseComponents';
import { Globe, RefreshCw, CheckCircle, XCircle, Truck, ShoppingBag, AlertCircle, Copy, Code, Eye, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { initSupabase, isSupabaseConfigured } from '../utils/supabaseClient';
import useLocalStorage from '../hooks/useLocalStorage';

interface OnlineStoreProps {
  inventory: Product[];
  setInventory: (inv: Product[] | ((val: Product[]) => Product[])) => void;
  sales: Sale[];
  setSales: (sales: Sale[] | ((val: Sale[]) => Sale[])) => void;
}

// Mock Data for Simulation Mode
const MOCK_ORDERS: OnlineOrder[] = [
    {
        id: 'mock-1',
        orderNumber: 'WEB-1024',
        customerName: 'Rahul Sharma',
        customerPhone: '9876543210',
        customerAddress: 'Flat 402, Green Valley Apts, MG Road',
        items: [
            { productName: 'Basmati Rice', quantity: 5, price: 120, unit: 'kg' },
            { productName: 'Sugar', quantity: 2, price: 45, unit: 'kg' }
        ],
        totalAmount: 690,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        status: 'new',
        date: new Date().toISOString(),
        platform: 'Website'
    }
];

const OnlineStore: React.FC<OnlineStoreProps> = ({ inventory, setInventory, sales, setSales }) => {
  const { theme, unitSystem } = useTheme();
  const styles = getThemeClasses(theme);
  
  const [activeTab, setActiveTab] = useState<'orders' | 'integration'>('orders');
  const [orderFilter, setOrderFilter] = useState<'new' | 'active' | 'history'>('new');
  const [orders, setOrders] = useLocalStorage<OnlineOrder[]>('tradesmen-online-orders', []);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Sync Logic
  const fetchOrders = async () => {
      if (!isSupabaseConfigured()) {
          // If no Supabase, allow simulation with mock data if empty
          if (orders.length === 0) {
            setOrders(MOCK_ORDERS);
          }
          return;
      }

      setIsLoading(true);
      const supabase = initSupabase();
      if (!supabase) return;

      try {
          // Fetch from 'online_orders' table in Supabase
          const { data, error } = await supabase
              .from('online_orders')
              .select('*')
              .order('date', { ascending: false });
          
          if (!error && data) {
              setOrders(data);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
      fetchOrders();
      // Poll every 30 seconds if real DB
      if (isSupabaseConfigured()) {
          const interval = setInterval(fetchOrders, 30000);
          return () => clearInterval(interval);
      }
  }, []);

  // Action Handlers
  const handleAcceptOrder = (order: OnlineOrder) => {
      // 1. Check & Deduct Stock
      let stockIssue = false;
      const newInventory = [...inventory];
      const matchedItems: CartItem[] = [];

      order.items.forEach(orderItem => {
          // Fuzzy match by name
          const prodIndex = newInventory.findIndex(p => p.name.toLowerCase().includes(orderItem.productName.toLowerCase()));
          
          if (prodIndex > -1) {
              const prod = newInventory[prodIndex];
              if (prod.stock >= orderItem.quantity) {
                  newInventory[prodIndex] = { ...prod, stock: prod.stock - orderItem.quantity };
                  // Create CartItem for Sales Record
                  matchedItems.push({
                      ...prod,
                      cartId: Math.random().toString(),
                      quantity: orderItem.quantity,
                      discount: 0,
                      sellingPrice: orderItem.price // Use price from online order or override? usually use order price
                  });
              } else {
                  stockIssue = true;
                  alert(`Insufficient stock for ${orderItem.productName}. Available: ${prod.stock}`);
              }
          } else {
              // Item not found in inventory logic - handle as custom item
              alert(`Warning: Item "${orderItem.productName}" not found in inventory. Stock will not be deducted.`);
              // We still add to sales for record
          }
      });

      if (stockIssue) return;

      // 2. Update Inventory
      setInventory(newInventory);

      // 3. Create Sale Record
      const newSale: Sale = {
          id: Date.now().toString(),
          invoiceNumber: `WEB-${Date.now().toString().slice(-4)}`,
          date: new Date().toISOString(),
          totalAmount: order.totalAmount,
          totalProfit: 0, // Need buy price to calc
          paymentMethod: order.paymentMethod === 'prepaid' ? 'bank' : 'cash', // Assumption
          items: matchedItems,
          customerId: 'ONLINE'
      };
      setSales(prev => [...prev, newSale]);

      // 4. Update Order Status
      updateOrderStatus(order.id, 'accepted');
  };

  const updateOrderStatus = async (id: string, status: OnlineOrder['status']) => {
      // Local Update
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));

      // Remote Update
      if (isSupabaseConfigured()) {
          const supabase = initSupabase();
          if(supabase) {
              await supabase.from('online_orders').update({ status }).eq('id', id);
          }
      }
  };

  // Filter Logic
  const filteredOrders = orders.filter(o => {
      if (orderFilter === 'new') return o.status === 'new';
      if (orderFilter === 'active') return o.status === 'accepted';
      if (orderFilter === 'history') return o.status === 'rejected' || o.status === 'delivered';
      return false;
  });

  const IntegrationTab = () => (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <Card className="bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30">
              <h3 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5" /> Connect External Website
              </h3>
              <p className="text-sm opacity-80 mb-4">
                  To send orders from your website (Shopify, WooCommerce, Custom HTML/React) to TradesMen, 
                  you need to connect them to the same <strong>Supabase Database</strong>.
              </p>
              <div className="flex items-center gap-2">
                   <div className={`px-3 py-1 rounded-full text-xs font-bold ${isSupabaseConfigured() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                       {isSupabaseConfigured() ? 'Database Connected' : 'Database Not Connected'}
                   </div>
                   {!isSupabaseConfigured() && <span className="text-xs opacity-60">Go to Settings > Manager to setup Supabase.</span>}
              </div>
          </Card>

          <Card>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-500" /> Integration Code (JavaScript / React)
              </h3>
              <p className="text-sm opacity-60 mb-4">
                  Copy this code to your website's "Checkout" or "Place Order" function.
              </p>
              
              <div className="bg-gray-900 text-gray-200 p-4 rounded-xl text-xs font-mono overflow-x-auto relative group">
                  <button 
                    onClick={() => navigator.clipboard.writeText(integrationCode)}
                    className="absolute top-2 right-2 p-2 bg-white/10 rounded hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy Code"
                  >
                      <Copy className="w-4 h-4 text-white" />
                  </button>
<pre>{integrationCode}</pre>
              </div>
          </Card>

          <Card>
              <h3 className="font-bold mb-4">Database Schema</h3>
              <p className="text-sm opacity-60 mb-2">Run this SQL in your Supabase SQL Editor to create the orders table:</p>
              <div className="bg-gray-900 text-gray-200 p-4 rounded-xl text-xs font-mono overflow-x-auto">
<pre>{`create table online_orders (
  id text primary key,
  order_number text,
  customer_name text,
  customer_phone text,
  customer_address text,
  items jsonb, -- Array of {productName, quantity, price, unit}
  total_amount numeric,
  payment_method text, -- 'cod' or 'prepaid'
  payment_status text, -- 'pending' or 'paid'
  status text, -- 'new', 'accepted', 'rejected', 'delivered'
  date timestamptz default now(),
  platform text
);

-- Enable RLS (Optional, for security)
alter table online_orders enable row level security;
create policy "Public Insert" on online_orders for insert with check (true);
create policy "Public Read" on online_orders for select using (true);
create policy "Public Update" on online_orders for update using (true);
`}</pre>
              </div>
          </Card>
      </div>
  );

  return (
    <div className="space-y-6 pb-24">
        {/* Header Tabs */}
        <div className="flex justify-between items-center">
             <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl">
                <button 
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-white shadow text-blue-600 dark:bg-gray-800 dark:text-blue-400' : 'opacity-60'}`}
                >
                    <ShoppingBag className="w-4 h-4" /> Orders
                </button>
                <button 
                    onClick={() => setActiveTab('integration')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'integration' ? 'bg-white shadow text-purple-600 dark:bg-gray-800 dark:text-purple-400' : 'opacity-60'}`}
                >
                    <Code className="w-4 h-4" /> Integration
                </button>
            </div>
            
            {/* Refresh Button Removed here as per user request */}
        </div>

        {activeTab === 'integration' ? <IntegrationTab /> : (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                {/* Order Status Filters */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    <button onClick={() => setOrderFilter('new')} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap border ${orderFilter === 'new' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10'}`}>
                        New Requests
                        {orders.filter(o => o.status === 'new').length > 0 && <span className="ml-2 bg-white text-blue-600 px-1.5 rounded-full text-xs">{orders.filter(o => o.status === 'new').length}</span>}
                    </button>
                    <button onClick={() => setOrderFilter('active')} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap border ${orderFilter === 'active' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10'}`}>
                        Processing
                    </button>
                    <button onClick={() => setOrderFilter('history')} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap border ${orderFilter === 'history' ? 'bg-gray-600 text-white border-gray-600' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10'}`}>
                        History
                    </button>
                </div>

                <div className="space-y-4">
                    {filteredOrders.length > 0 ? filteredOrders.map(order => (
                        <motion.div
                            key={order.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`${styles.card} relative overflow-hidden`}
                        >
                            {/* Status Bar */}
                            <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                                order.status === 'new' ? 'bg-blue-500' :
                                order.status === 'accepted' ? 'bg-yellow-500' :
                                order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'
                            }`} />

                            <div className="p-4 pl-6">
                                {/* Header Row */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-lg">{order.orderNumber}</span>
                                            {order.paymentStatus === 'paid' && (
                                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">PAID</span>
                                            )}
                                            {order.paymentMethod === 'cod' && (
                                                <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">COD</span>
                                            )}
                                        </div>
                                        <div className="text-sm font-bold mt-1">{order.customerName}</div>
                                        <div className="text-xs opacity-60 flex items-center gap-2">
                                            <span>{new Date(order.date).toLocaleString()}</span>
                                            <span>•</span>
                                            <span>{order.platform || 'Website'}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black">{order.totalAmount}</div>
                                        <div className="text-xs opacity-60">{order.items.length} Items</div>
                                    </div>
                                </div>

                                {/* Collapsible Details */}
                                <AnimatePresence>
                                    {(expandedOrder === order.id || order.status === 'new') && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-dashed border-gray-200 dark:border-white/10 pt-4 mb-4"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <div className="text-xs font-bold opacity-50 uppercase mb-2">Shipping Details</div>
                                                    <p className="text-sm leading-relaxed opacity-80">
                                                        {order.customerAddress}<br/>
                                                        Ph: {order.customerPhone}
                                                    </p>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold opacity-50 uppercase mb-2">Order Items</div>
                                                    <ul className="space-y-1">
                                                        {order.items.map((item, i) => (
                                                            <li key={i} className="text-sm flex justify-between">
                                                                <span>{item.productName} <span className="opacity-50 text-xs">x{item.quantity}</span></span>
                                                                <span className="font-mono">{item.price * item.quantity}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                
                                {/* Actions */}
                                <div className="flex justify-between items-center pt-2 gap-3">
                                    <button 
                                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                        className="text-xs font-bold opacity-50 flex items-center gap-1 hover:opacity-100"
                                    >
                                        {expandedOrder === order.id ? 'Show Less' : 'Show Details'} {expandedOrder === order.id ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                                    </button>

                                    <div className="flex gap-2">
                                        {order.status === 'new' && (
                                            <>
                                                <Button onClick={() => updateOrderStatus(order.id, 'rejected')} className="bg-red-50 text-red-600 hover:bg-red-100 border-none h-8 px-3 text-xs">
                                                    Reject
                                                </Button>
                                                <Button onClick={() => handleAcceptOrder(order)} className="bg-blue-600 text-white hover:bg-blue-700 h-8 px-4 text-xs">
                                                    Accept Order
                                                </Button>
                                            </>
                                        )}
                                        {order.status === 'accepted' && (
                                            <Button onClick={() => updateOrderStatus(order.id, 'delivered')} className="bg-green-600 text-white hover:bg-green-700 h-8 px-4 text-xs flex items-center gap-2">
                                                <Truck className="w-3 h-3" /> Mark Delivered
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="text-center py-12 opacity-50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No orders in this category.</p>
                            {!isSupabaseConfigured() && (
                                <p className="text-xs mt-2 text-orange-500 flex items-center justify-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> DB Not Connected (Showing Mock Data)
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

// Code Snippet for User
const integrationCode = `
// 1. Install supabase-js
// npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js'

// 2. Initialize (Get URL/Key from Settings > Manager)
const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_KEY')

// 3. Call this function when user places an order
async function pushOrderToTradesMen(customerData, cartItems, total) {
  
  const orderPayload = {
    id: Date.now().toString(), // Or use UUID
    order_number: 'WEB-' + Math.floor(Math.random() * 10000),
    customer_name: customerData.name,
    customer_phone: customerData.phone,
    customer_address: customerData.address,
    items: cartItems.map(item => ({
       productName: item.name, 
       quantity: item.qty, 
       price: item.price,
       unit: item.unit
    })),
    total_amount: total,
    payment_method: 'cod', // or 'prepaid'
    payment_status: 'pending',
    status: 'new', // Initial status
    platform: 'MyWebsite'
  }

  const { data, error } = await supabase
    .from('online_orders')
    .insert([orderPayload])

  if (error) console.error('Error sending order:', error)
  else console.log('Order sent to TradesMen!')
}
`;

export default OnlineStore;
