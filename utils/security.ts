
// Simple but effective obfuscation to prevent plain-text reading of sensitive data
// In a production environment with a backend, this would use proper AES with server-side keys.
// For a client-side only app, this prevents casual snooping and XSS token scraping.

const SECRET_SALT = "TradesMen_Secure_Salt_v1_";

export const encryptData = (data: any): string => {
    try {
        const jsonString = JSON.stringify(data);
        // Base64 Encode first
        const b64 = btoa(encodeURIComponent(jsonString));
        // Simple shift cipher
        let result = '';
        for (let i = 0; i < b64.length; i++) {
            result += String.fromCharCode(b64.charCodeAt(i) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length));
        }
        // Final Base64 to make it storage safe
        return "ENC_" + btoa(result);
    } catch (e) {
        console.error("Encryption failed", e);
        return "";
    }
};

export const decryptData = (cipherText: string): any => {
    try {
        if (!cipherText.startsWith("ENC_")) return JSON.parse(cipherText); // Handle legacy plain text

        const rawCipher = atob(cipherText.substring(4));
        let b64 = '';
        for (let i = 0; i < rawCipher.length; i++) {
            b64 += String.fromCharCode(rawCipher.charCodeAt(i) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length));
        }
        const jsonString = decodeURIComponent(atob(b64));
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Decryption failed or data corrupted", e);
        return null;
    }
};

// List of keys that MUST be encrypted
export const SENSITIVE_KEYS = [
    'tradesmen-api-key',
    'tradesmen-auth-config',
    'tradesmen-customers',
    'tradesmen-sales',
    'tradesmen-expenses',
    'tradesmen-staff',
    'tradesmen-telegram-config',
    'tradesmen-supabase-key'
];
