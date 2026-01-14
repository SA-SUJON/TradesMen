export type ThemeType = 'material' | 'glass' | 'neumorphism' | 'fluent';

export interface Product {
  id: string;
  name: string;
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  unit: string; // 'kg', 'g', 'pc'
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
