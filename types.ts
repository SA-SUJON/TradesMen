
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
}

export interface ProductHistoryEvent {
  id: string;
  date: string;
  type: 'create' | 'update' | 'sale' | 'stock';
  description: string;
}

export interface Product {
  id: string;
  name: string;
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
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
  // GST Fields
  hsnCode?: string;
  gstRate?: number; // 0, 5, 12, 18, 28
  history?: ProductHistoryEvent[]; 
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
  paymentMethod: 'cash' | 'credit' | 'upi' | 'bank';
  items: CartItem[];
  customerId?: string;
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
  image?: string; 
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  date: string; // ISO string
  messages: ChatMessage[];
}
