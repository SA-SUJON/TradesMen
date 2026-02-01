
import { useState, useEffect } from 'react';
import { encryptData, decryptData, SENSITIVE_KEYS } from '../utils/security';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Check if this key requires security
  const isSensitive = SENSITIVE_KEYS.some(k => key.includes(k));

  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      if (isSensitive) {
          // Attempt decrypt
          const decrypted = decryptData(item);
          return decrypted !== null ? decrypted : initialValue;
      }

      return JSON.parse(item);
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      setStoredValue((prevValue) => {
        const valueToStore = typeof value === 'function' 
          ? (value as (val: T) => T)(prevValue) 
          : value;
        
        if (typeof window !== 'undefined') {
            if (isSensitive) {
                const encrypted = encryptData(valueToStore);
                window.localStorage.setItem(key, encrypted);
            } else {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        }
        
        return valueToStore;
      });
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };

  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [storedValue, setValue];
}

export default useLocalStorage;
