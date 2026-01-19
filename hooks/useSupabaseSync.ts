
import { useEffect, useRef, useState } from 'react';
import { initSupabase, isSupabaseConfigured } from '../utils/supabaseClient';

/**
 * Hook to sync a specific key of data to Supabase.
 * It uses a "Last Write Wins" strategy on the 'app_storage' table.
 */
export function useSupabaseSync<T>(
    key: string, 
    localValue: T, 
    setLocalValue: (val: T) => void
) {
    const [status, setStatus] = useState<'idle' | 'syncing' | 'error' | 'synced'>('idle');
    const isFirstMount = useRef(true);
    const timeoutRef = useRef<any>(null);

    // 1. On Mount: Fetch from Supabase
    useEffect(() => {
        if (!isSupabaseConfigured()) return;

        const fetchRemoteData = async () => {
            const supabase = initSupabase();
            if (!supabase) return;

            setStatus('syncing');
            try {
                // We assume a table 'app_storage' with columns: key (text, pk), value (jsonb)
                const { data, error } = await supabase
                    .from('app_storage')
                    .select('value')
                    .eq('key', key)
                    .single();

                if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
                    console.error("Supabase Fetch Error:", error);
                    setStatus('error');
                } else if (data) {
                    // If remote data exists, update local state
                    // NOTE: In a complex app, we'd compare timestamps. 
                    // Here we assume Cloud is Truth on load.
                    setLocalValue(data.value);
                    setStatus('synced');
                } else {
                    setStatus('idle');
                }
            } catch (err) {
                console.error(err);
                setStatus('error');
            }
        };

        fetchRemoteData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount

    // 2. On Change: Push to Supabase (Debounced)
    useEffect(() => {
        if (!isSupabaseConfigured()) return;
        
        // Skip the initial render to prevent overwriting cloud with potentially empty local state before fetch completes
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }

        setStatus('syncing');
        
        // Clear existing timeout to debounce
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(async () => {
            const supabase = initSupabase();
            if (!supabase) return;

            try {
                const { error } = await supabase
                    .from('app_storage')
                    .upsert({ key, value: localValue }, { onConflict: 'key' });

                if (error) {
                    console.error("Supabase Save Error:", error);
                    setStatus('error');
                } else {
                    setStatus('synced');
                }
            } catch (err) {
                console.error(err);
                setStatus('error');
            }
        }, 2000); // 2 second debounce

        return () => clearTimeout(timeoutRef.current);
    }, [localValue, key]);

    return status;
}
