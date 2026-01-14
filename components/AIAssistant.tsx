import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../contexts/AIContext';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Camera, Image as ImageIcon, Loader2, Mic, MicOff } from 'lucide-react';
import { Button, Card } from './ui/BaseComponents';

interface ChatInterfaceProps {
    variant?: 'modal' | 'page';
    onClose?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ variant = 'modal', onClose }) => {
    const { messages, sendMessage, isProcessing } = useAI();
    const { theme } = useTheme();
    const styles = getThemeClasses(theme);
    
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current = recognition;
            }
        }
    }, []);

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage(input);
        setInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            sendMessage("Please scan this memo and add items to inventory.", base64String);
        };
        reader.readAsDataURL(file);
        }
    };

    const handleMicClick = () => {
        if (!recognitionRef.current) {
            alert("Voice recognition not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setInput('');
            recognitionRef.current.start();
        }
    };

    // Adjusted container classes for better mobile fit
    const containerClasses = variant === 'modal' 
        ? `w-[90vw] md:w-[400px] h-[500px] flex flex-col overflow-hidden shadow-2xl ${
            theme === 'glass' ? 'bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl' :
            theme === 'neumorphism' ? 'bg-[#E0E5EC] rounded-2xl border border-white/40' :
            'bg-white rounded-2xl border border-gray-200'
          }`
        : `w-full h-[calc(100dvh-220px)] md:h-[calc(100vh-200px)] flex flex-col overflow-hidden shadow-sm ${styles.card} p-0`;

    // Determine input styling based on theme
    const inputStyles = theme === 'glass' 
        ? 'bg-white/10 border border-white/10 focus:bg-white/20 text-white placeholder-white/50' 
        : theme === 'neumorphism'
            ? 'bg-[#E0E5EC] shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff] text-slate-700 placeholder-slate-400'
            : theme === 'material'
                ? 'bg-[#E7E0EC] focus:bg-[#EADDFF] text-slate-900 placeholder-slate-500'
                : 'bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 text-gray-800 placeholder-gray-400'; // Fluent/Default

    return (
        <div className={containerClasses}>
            {/* Header */}
            <div className={`p-4 border-b ${theme === 'glass' ? 'border-white/10' : 'border-gray-100 dark:border-white/10'} flex items-center gap-2`}>
              <Sparkles className={`w-5 h-5 ${styles.accentText}`} />
              <h3 className={`font-bold ${theme === 'glass' ? 'text-white' : ''}`}>Manager</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold ml-auto">Gemini 3 Flash</span>
              {variant === 'modal' && onClose && (
                  <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100">
                      <X className="w-5 h-5" />
                  </button>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? `${theme === 'material' ? 'bg-[#6750A4]' : 'bg-blue-600'} text-white rounded-br-none`
                        : `${theme === 'glass' ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800'} rounded-bl-none`
                    } ${msg.isError ? 'bg-red-100 text-red-600' : ''}`}
                  >
                    {msg.image && (
                        <img src={msg.image} alt="Upload" className="w-full h-32 object-cover rounded-lg mb-2" />
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className={`p-3 rounded-2xl rounded-bl-none ${theme === 'glass' ? 'bg-white/10' : 'bg-gray-50 dark:bg-gray-800'}`}>
                    <Loader2 className="w-5 h-5 animate-spin opacity-50" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-3 md:p-4 border-t ${theme === 'glass' ? 'border-white/10' : 'border-gray-100 dark:border-white/10'}`}>
              <div className="flex gap-2 items-center">
                 <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload}
                />
                
                {/* Tools */}
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-2 rounded-full transition-colors ${theme === 'glass' ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-100 dark:hover:bg-white/10'}`}
                        title="Scan Memo"
                    >
                        <Camera className="w-5 h-5 opacity-70" />
                    </button>
                    <button 
                        onClick={handleMicClick}
                        className={`p-2 rounded-full transition-colors ${
                            isListening 
                                ? 'bg-red-500 text-white animate-pulse' 
                                : theme === 'glass' 
                                    ? 'hover:bg-white/20 text-white' 
                                    : 'hover:bg-gray-100 dark:hover:bg-white/10'
                        }`}
                        title="Voice Command"
                    >
                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 opacity-70" />}
                    </button>
                </div>
                
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? "Listening..." : "Type/Speak..."}
                  className={`flex-grow px-3 py-2 md:px-4 rounded-xl outline-none transition-all mx-1 ${inputStyles} text-sm md:text-base`}
                />
                
                <Button 
                    variant="primary" 
                    onClick={handleSend}
                    disabled={isProcessing || !input.trim()}
                    className="p-2 h-auto rounded-full px-2"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
        </div>
    );
};

const AIAssistant: React.FC<{ forceHide?: boolean, isVisible?: boolean }> = ({ forceHide = false, isVisible = true }) => {
  const { isOpen, setIsOpen, showAssistant } = useAI();
  const { theme } = useTheme();

  // Hide if explicitly forced, if global setting is off, or if passed visibility prop is false
  if (forceHide || !showAssistant || !isVisible) return null;

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className={`fixed bottom-24 md:bottom-6 right-6 z-50 p-4 rounded-full shadow-xl flex items-center justify-center transition-all ${
           theme === 'material' ? 'bg-[#6750A4] text-white' : 
           theme === 'fluent' ? 'bg-[#0078D4] text-white' :
           'bg-black text-white dark:bg-white dark:text-black'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </motion.button>

      {/* Modal Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-40 md:bottom-24 right-6 z-40"
          >
             <ChatInterface variant="modal" onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
