
export type ThemeType = 'material' | 'glass' | 'neumorphism' | 'fluent';
export type UnitSystem = 'metric' | 'local'; // local = Maund/Seer

export interface Product {
  id: string;
  name: string;
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  unit: string; // 'kg', 'g', 'pc'
  expiryDate?: string; // YYYY-MM-DD
  // Extended Metadata
  barcode?: string; // New field for scanning
  shelfId?: string; // New field for Shelf Location
  supplierName?: string;
  supplierContact?: string;
  category?: string;
  notes?: string;
  purchaseDate?: string;
  lowStockThreshold?: number;
}

export interface CartItem extends Product {
  cartId: string;
  quantity: number; // in unit (e.g., 1.5 for 1.5kg)
  discount: number; // percentage
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
  debt: number; // Total outstanding debt
  history: Transaction[];
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string; // Rent, Utilities, Salary, Misc
  date: string;
}

export interface Sale {
  id: string;
  date: string; // ISO String
  totalAmount: number;
  totalProfit: number;
  paymentMethod: 'cash' | 'credit';
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
  image?: string; // base64 string for OCR previews
  isError?: boolean;
}