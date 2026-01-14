
import { UnitSystem, CartItem } from "../types";

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
    if (unit !== 'kg' && unit !== 'g') return `${value} ${unit}`;

    // Normalize to KG first
    const valInKg = unit === 'g' ? value / 1000 : value;

    if (system === 'local') {
        // Local System: 1 Maund = 40 KG, 1 Seer = 1 KG (Common Approximation in some trades, or 1/40 Maund)
        // Let's use: 40kg = 1 Maund.
        if (valInKg >= 40) {
            const maunds = valInKg / 40;
            return `${maunds.toFixed(2)} Maund`;
        } else {
            // Display as Seer (where 1 Seer ~= 1 KG roughly or exactly depending on region)
            // We will assume 1 Seer = 1 KG for simplicity of display in this context 
            // OR we can leave it as KG if less than a Maund. 
            // Let's stick to showing KG for smaller amounts but labeling it appropriately if needed.
            // Actually, usually users want to see Maund for bulk.
            return `${valInKg.toFixed(2)} kg`; // Or 'Seer' if strictly local
        }
    }

    // Metric System
    if (valInKg < 1 && unit === 'kg') {
        return `${(valInKg * 1000).toFixed(0)} g`;
    }
    return `${valInKg.toFixed(2)} kg`;
};

// Helper to convert inputs for calculation
// Returns factor to multiply with base price (assuming base price is per KG)
export const getUnitMultiplier = (unit: string): number => {
    if (unit === 'g') return 0.001;
    if (unit === 'maund') return 40;
    return 1; // kg or pc
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
        const qtyDisplay = item.unit === 'g' && item.quantity >= 1000 
            ? `${item.quantity/1000}kg` 
            : `${item.quantity}${item.unit}`;
            
        msg += `${item.name} x ${qtyDisplay} = ${itemTotal.toFixed(2)}\n`;
    });
    
    msg += `------------------------\n`;
    msg += `*GRAND TOTAL: ${total.toFixed(2)}*\n`;
    msg += `\nThank you for your business! 🙏`;
    return msg;
};
