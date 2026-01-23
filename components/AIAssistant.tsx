
import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../contexts/AIContext';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Camera, Image as ImageIcon, Loader2, Mic, MicOff, History, MessageSquarePlus, Trash2, ArrowLeft, Wand2, Lightbulb, Bot } from 'lucide-react';
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

// --- Helper: Date Formatting ---
const formatHistoryDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) return new Intl.DateTimeFormat('default', { hour: 'numeric', minute: 'numeric' }).format(date);
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

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

    // --- PROACTIVE BRIEFING ---
    useEffect(() => {
        const hasUserMessages = messages.some(m => m.role === 'user');
        if (!hasUserMessages && messages.length <= 1 && !isProcessing) {
             const timer = setTimeout(() => {
                 sendMessage("Generate a daily briefing summarizing sales trends, low stock warnings, and opportunities for profit.");
             }, 800);
             return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    // Styles for history items based on theme
    const getHistoryItemClasses = (isActive: boolean) => {
        const base = "p-3 rounded-xl cursor-pointer transition-all group relative flex flex-col gap-1 border ";
        
        if (isActive) {
            switch(theme) {
                case 'glass': return base + "bg-blue-500/20 border-blue-500/30 text-blue-800 dark:text-blue-100 backdrop-blur-sm";
                case 'neumorphism': return base + "shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff] dark:shadow-[inset_2px_2px_5px_#1f2330,inset_-2px_-2px_5px_#33374a] bg-[#E0E5EC] dark:bg-[#292d3e] border-transparent text-blue-600 font-bold";
                case 'fluent': return base + "bg-white border-l-4 border-l-blue-600 border-y-gray-200 border-r-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-sm";
                default: return base + "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-100";
            }
        } else {
            switch(theme) {
                case 'glass': return base + "hover:bg-white/10 border-transparent hover:border-white/20 text-slate-700 dark:text-gray-300";
                case 'neumorphism': return base + "hover:shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:hover:shadow-[4px_4px_8px_#1f2330,-4px_-4px_8px_#33374a] border-transparent bg-transparent";
                case 'fluent': return base + "hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent";
                default: return base + "hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent text-gray-600 dark:text-gray-400";
            }
        }
    };

    // Layout Logic
    let containerClasses = "";
    if (variant === 'modal') {
         containerClasses = `w-[calc(100vw-32px)] md:w-[400px] h-[500px] flex flex-col overflow-hidden shadow-2xl ${
            theme === 'glass' ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl' :
            theme === 'neumorphism' ? 'bg-[#E0E5EC] dark:bg-[#292d3e] rounded-2xl border border-white/40 dark:border-white/5' :
            'bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700'
          }`;
    } else {
        // Page Variant (Full Height)
        containerClasses = `w-full flex flex-col overflow-hidden shadow-sm ${styles.card} p-0 ${className}`;
    }

    const inputStyles = theme === 'glass' 
        ? 'bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500'
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
            <div className={`p-4 border-b ${theme === 'glass' ? 'border-gray-200/50 dark:border-white/10' : 'border-gray-100 dark:border-white/10'} flex items-center justify-between`}>
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
                        <h3 className={`font-bold leading-none ${theme === 'glass' ? 'text-slate-800 dark:text-white' : ''}`}>
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
                    {!isPageDesktop && (
                        <button 
                            onClick={() => setShowHistory(!showHistory)}
                            className={`p-1.5 rounded-full ${showHistory ? 'bg-blue-100 text-blue-600' : ''} ${theme === 'glass' ? 'hover:bg-black/5 dark:hover:bg-white/10' : 'hover:bg-gray-100 dark:hover:bg-white/10'}`}
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
                            ? `w-80 flex-shrink-0 border-r ${theme === 'glass' ? 'border-white/10 bg-white/30 dark:bg-black/20' : 'border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-black/20'}` 
                            : 'absolute inset-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl flex flex-col'
                    } ${!showHistory && !isPageDesktop ? 'hidden' : ''} transition-all duration-300`}>
                        
                        {/* Mobile Overlay Header */}
                        {!isPageDesktop && (
                            <div className="p-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-transparent">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <History className="w-5 h-5 text-blue-500" /> Recent Chats
                                </h3>
                                <button onClick={() => setShowHistory(false)} className="p-2 bg-gray-100 dark:bg-white/10 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* New Chat Button */}
                        <div className="p-3">
                             <button 
                                onClick={handleNewChat}
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                                    theme === 'material' ? 'bg-[#E8DEF8] text-[#1D192B]' : 
                                    theme === 'neumorphism' ? 'shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#1f2330,-4px_-4px_8px_#33374a] bg-[#E0E5EC] dark:bg-[#292d3e]' : 
                                    'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                             >
                                <MessageSquarePlus className="w-4 h-4" /> New Conversation
                             </button>
                        </div>

                         <div className="flex-grow overflow-y-auto p-3 space-y-2 custom-scrollbar">
                            <div className="text-xs font-bold opacity-40 uppercase tracking-widest px-2 mb-2">Previous Sessions</div>
                            {sessions.length > 0 ? (
                                sessions.map(session => (
                                    <div 
                                        key={session.id}
                                        onClick={() => handleSelectSession(session.id)}
                                        className={getHistoryItemClasses(currentSessionId === session.id)}
                                    >
                                        <div className="flex justify-between items-start w-full">
                                            <div className="font-bold text-sm truncate flex-grow pr-2">
                                                {session.title || 'Untitled Chat'}
                                            </div>
                                            <div className="text-[10px] opacity-50 whitespace-nowrap mt-0.5 font-medium">
                                                {formatHistoryDate(session.date)}
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between items-end">
                                            <div className="text-xs opacity-60 truncate flex-grow pr-4">
                                                {session.lastMessage}
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                                                className={`p-1.5 rounded-lg transition-colors z-10 ${theme === 'neumorphism' ? 'text-red-500' : 'hover:bg-red-100 text-gray-400 hover:text-red-600 dark:hover:bg-red-900/30'}`}
                                                title="Delete Chat"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 opacity-40 gap-3">
                                    <div className="p-4 rounded-full bg-gray-100 dark:bg-white/5">
                                        <History className="w-6 h-6" />
                                    </div>
                                    <div className="text-sm">No history yet</div>
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
                            {/* Hidden User Prompt for Briefing */}
                            {msg.role === 'user' && msg.text.startsWith("Generate a daily briefing") ? null : (
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                    msg.role === 'user'
                                        ? `${theme === 'material' ? 'bg-[#6750A4]' : 'bg-blue-600'} text-white rounded-br-none shadow-md`
                                        : `${theme === 'glass' ? 'bg-white/60 dark:bg-white/10 text-slate-800 dark:text-white' : 'bg-gray-100 dark:bg-gray-800'} rounded-bl-none`
                                    } ${msg.isError ? 'bg-red-100 text-red-600' : ''}`}
                                >
                                    {msg.image && (
                                        <img src={msg.image} alt="Upload" className="w-full h-32 object-cover rounded-lg mb-2" />
                                    )}
                                    <SimpleMarkdown text={msg.text} />
                                </div>
                            )}
                        </div>
                    ))}
                    {isProcessing && (
                        <div className="flex justify-start">
                        <div className={`p-3 rounded-2xl rounded-bl-none ${theme === 'glass' ? 'bg-white/40 dark:bg-white/10' : 'bg-gray-50 dark:bg-gray-800'}`}>
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
                    <div className={`p-3 md:p-4 border-t ${theme === 'glass' ? 'border-gray-200/50 dark:border-white/10' : 'border-gray-100 dark:border-white/10'}`}>
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
                                className={`p-2 rounded-full transition-colors ${theme === 'glass' ? 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400' : 'hover:bg-gray-100 dark:hover:bg-white/10'}`}
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
                                            ? 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400' 
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
