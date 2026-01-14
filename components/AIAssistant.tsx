import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../contexts/AIContext';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button, Input } from './ui/BaseComponents';

const AIAssistant: React.FC = () => {
  const { messages, sendMessage, isProcessing, isOpen, setIsOpen, showAssistant } = useAI();
  const { theme } = useTheme();
  const styles = getThemeClasses(theme);
  
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

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
        // Automatically send image with a prompt to scan it
        sendMessage("Please scan this memo and add items to inventory.", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!showAssistant) return null;

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-xl flex items-center justify-center transition-all ${
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

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[500px] z-40 flex flex-col overflow-hidden shadow-2xl ${
                theme === 'glass' ? 'bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl' :
                theme === 'neumorphism' ? 'bg-[#E0E5EC] rounded-2xl border border-white/40' :
                'bg-white rounded-2xl border border-gray-200'
            }`}
          >
            {/* Header */}
            <div className={`p-4 border-b ${theme === 'glass' ? 'border-white/10' : 'border-gray-100'} flex items-center gap-2`}>
              <Sparkles className={`w-5 h-5 ${styles.accentText}`} />
              <h3 className={`font-bold ${theme === 'glass' ? 'text-white' : 'text-gray-800'}`}>Manager</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold ml-auto">Gemini 3 Flash</span>
            </div>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? `${theme === 'material' ? 'bg-[#6750A4]' : 'bg-blue-600'} text-white rounded-br-none`
                        : `${theme === 'glass' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-800'} rounded-bl-none`
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
                  <div className={`p-3 rounded-2xl rounded-bl-none ${theme === 'glass' ? 'bg-white/10' : 'bg-gray-50'}`}>
                    <Loader2 className="w-5 h-5 animate-spin opacity-50" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t ${theme === 'glass' ? 'border-white/10' : 'border-gray-100'}`}>
              <div className="flex gap-2 items-center">
                 <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 rounded-full transition-colors ${theme === 'glass' ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                    title="Scan Memo / Upload Image"
                >
                    <Camera className="w-5 h-5" />
                </button>
                
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type or command..."
                  className={`flex-grow bg-transparent outline-none px-2 ${theme === 'glass' ? 'text-white placeholder-white/50' : 'text-gray-800'}`}
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
