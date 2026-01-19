
import { createClient } from '@supabase/supabase-js';

// Get credentials from local storage (set via Settings page)
const getSupabaseCredentials = () => {
    if (typeof window === 'undefined') return { url: '', key: '' };
    return {
        url: localStorage.getItem('tradesmen-supabase-url') || '',
        key: localStorage.getItem('tradesmen-supabase-key') || ''
    };
};

export const initSupabase = () => {
    const { url, key } = getSupabaseCredentials();
    if (url && key) {
        return createClient(url, key);
    }
    return null;
};

// Simple helper to check if configured
export const isSupabaseConfigured = () => {
    const { url, key } = getSupabaseCredentials();
    return !!url && !!key;
};
