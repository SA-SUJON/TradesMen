
import { UnitSystem, CartItem } from "../types";

export const UNIT_OPTIONS = [
  { value: 'kg', label: 'KILOGRAMS (kg)' },
  { value: 'g', label: 'GRAMMES (g)' },
  { value: 'l', label: 'LITER (l)' },
  { value: 'ml', label: 'MILILITRE (ml)' },
  { value: 'pc', label: 'PIECES (pc)' },
  { value: 'bags', label: 'BAGS' },
  { value: 'bottles', label: 'BOTTLES' },
  { value: 'box', label: 'BOX' },
  { value: 'bundles', label: 'BUNDLES' },
  { value: 'cans', label: 'CANS' },
  { value: 'cartons', label: 'CARTONS' },
  { value: 'dozens', label: 'DOZENS' },
  { value: 'm', label: 'METERS' },
  { value: 'nos', label: 'NUMBERS' },
  { value: 'packs', label: 'PACKS' },
  { value: 'pairs', label: 'PAIRS' },
  { value: 'quintal', label: 'QUINTAL' },
  { value: 'rolls', label: 'ROLLS' },
  { value: 'sq_ft', label: 'SQUARE FEET' },
  { value: 'sq_m', label: 'SQUARE METRES' },
  { value: 'tablets', label: 'TABLETS' },
];

// Text to Speech Utility
export const speak = (text: string, enabled: boolean = true) => {
    if (!enabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Cancel previous utterances to avoid queue buildup
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a natural sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural')));
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
};

// Unit Conversion Utility
// Assumes base unit is 'kg' for weight-based items
export const formatUnit = (value: number, unit: string, system: UnitSystem): string => {
    // Volume Handling
    if (unit === 'l') return `${value.toFixed(2)} L`;
    if (unit === 'ml') {
        if (value >= 1000) return `${(value / 1000).toFixed(2)} L`;
        return `${value} ml`;
    }

    // Weight Handling
    if (unit === 'kg' || unit === 'g') {
        // Normalize to KG first
        const valInKg = unit === 'g' ? value / 1000 : value;

        if (system === 'local') {
            // Local System: 1 Maund = 40 KG
            if (valInKg >= 40) {
                const maunds = valInKg / 40;
                return `${maunds.toFixed(2)} Maund`;
            } else {
                return `${valInKg.toFixed(2)} kg`; 
            }
        }

        // Metric System
        if (valInKg < 1 && valInKg > 0) {
            return `${(valInKg * 1000).toFixed(0)} g`;
        }
        return `${valInKg.toFixed(2)} kg`;
    }

    // Default for others (Pieces, Boxes, etc.)
    return `${value} ${unit}`;
};

// Helper to convert inputs for calculation
// Returns factor to multiply with base price (assuming base price is per KG)
export const getUnitMultiplier = (unit: string): number => {
    if (unit === 'g') return 0.001;
    if (unit === 'ml') return 0.001;
    if (unit === 'maund') return 40;
    if (unit === 'quintal') return 100;
    return 1; // kg, l, pc, etc.
};

// WhatsApp Integration Helpers
export const openWhatsApp = (phone: string, text: string) => {
    if (!phone) {
        alert("Phone number is required to send WhatsApp message.");
        return;
    }
    // Basic cleaning: remove spaces, dashes, parentheses. 
    // Ideally should ensure country code exists, but we'll try raw first or assume user inputs it.
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    window.open(url, '_blank');
};

export const formatBillMessage = (cart: CartItem[], total: number, customerName?: string) => {
    const date = new Date().toLocaleDateString();
    let msg = `🧾 *SHOP INVOICE* \n`;
    if(customerName) msg += `Customer: ${customerName}\n`;
    msg += `Date: ${date}\n`;
    msg += `------------------------\n`;
    
    cart.forEach(item => {
        const itemTotal = (item.sellingPrice * item.quantity) * (1 - item.discount/100);
        
        let qtyDisplay = `${item.quantity} ${item.unit}`;
        // Smart Format for Weight/Volume
        if ((item.unit === 'g' || item.unit === 'ml') && item.quantity >= 1000) {
             const baseUnit = item.unit === 'g' ? 'kg' : 'L';
             qtyDisplay = `${item.quantity/1000}${baseUnit}`;
        }
            
        msg += `${item.name} x ${qtyDisplay} = ${itemTotal.toFixed(2)}\n`;
    });
    
    msg += `------------------------\n`;
    msg += `*GRAND TOTAL: ${total.toFixed(2)}*\n`;
    msg += `\nThank you for your business! 🙏`;
    return msg;
};