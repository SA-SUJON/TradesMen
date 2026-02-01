
export type ThemeType = 'material' | 'glass' | 'neumorphism' | 'fluent';
export type UnitSystem = 'metric' | 'local'; // local = Maund/Seer

export interface BusinessProfile {
  name: string;
  address: string;
  phone: string;
  email?: string;
  gstin?: string; // Tax ID
  logo?: string; // base64
  signature?: string; // base64
  terms?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    googleBusiness?: string;
    tiktok?: string;
    twitter?: string;
    youtube?: string;
    website?: string;
    linkedin?: string;
    pinterest?: string;
  };
}

export interface AuthConfig {
  adminPin: string;
  staffPin: string;
  enableLock: boolean;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string; // The allowed user ID
  isEnabled: boolean;
}

// New AI Configuration Interface
export interface AIConfig {
  temperature: number; // 0.0 to 1.0
  customPersona: string; // "You are a strict accountant..."
  enableSalesRead: boolean;
  enableInventoryRead: boolean;
  enableCustomerRead: boolean;
  enableExpenseRead: boolean;
}

export interface ProductHistoryEvent {
  id: string;
  date: string;
  type: 'create' | 'update' | 'sale' | 'stock' | 'order';
  description: string;
}

export interface Product {
  id: string;
  name: string;
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  onOrder?: number; // Quantity currently ordered from supplier
  unit: string; // 'kg', 'g', 'pc'
  expiryDate?: string; // YYYY-MM-DD
  // Extended Metadata
  barcode?: string;
  shelfId?: string;
  supplierName?: string;
  supplierContact?: string;
  category?: string;
  notes?: string;
  purchaseDate?: string;
  lowStockThreshold?: number;
  // Visual Identity (POS)
  color?: string; // Tailwind class e.g. 'bg-red-200'
  emoji?: string; // e.g. '🍎'
  // GST Fields
  hsnCode?: string;
  gstRate?: number; // 0, 5, 12, 18, 28
  history?: ProductHistoryEvent[];
  // POS Features
  isFavorite?: boolean; // For Quick Grid
}

export interface CartItem extends Product {
  cartId: string;
  quantity: number; 
  discount: number; 
  taxAmount?: number; // Calculated tax
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  summary: string;
  type?: 'sale' | 'payment' | 'credit';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;   // CRM: Physical Address
  gateCode?: string;  // CRM: Entry/Gate Code
  notes?: string;     // CRM: Client Notes
  debt: number;
  creditLimit?: number; // Max debt allowed
  loyaltyPoints?: number; // Rewards System
  history: Transaction[];
}

export interface Supplier {
  id: string;
  name: string; // Company Name
  contactPerson?: string;
  phone: string;
  address?: string;
  gstin?: string;
  notes?: string;
  category?: string; // e.g., 'Dairy', 'Grains'
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string; 
  date: string;
}

export interface Sale {
  id: string;
  invoiceNumber: string; // Sequential ID
  date: string; 
  totalAmount: number;
  totalTax?: number; // GST Total
  totalProfit: number;
  paymentMethod: 'cash' | 'card' | 'bank' | 'upi' | 'stripe' | 'paypal' | 'apple_pay' | 'google_pay' | 'credit';
  paymentReference?: string; // Transaction ID for non-cash
  items: CartItem[];
  customerId?: string;
  pointsEarned?: number;
  pointsRedeemed?: number;
}

export interface Conversion {
  from: string;
  to: string;
  value: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  images?: string[]; // Supports multiple images
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  date: string; // ISO string
  messages: ChatMessage[];
}

export interface OnlineOrderItem {
  productName: string;
  quantity: number;
  price: number;
  unit: string;
}

export interface OnlineOrder {
  id: string;
  orderNumber: string; // e.g. WEB-1001
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OnlineOrderItem[];
  totalAmount: number;
  paymentMethod: 'cod' | 'prepaid';
  paymentStatus: 'pending' | 'paid';
  status: 'new' | 'accepted' | 'shipped' | 'rejected' | 'delivered';
  date: string;
  platform?: string; // e.g., 'Shopify', 'WooCommerce', 'Custom'
}

export interface Delivery {
  id: string;
  orderId: string; // Links to OnlineOrder
  staffId: string;
  status: 'assigned' | 'delivered' | 'failed';
  codAmount: number; // Cash to collect
  proofImage?: string; // base64
  timestamp: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'debt' | 'offer' | 'winback' | 'general';
  message: string;
  targetCount: number;
  date: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface AppDocument {
  id: string;
  title: string;
  type: 'image' | 'text';
  content: string; // base64 or text
  date: string;
  tags?: string[];
}

export interface Staff {
  id: string;
  name: string;
  role: string; // e.g. Helper, Manager, Cleaner
  phone: string;
  salary: number; // Monthly salary
  balance: number; // Pending salary or advances (positive = due to staff, negative = advance taken)
  joinedDate: string;
  isActive: boolean;
}

export interface Attendance {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'half-day' | 'leave';
  checkIn?: string; // ISO timestamp
  checkOut?: string;
}

export interface StaffPayment {
    id: string;
    staffId: string;
    amount: number;
    date: string;
    type: 'salary' | 'advance' | 'bonus';
    note?: string;
}

export interface Cheque {
  id: string;
  number: string;
  partyName: string;
  amount: number;
  date: string; // Due Date
  type: 'issued' | 'received';
  status: 'pending' | 'cleared' | 'bounced';
  bankName?: string;
  note?: string;
  createdAt: string;
}
