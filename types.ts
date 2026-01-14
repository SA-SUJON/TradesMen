
export type ThemeType = 'material' | 'glass' | 'neumorphism' | 'fluent';

export interface Product {
  id: string;
  name: string;
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  unit: string; // 'kg', 'g', 'pc'
  expiryDate?: string; // YYYY-MM-DD
}

export interface CartItem extends Product {
  cartId: string;
  quantity: number; // in unit (e.g., 1.5 for 1.5kg)
  discount: number; // percentage
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
