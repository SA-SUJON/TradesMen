
import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../contexts/AIContext';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Camera, Image as ImageIcon, Loader2, Mic, MicOff, History, MessageSquarePlus, Trash2, ArrowLeft, Wand2 } from 'lucide-react';
import { Button, Card } from './ui/BaseComponents';

// --- Helper: Simple Markdown Renderer ---
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    // Basic parser for Bold (**text**) and Bullet points
    const lines = text.split('\n');
    return (
        <div className="space-y-1">
            {lines.map((line, i) => {
                // Bullet Points
                if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                    const content = line.trim().substring(2);
                    // Bold Parsing inside bullet
                    const parts = content.split(/(\*\*.*?\*\*)/g);
                    return (
                        <div key={i} className="flex gap-2 ml-1">
                            <span className="opacity-60">•</span>
                            <span>
                                {parts.map((part, j) => 
                                    part.startsWith('**') && part.endsWith('**') 
                                    ? <strong key={j}>{part.slice(2, -2)}</strong> 
                                    : part
                                )}
                            </span>
                        </div>
                    );
                }
                
                // Normal Lines (with Bold support)
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                    <div key={i} className={`min-h-[1.2em] ${line.trim() === '' ? 'h-2' : ''}`}>
                        {parts.map((part, j) => 
                            part.startsWith('**') && part.endsWith('**') 
                            ? <strong key={j}>{part.slice(2, -2)}</strong> 
                            : part
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// --- Helper: Suggestion Chips ---
const SuggestionChips: React.FC<{ onSelect: (text: string) => void }> = ({ onSelect }) => {
    const suggestions = [
        "Analyze today's profit",
        "Who owes me money?",
        "Identify low stock items",
        "Draft a WhatsApp sale message",
        "Add a new item to inventory",
    ];

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 px-4 scrollbar-hide snap-x">
            {suggestions.map((s, i) => (
                <button 
                    key={i}
                    onClick={() => onSelect(s)}
                    className="flex-shrink-0 snap-start bg-gray-100 dark:bg-white/10 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-600 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                >
                    {s}
                </button>
            ))}
        </div>
    );
}

interface ChatInterfaceProps {
    variant?: 'modal' | 'page';
    onClose?: () => void;
    className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ variant = 'modal', onClose, className = '' }) => {
    const { 
        messages, sendMessage, isProcessing,
        sessions, currentSessionId, startNewChat, loadSession, deleteSession,
        aiModel
    } = useAI();
    const { theme } = useTheme();
    const styles = getThemeClasses(theme);
    
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [showHistory, setShowHistory] = useState(false); // Toggle for history view
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!showHistory) scrollToBottom();
    }, [messages, showHistory]);

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

    const handleNewChat = () => {
        startNewChat();
        setShowHistory(false);
    };

    const handleSelectSession = (id: string) => {
        loadSession(id);
        setShowHistory(false);
    };

    const getModelLabel = (model: string) => {
        if (model.includes('2.5-flash')) return 'Flash 2.5';
        if (model.includes('3-flash')) return 'Flash 3.0';
        if (model.includes('3-pro')) return 'Pro 3.0';
        return 'Gemini';
    };

    // Layout Logic
    let containerClasses = "";
    if (variant === 'modal') {
         containerClasses = `w-[calc(100vw-32px)] md:w-[400px] h-[500px] flex flex-col overflow-hidden shadow-2xl ${
            theme === 'glass' ? 'bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl' :
            theme === 'neumorphism' ? 'bg-[#E0E5EC] dark:bg-[#292d3e] rounded-2xl border border-white/40 dark:border-white/5' :
            'bg-white rounded-2xl border border-gray-200'
          }`;
    } else {
        // Page Variant (Full Height)
        containerClasses = `w-full flex flex-col overflow-hidden shadow-sm ${styles.card} p-0 ${className}`;
    }

    const inputStyles = theme === 'glass' 
        ? 'bg-white/10 border border-white/10 focus:bg-white/20 text-white placeholder-white/50' 
        : theme === 'neumorphism'
            ? 'bg-[#E0E5EC] dark:bg-[#292d3e] shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff] dark:shadow-[inset_2px_2px_5px_#1f2330,inset_-2px_-2px_5px_#33374a] text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-gray-500'
            : theme === 'material'
                ? 'bg-[#E7E0EC] focus:bg-[#EADDFF] text-slate-900 placeholder-slate-500'
                : 'bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 text-gray-800 placeholder-gray-400';

    // Page Variant Sidebar Layout (Desktop)
    const isPageDesktop = variant === 'page' && typeof window !== 'undefined' && window.innerWidth >= 768;

    return (
        <div className={containerClasses}>
            {/* Header */}
            <div className={`p-4 border-b ${theme === 'glass' ? 'border-white/10' : 'border-gray-100 dark:border-white/10'} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                    {showHistory && !isPageDesktop ? (
                        <button onClick={() => setShowHistory(false)} className="mr-1">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    ) : (
                         <div className={`p-2 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 text-white shadow-lg`}>
                            <Wand2 className={`w-4 h-4`} />
                         </div>
                    )}
                   
                    <div className="flex flex-col justify-center">
                        <h3 className={`font-bold leading-none ${theme === 'glass' ? 'text-white' : ''}`}>
                            {showHistory ? 'History' : 'Manager AI'}
                        </h3>
                        {!showHistory && (
                             <div className="mt-1">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800 uppercase tracking-wider select-none">
                                    {getModelLabel(aiModel)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleNewChat}
                        className={`p-1.5 rounded-full ${theme === 'glass' ? 'hover:bg-white/20' : 'hover:bg-gray-100 dark:hover:bg-white/10'}`}
                        title="New Chat"
                    >
                        <MessageSquarePlus className="w-5 h-5" />
                    </button>
                    {!isPageDesktop && (
                        <button 
                            onClick={() => setShowHistory(!showHistory)}
                            className={`p-1.5 rounded-full ${showHistory ? 'bg-blue-100 text-blue-600' : ''} ${theme === 'glass' ? 'hover:bg-white/20' : 'hover:bg-gray-100 dark:hover:bg-white/10'}`}
                            title="History"
                        >
                            <History className="w-5 h-5" />
                        </button>
                    )}
                    {variant === 'modal' && (
                        <button onClick={onClose} className="opacity-50 hover:opacity-100 ml-2">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-grow flex overflow-hidden relative">
                
                {/* History Sidebar / Overlay */}
                {(showHistory || isPageDesktop) && (
                    <div className={`${
                        isPageDesktop 
                            ? 'w-1/3 border-r border-gray-100 dark:border-white/10 flex flex-col' 
                            : 'absolute inset-0 z-20 bg-white dark:bg-gray-900 flex flex-col'
                    } ${!showHistory && !isPageDesktop ? 'hidden' : ''}`}>
                         <div className="flex-grow overflow-y-auto p-2 space-y-2">
                            {sessions.length > 0 ? (
                                sessions.map(session => (
                                    <div 
                                        key={session.id}
                                        onClick={() => handleSelectSession(session.id)}
                                        className={`p-3 rounded-xl cursor-pointer transition-all group relative ${
                                            currentSessionId === session.id 
                                                ? (theme === 'glass' ? 'bg-white/20' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900') 
                                                : (theme === 'glass' ? 'hover:bg-white/10' : 'hover:bg-gray-50 dark:hover:bg-white/5')
                                        }`}
                                    >
                                        <div className="font-bold text-sm truncate pr-6">{session.title || 'New Chat'}</div>
                                        <div className="text-xs opacity-60 truncate">{session.lastMessage}</div>
                                        <div className="text-[10px] opacity-40 mt-1">{new Date(session.date).toLocaleDateString()}</div>
                                        
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                                            className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center opacity-50 py-10 text-sm">
                                    <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    No chat history.
                                </div>
                            )}
                         </div>
                    </div>
                )}

                {/* Main Chat Area */}
                <div className={`flex flex-col flex-grow h-full ${showHistory && !isPageDesktop ? 'hidden' : 'block'}`}>
                    <div className={`flex-grow overflow-y-auto p-4 space-y-4 scrollbar-hide ${variant === 'page' ? 'pt-6' : ''}`}>
                    {messages.map((msg) => (
                        <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                        <div
                            className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                            msg.role === 'user'
                                ? `${theme === 'material' ? 'bg-[#6750A4]' : 'bg-blue-600'} text-white rounded-br-none shadow-md`
                                : `${theme === 'glass' ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800'} rounded-bl-none`
                            } ${msg.isError ? 'bg-red-100 text-red-600' : ''}`}
                        >
                            {msg.image && (
                                <img src={msg.image} alt="Upload" className="w-full h-32 object-cover rounded-lg mb-2" />
                            )}
                            <SimpleMarkdown text={msg.text} />
                        </div>
                        </div>
                    ))}
                    {isProcessing && (
                        <div className="flex justify-start">
                        <div className={`p-3 rounded-2xl rounded-bl-none ${theme === 'glass' ? 'bg-white/10' : 'bg-gray-50 dark:bg-gray-800'}`}>
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestions */}
                    {!isProcessing && messages.length < 3 && (
                        <div className="mb-2">
                             <SuggestionChips onSelect={(text) => { sendMessage(text); }} />
                        </div>
                    )}

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
                            className="p-2 h-auto rounded-full px-2 shadow-lg"
                        >
                        <Send className="w-4 h-4" />
                        </Button>
                    </div>
                    </div>
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
           theme === 'neumorphism' ? 'bg-[#E0E5EC] dark:bg-[#292d3e] text-slate-700 dark:text-blue-400 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#1f2330,-5px_-5px_10px_#33374a]' :
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
            className="fixed bottom-40 md:bottom-24 right-4 z-40 max-w-[calc(100vw-32px)]"
          >
             <ChatInterface variant="modal" onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
