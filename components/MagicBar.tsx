import React, { useState, useEffect, useRef } from 'react';
import { useAI } from '../contexts/AIContext';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { Sparkles, Mic, MicOff, Search, ArrowRight } from 'lucide-react';

interface MagicBarProps {
    onActivate: () => void; // Function to switch to Manager tab or open modal
}

const MagicBar: React.FC<MagicBarProps> = ({ onActivate }) => {
    const { sendMessage, isProcessing } = useAI();
    const { theme } = useTheme();
    const styles = getThemeClasses(theme);
    
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onstart = () => setIsListening(true);
                recognition.onresult = (event: any) => {
                    let transcript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        transcript += event.results[i][0].transcript;
                    }
                    setInput(transcript);
                };
                recognition.onend = () => setIsListening(false);
                recognitionRef.current = recognition;
            }
        }
    }, []);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;
        
        onActivate(); // Switch context first
        sendMessage(input);
        setInput('');
    };

    const toggleMic = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setInput('');
            recognitionRef.current.start();
        }
    };

    // Style logic
    const containerClass = theme === 'glass' 
        ? 'bg-white/10 backdrop-blur-md border border-white/20' 
        : theme === 'neumorphism' 
            ? 'bg-[#E0E5EC] dark:bg-[#292d3e] shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_6px_#1f2330,inset_-3px_-3px_6px_#33374a]'
            : theme === 'material'
                ? 'bg-[#F3EDF7] dark:bg-[#2B2930] text-[#1D192B] dark:text-[#E6E1E5]'
                : 'bg-white border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700';

    const inputClass = theme === 'glass'
        ? 'text-white placeholder-white/60'
        : 'text-slate-800 placeholder-slate-400 dark:text-white dark:placeholder-gray-500';

    return (
        <form onSubmit={handleSubmit} className={`w-full relative flex items-center rounded-full px-2 py-1 transition-all group ${containerClass}`}>
            <div className={`p-2 rounded-full ${styles.accentText}`}>
                <Sparkles className="w-5 h-5" />
            </div>
            
            <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Manager AI..."
                className={`flex-grow bg-transparent outline-none px-2 py-2 text-base ${inputClass}`}
            />

            <div className="flex items-center gap-1">
                 <button 
                    type="button"
                    onClick={toggleMic}
                    className={`p-2 rounded-full transition-all hover:bg-black/5 dark:hover:bg-white/10 ${isListening ? 'text-red-500 animate-pulse' : 'opacity-50 hover:opacity-100'}`}
                >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                {input.trim() && (
                    <button 
                        type="submit"
                        className={`p-2 rounded-full ${theme === 'material' ? 'bg-[#6750A4] text-white dark:bg-[#D0BCFF] dark:text-[#381E72]' : 'bg-blue-600 text-white'}`}
                    >
                        <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </form>
    );
};

export default MagicBar;