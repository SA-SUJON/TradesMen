
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, ShieldCheck, Delete } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { AuthConfig } from '../types';

interface LockScreenProps {
    isLocked: boolean;
    config: AuthConfig;
    onUnlock: (role: 'admin' | 'staff') => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ isLocked, config, onUnlock }) => {
    const { theme } = useTheme();
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const handleNumClick = (num: string) => {
        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
            if (newPin.length === 4) {
                validatePin(newPin);
            }
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
        setError(false);
    };

    const validatePin = (inputPin: string) => {
        // Simple check - in production use hashed pins
        if (inputPin === config.adminPin) {
            onUnlock('admin');
            setPin('');
        } else if (inputPin === config.staffPin) {
            onUnlock('staff');
            setPin('');
        } else {
            setError(true);
            setTimeout(() => {
                setPin('');
                setError(false);
            }, 500);
        }
    };

    // Keyboard Event Listener
    useEffect(() => {
        if (!isLocked) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key >= '0' && e.key <= '9') {
                handleNumClick(e.key);
            } else if (e.key === 'Backspace') {
                handleDelete();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLocked, pin]); // Dependency on pin to ensure state updates correctly

    if (!isLocked) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-center p-4 text-white"
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-sm"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/50">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-1">TradesMen Pro</h2>
                    <p className="opacity-60 text-sm">Enter PIN to access</p>
                </div>

                {/* PIN Display */}
                <div className="flex justify-center gap-4 mb-8">
                    {[0, 1, 2, 3].map(i => (
                        <div 
                            key={i} 
                            className={`w-4 h-4 rounded-full transition-all duration-200 ${
                                i < pin.length 
                                    ? error ? 'bg-red-500 scale-125' : 'bg-blue-500 scale-110' 
                                    : 'bg-gray-700'
                            }`}
                        />
                    ))}
                </div>

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                            key={num}
                            onClick={() => handleNumClick(num.toString())}
                            className="h-16 rounded-2xl bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all text-2xl font-bold shadow-lg"
                        >
                            {num}
                        </button>
                    ))}
                    <div className="flex items-center justify-center opacity-50">
                        <User className="w-6 h-6" />
                    </div>
                    <button
                        onClick={() => handleNumClick('0')}
                        className="h-16 rounded-2xl bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all text-2xl font-bold shadow-lg"
                    >
                        0
                    </button>
                    <button
                        onClick={handleDelete}
                        className="h-16 rounded-2xl bg-transparent hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center text-red-400"
                    >
                        <Delete className="w-8 h-8" />
                    </button>
                </div>

                <div className="text-center opacity-30 text-xs">
                    Protected by SecureGuard™
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LockScreen;
