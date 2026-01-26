
import React, { useState, useEffect } from 'react';
import { ThemeType, BusinessProfile, TelegramConfig, AuthConfig } from '../types';
import { Card, Input, Button, Select, Toggle } from './ui/BaseComponents';
import { Palette, Layout, Box, Droplets, Check, AlertCircle, Sparkles, Monitor, Camera, Volume2, Scale, Database, Download, Upload, Cloud, RefreshCw, Loader2, Lock, Building2, FileText, Plus, Smartphone, Key, Moon, Code, MessageSquare, Bot, ShieldCheck, Globe, BrainCircuit, Sliders, Info, Store, Heart, Mail, Terminal, Phone, Github, MessageCircle } from 'lucide-react';
import { getThemeClasses } from '../utils/themeUtils';
import { useTheme } from '../contexts/ThemeContext';
import { useAI } from '../contexts/AIContext';
import { initGapi, handleAuth, uploadBackup, downloadBackup, getClientIdStatus } from '../utils/googleDrive';
import useLocalStorage from '../hooks/useLocalStorage';
import { getBotInfo } from '../utils/telegramBot';
import { CURRENCIES } from '../utils/currencyList';
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
  const { 
      theme, setTheme, 
      showNavLabels, setShowNavLabels, 
      showQuickScan, setShowQuickScan,
      voiceEnabled, setVoiceEnabled,
      unitSystem, setUnitSystem,
      darkMode, setDarkMode,
      currencyCode, setCurrencyCode
  } = useTheme();
  
  const { 
      showAssistant, setShowAssistant, 
      apiKey, setApiKey,
      aiModel, setAiModel,
      aiConfig, setAiConfig
  } = useAI();
  
  const styles = getThemeClasses(theme);

  // Auth Config (Staff Mode)
  const [authConfig, setAuthConfig] = useLocalStorage<AuthConfig>('tradesmen-auth-config', {
      adminPin: '1234',
      staffPin: '0000',
      enableLock: false
  });

  // Supabase Config
  const [supabaseUrl, setSupabaseUrl] = useLocalStorage<string>('tradesmen-supabase-url', '');
  const [supabaseKey, setSupabaseKey] = useLocalStorage<string>('tradesmen-supabase-key', '');
  const [showSqlHelp, setShowSqlHelp] = useState(false);

  // Telegram Config
  const [telegramConfig, setTelegramConfig] = useLocalStorage<TelegramConfig>('tradesmen-telegram-config', { botToken: '', chatId: '', isEnabled: false });
  const [botName, setBotName] = useState<string | null>(null);
  const [isCheckingBot, setIsCheckingBot] = useState(false);

  const checkBot = async () => {
      if(!telegramConfig.botToken) return;
      setIsCheckingBot(true);
      const info = await getBotInfo(telegramConfig.botToken);
      setIsCheckingBot(false);
      if(info) {
          setBotName(`@${info.username}`);
          alert(`Connected to ${info.first_name} (@${info.username})`);
      } else {
          setBotName(null);
          alert("Invalid Bot Token");
      }
  };

  // Business Profile State
  const [profile, setProfile] = useLocalStorage<BusinessProfile>('tradesmen-business-profile', {
      name: 'My Store',
      address: '',
      phone: '',
      email: '',
      gstin: '',
      terms: 'Thank you for your business! Goods once sold will not be taken back.'
  });

  // Cloud Sync State
  const [isDriveReady, setIsDriveReady] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'restoring' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
      if (typeof window !== 'undefined') {
          if (getClientIdStatus()) {
              setTimeout(() => {
                try {
                    initGapi(() => { setIsDriveReady(true); });
                } catch (e) { console.error("GAPI Init Error", e); }
              }, 1000);
          }
          const savedSync = localStorage.getItem('tradesmen-last-sync');
          if (savedSync) setLastSync(savedSync);
          if(telegramConfig.botToken && telegramConfig.isEnabled) {
              getBotInfo(telegramConfig.botToken).then(info => { if(info) setBotName(`@${info.username}`); });
          }
      }
  }, []);

  const getAllData = () => {
    const data: Record<string, any> = {};
    if (typeof window !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('tradesmen-')) {
                try { data[key] = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { data[key] = localStorage.getItem(key); }
            }
        }
    }
    return data;
  };

  const handleExport = () => {
    const data = { version: "1.0", timestamp: new Date().toISOString(), appData: getAllData() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `tradesmen-backup-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target?.result as string;
            const parsed = JSON.parse(content);
            performRestore(parsed);
        } catch (err) { alert("Failed to restore data. Invalid file format."); }
        event.target.value = ''; 
    };
    reader.readAsText(file);
  };

  const performRestore = (parsed: any) => {
      if (!parsed.appData) throw new Error("Invalid backup file format");
      if (window.confirm("WARNING: This will overwrite ALL current data with the backup. Are you sure?")) {
          const keysToRemove = [];
          for(let i=0; i<localStorage.length; i++) { const key = localStorage.key(i); if(key && key.startsWith('tradesmen-')) keysToRemove.push(key); }
          keysToRemove.forEach(k => localStorage.removeItem(k));
          Object.entries(parsed.appData).forEach(([key, value]) => { localStorage.setItem(key, JSON.stringify(value)); });
          alert("Data restored successfully! The app will now reload.");
          window.location.reload();
      }
  };

  const themeOptions: { id: ThemeType; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'material', label: 'Material You', desc: 'Playful, rounded, pastel colors.', icon: <Palette className="w-5 h-5" /> },
    { id: 'fluent', label: 'Microsoft Fluent 2', desc: 'Professional, clean, acrylic feel.', icon: <Layout className="w-5 h-5" /> },
    { id: 'neumorphism', label: 'Neumorphism', desc: 'Soft 3D shadows and depth.', icon: <Box className="w-5 h-5" /> },
    { id: 'glass', label: 'Glassmorphism', desc: 'Translucent, vibrant, modern.', icon: <Droplets className="w-5 h-5" /> },
  ];

  const modelOptions = [
      { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Fast & Free)' },
      { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (Latest Fast)' },
      { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (Most Intelligent)' },
  ];

  return (
    <div className="space-y-6 pb-24">

      {/* Staff Mode / Security Settings */}
      <Card className="border-l-4 border-l-blue-600">
          <h2 className={`text-xl font-bold flex items-center gap-2 mb-4 ${styles.accentText}`}>
             <ShieldCheck className="w-5 h-5" /> Staff Mode & Security
          </h2>
          
          <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                  <div>
                      <div className="font-bold">Enable Lock Screen</div>
                      <div className="text-sm opacity-60">Require PIN to access app. Restricts sensitive features for Staff.</div>
                  </div>
                  <Toggle 
                      checked={authConfig.enableLock} 
                      onChange={(val) => setAuthConfig({...authConfig, enableLock: val})} 
                  />
              </div>

              {authConfig.enableLock && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 animate-in slide-in-from-top-2">
                      <Input 
                        label="Admin PIN" 
                        type="number"
                        placeholder="Default: 1234"
                        value={authConfig.adminPin}
                        onChange={(e) => setAuthConfig({...authConfig, adminPin: e.target.value.slice(0, 4)})}
                        maxLength={4}
                      />
                      <Input 
                        label="Staff PIN" 
                        type="number"
                        placeholder="Default: 0000"
                        value={authConfig.staffPin}
                        onChange={(e) => setAuthConfig({...authConfig, staffPin: e.target.value.slice(0, 4)})}
                        maxLength={4}
                      />
                      <p className="text-xs opacity-50 col-span-1 md:col-span-2">
                          * Admin has full access. Staff is restricted from Expenses, Finance, Settings, and Editing Inventory.
                      </p>
                  </div>
              )}
          </div>
      </Card>

      {/* Telegram Bot Integration */}
      <Card className="border-2 border-blue-500/20 shadow-lg">
          <div className="flex justify-between items-start">
             <h2 className={`text-xl font-bold flex items-center gap-2 mb-4 ${styles.accentText}`}>
                <Bot className="w-5 h-5" /> Telegram Bot Integration
            </h2>
            <div className="flex items-center gap-2">
                 <span className={`text-xs px-2 py-1 rounded-full font-bold ${telegramConfig.isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                     {telegramConfig.isEnabled ? 'Active' : 'Disabled'}
                 </span>
            </div>
          </div>
          <p className="text-sm opacity-70 mb-4">
              Manage your shop remotely via Telegram. Your web app must be open on this device to process messages.
          </p>
          
          <div className="space-y-4">
               <div className="flex gap-2">
                  <div className="flex-grow">
                      <Input 
                        label="Bot Token" 
                        type="password"
                        placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                        value={telegramConfig.botToken}
                        onChange={(e) => setTelegramConfig({...telegramConfig, botToken: e.target.value})}
                      />
                  </div>
                  <Button onClick={checkBot} className="mb-0.5 mt-auto" variant="secondary">
                     {isCheckingBot ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
                  </Button>
              </div>
              
              {botName && <div className="text-xs text-green-600 font-bold ml-1">Connected to: {botName}</div>}

              <Input 
                label="Allowed Chat ID" 
                placeholder="e.g. 123456789"
                value={telegramConfig.chatId}
                onChange={(e) => setTelegramConfig({...telegramConfig, chatId: e.target.value})}
              />
              <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-medium">Enable Bot Polling</span>
                  <Toggle 
                      checked={telegramConfig.isEnabled} 
                      onChange={(val) => setTelegramConfig({...telegramConfig, isEnabled: val})} 
                  />
              </div>
          </div>
      </Card>

      <Card>
          <h2 className={`text-xl font-bold flex items-center gap-2 mb-4 ${styles.accentText}`}>
             <Database className="w-5 h-5" /> Real Database (Supabase)
          </h2>
          <div className="space-y-4">
              <Input label="Supabase URL" placeholder="https://xyz.supabase.co" value={supabaseUrl} onChange={(e) => setSupabaseUrl(e.target.value)} />
              <Input label="Supabase Anon Key" type="password" value={supabaseKey} onChange={(e) => setSupabaseKey(e.target.value)} />
              <div className="flex justify-between items-center mt-2">
                 <button onClick={() => setShowSqlHelp(!showSqlHelp)} className="flex items-center gap-2 text-sm text-blue-600 hover:underline"><Code className="w-4 h-4" /> {showSqlHelp ? 'Hide SQL Setup' : 'How to set up table?'}</button>
                 {supabaseUrl && supabaseKey && <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full"><Check className="w-4 h-4" /> Credentials Saved</div>}
              </div>
              {showSqlHelp && <div className="p-3 bg-gray-900 text-gray-200 rounded-lg text-xs font-mono overflow-x-auto"><pre>{`create table app_storage ( key text primary key, value jsonb, updated_at timestamptz default now() );\nalter table app_storage enable row level security;\ncreate policy "Public Access" on app_storage for all using (true);`}</pre></div>}
          </div>
      </Card>

      <Card>
          <h2 className={`text-xl font-bold flex items-center gap-2 mb-6 ${styles.accentText}`}><Building2 className="w-5 h-5" /> Business Profile & Invoice</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><Input label="Business Name" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} /></div>
              <div className="md:col-span-1"><Input label="Phone Number" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} /></div>
              <div className="md:col-span-1"><Input label="GSTIN (Tax ID)" value={profile.gstin || ''} onChange={e => setProfile({...profile, gstin: e.target.value})} /></div>
              <div className="md:col-span-2"><Input label="Address" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} /></div>
              <div className="md:col-span-2"><Input label="Invoice Terms" value={profile.terms || ''} onChange={e => setProfile({...profile, terms: e.target.value})} /></div>
          </div>
      </Card>
      
      <Card className={`${theme === 'material' ? 'bg-indigo-50 border-indigo-100 dark:bg-[#2B2930] dark:border-gray-700' : ''}`}>
          <h2 className={`text-xl font-bold flex items-center gap-2 mb-6 ${styles.accentText}`}><Sparkles className="w-5 h-5" /> Manager AI Configuration</h2>
          <div className="space-y-6">
              <div className={`p-4 rounded-xl border border-gray-200 dark:border-white/10 ${theme === 'neumorphism' ? 'shadow-inner' : 'bg-white dark:bg-black/20'}`}>
                  <div className="flex items-center gap-2 font-bold mb-2"><Key className="w-4 h-4 text-orange-500" /> Google Gemini API Key</div>
                  <div className="flex gap-2"><div className="flex-grow"><Input type="password" placeholder={apiKey ? "••••••••••••••••" : "Paste API Key Here"} value={apiKey} onChange={(e) => setApiKey(e.target.value)} className={apiKey ? "opacity-50 pointer-events-none bg-gray-100 dark:bg-gray-800" : ""} /></div>{apiKey && <Button variant="secondary" onClick={() => setApiKey('')} className="bg-red-50 text-red-500">Reset</Button>}</div>
              </div>
              
              <div>
                  <Select label="AI Model Version" value={aiModel} onChange={(e) => setAiModel(e.target.value)}>
                      {modelOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                  </Select>
              </div>

              {/* Advanced AI Settings */}
              <div className="border-t border-gray-200 dark:border-white/10 pt-4 mt-4">
                  <h3 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider opacity-70">
                      <Sliders className="w-4 h-4" /> Advanced Controls
                  </h3>
                  
                  <div className="space-y-6">
                      <Input 
                          label="Custom Persona" 
                          placeholder="e.g. You are a strict accountant. Keep answers short."
                          value={aiConfig.customPersona} 
                          onChange={(e) => setAiConfig({...aiConfig, customPersona: e.target.value})} 
                      />
                      
                      <div>
                          <div className="flex justify-between mb-2">
                              <label className="text-xs font-bold uppercase">Creativity (Temperature)</label>
                              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 rounded">{aiConfig.temperature}</span>
                          </div>
                          <input 
                              type="range" 
                              min="0" max="1" step="0.1" 
                              value={aiConfig.temperature} 
                              onChange={(e) => setAiConfig({...aiConfig, temperature: parseFloat(e.target.value)})}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                          />
                          <div className="flex justify-between text-[10px] opacity-50 mt-1">
                              <span>Precise (0.0)</span>
                              <span>Balanced</span>
                              <span>Creative (1.0)</span>
                          </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl space-y-3">
                          <div className="text-xs font-bold uppercase opacity-60 mb-2 flex items-center gap-2"><BrainCircuit className="w-4 h-4" /> Data Access Scope</div>
                          
                          <div className="flex items-center justify-between">
                              <span className="text-sm">Allow Sales Analysis</span>
                              <Toggle checked={aiConfig.enableSalesRead} onChange={(val) => setAiConfig({...aiConfig, enableSalesRead: val})} />
                          </div>
                          <div className="flex items-center justify-between">
                              <span className="text-sm">Allow Inventory Access</span>
                              <Toggle checked={aiConfig.enableInventoryRead} onChange={(val) => setAiConfig({...aiConfig, enableInventoryRead: val})} />
                          </div>
                          <div className="flex items-center justify-between">
                              <span className="text-sm">Allow Customer Debt Access</span>
                              <Toggle checked={aiConfig.enableCustomerRead} onChange={(val) => setAiConfig({...aiConfig, enableCustomerRead: val})} />
                          </div>
                      </div>
                  </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-white/10">
                  <div className="flex items-center justify-between">
                      <div><div className="font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-500" /> Enable Manager Button</div></div>
                      <Toggle checked={showAssistant} onChange={setShowAssistant} />
                  </div>
                  <div className="flex items-center justify-between">
                      <div><div className="font-bold flex items-center gap-2"><Plus className="w-4 h-4 text-green-500" /> Quick Scan Button</div></div>
                      <Toggle checked={showQuickScan} onChange={setShowQuickScan} />
                  </div>
                  <div className="flex items-center justify-between">
                      <div><div className="font-bold flex items-center gap-2"><Volume2 className="w-4 h-4" /> Voice Feedback</div></div>
                      <Toggle checked={voiceEnabled} onChange={setVoiceEnabled} />
                  </div>
              </div>
          </div>
      </Card>

      <Card className="opacity-80">
        <h2 className={`text-xl font-bold flex items-center gap-2 mb-6 ${styles.accentText}`}><Smartphone className="w-5 h-5" /> Local Backup</h2>
        <div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><button onClick={handleExport} className="flex items-center justify-center gap-2 p-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-bold shadow-md"><Download className="w-5 h-5" /> Save Backup File</button><label className="flex items-center justify-center gap-2 p-4 rounded-xl bg-white text-blue-600 border-2 border-blue-200 hover:bg-blue-50 dark:bg-gray-800 dark:border-blue-900 transition-all font-bold cursor-pointer"><input type="file" accept=".json" onChange={handleImport} className="hidden" /><Upload className="w-5 h-5" /> Restore from File</label></div></div>
      </Card>

      <Card>
        <h2 className={`text-xl font-bold flex items-center gap-2 mb-6 ${styles.accentText}`}><Monitor className="w-5 h-5" /> Interface</h2>
        <div className="space-y-6">
           <div className="flex items-center justify-between"><div><div className="font-bold flex items-center gap-2"><Globe className="w-4 h-4" /> Shop Currency</div></div>
             <div className="w-40">
                 <Select value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value)}>
                     {CURRENCIES.map(c => (
                         <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                     ))}
                 </Select>
             </div>
           </div>
           <div className="flex items-center justify-between">
               <div><div className="font-bold flex items-center gap-2"><Moon className="w-4 h-4" /> Dark Mode</div></div>
               <Toggle checked={darkMode} onChange={setDarkMode} icon={darkMode ? <Moon className="w-4 h-4 text-white" /> : <div className="w-4 h-4 bg-yellow-400 rounded-full" />} />
           </div>
           <div className="flex items-center justify-between"><div><div className="font-bold flex items-center gap-2"><Scale className="w-4 h-4" /> Unit System</div></div><div className={`flex rounded-lg p-1 ${theme === 'neumorphism' ? 'bg-[#E0E5EC] dark:bg-[#292d3e] shadow-inner' : 'bg-gray-100 dark:bg-gray-800'}`}><button onClick={() => setUnitSystem('metric')} className={`px-3 py-1 text-xs rounded-md transition-all ${unitSystem === 'metric' ? 'bg-white shadow text-black' : 'opacity-60'}`}>Metric</button><button onClick={() => setUnitSystem('local')} className={`px-3 py-1 text-xs rounded-md transition-all ${unitSystem === 'local' ? 'bg-white shadow text-black' : 'opacity-60'}`}>Local</button></div></div>
          <div className="flex items-center justify-between">
              <div><div className="font-bold">Show Navigation Labels</div></div>
              <Toggle checked={showNavLabels} onChange={setShowNavLabels} />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className={`text-xl font-bold flex items-center gap-2 mb-6 ${styles.accentText}`}><Palette className="w-5 h-5" /> Appearance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themeOptions.map((option) => {
            const isSelected = theme === option.id;
            let containerClass = "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-4 ";
            if (isSelected) { containerClass += "border-blue-500 bg-blue-500/5 "; } else { containerClass += "border-transparent hover:bg-black/5 dark:hover:bg-white/5 "; if (theme === 'glass') containerClass += "bg-white/5 border-white/10 "; else if (theme === 'neumorphism') containerClass += "shadow-[inset_2px_2px_5px_#a3b1c6,inset_-2px_-2px_5px_#ffffff] dark:shadow-[inset_2px_2px_5px_#1f2330,inset_-2px_-2px_5px_#33374a] "; else containerClass += "bg-gray-50 dark:bg-gray-800/50 "; }
            return (
              <button key={option.id} onClick={() => setTheme(option.id)} className={containerClass}>
                <div className={`p-3 rounded-full ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}`}>{option.icon}</div>
                <div className="text-left flex-grow"><div className="font-bold flex justify-between items-center">{option.label}{isSelected && <Check className="w-4 h-4 text-blue-500" />}</div><div className="text-sm opacity-60 mt-1">{option.desc}</div></div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="relative overflow-hidden">
        <h2 className={`text-xl font-bold flex items-center gap-2 mb-6 ${styles.accentText}`}>
            <Info className="w-5 h-5" /> About
        </h2>

        <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Project Info */}
            <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4"> {/* Increased gap for visual balance */}
                    <motion.div 
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                        className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/30"
                    >
                        <Store className="w-8 h-8" />
                    </motion.div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-300% animate-gradient">
                            TradesMen
                        </h1>
                        <div className="flex gap-2 mt-1">
                            <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">v1.7.9</span>
                            <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">DEV</span>
                        </div>
                    </div>
                </div>
                
                <p className="text-sm opacity-70 leading-relaxed font-medium">
                    Empowering modern enterprises to synchronize inventory, billing, and financial operations through a singular, AI-driven intelligence hub.
                </p>

                {/* System Architecture Grid */}
                <div className="pt-6 mt-2">
                    <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-3 text-center">Powered By</div>
                    <div className="grid grid-cols-2 gap-2">
                        {/* Gemini 3.0 */}
                        <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1], filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="p-2 bg-white dark:bg-white/10 text-blue-600 rounded-lg shadow-sm mb-2"
                            >
                                <Sparkles className="w-4 h-4" />
                            </motion.div>
                            <div className="flex flex-col items-center">
                                <motion.span 
                                    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="text-[10px] font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 bg-[length:200%_auto]"
                                >
                                    Gemini 3.0
                                </motion.span>
                                <span className="text-[8px] font-bold opacity-60 mt-1 uppercase tracking-wide">Neural Engine</span>
                            </div>
                        </div>

                        {/* Supabase */}
                        <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                            <motion.div 
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                className="p-2 bg-white dark:bg-white/10 text-emerald-600 rounded-lg shadow-sm mb-2"
                            >
                                <Database className="w-4 h-4" />
                            </motion.div>
                            <div className="flex flex-col items-center">
                                <motion.span 
                                    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="text-[10px] font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 bg-[length:200%_auto]"
                                >
                                    Supabase
                                </motion.span>
                                <span className="text-[8px] font-bold opacity-60 mt-1 uppercase tracking-wide">Realtime DB</span>
                            </div>
                        </div>

                        {/* React 19 */}
                        <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                className="p-2 bg-white dark:bg-white/10 text-cyan-600 rounded-lg shadow-sm mb-2"
                            >
                                <Code className="w-4 h-4" />
                            </motion.div>
                            <div className="flex flex-col items-center">
                                <motion.span 
                                    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                                    transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                                    className="text-[10px] font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 bg-[length:200%_auto]"
                                >
                                    React 19
                                </motion.span>
                                <span className="text-[8px] font-bold opacity-60 mt-1 uppercase tracking-wide">Core Framework</span>
                            </div>
                        </div>

                        {/* Tailwind */}
                        <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                            <motion.div 
                                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="p-2 bg-white dark:bg-white/10 text-purple-600 rounded-lg shadow-sm mb-2"
                            >
                                <Palette className="w-4 h-4" />
                            </motion.div>
                            <div className="flex flex-col items-center">
                                <motion.span 
                                    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="text-[10px] font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-[length:200%_auto]"
                                >
                                    Tailwind
                                </motion.span>
                                <span className="text-[8px] font-bold opacity-60 mt-1 uppercase tracking-wide">UI Engine</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gray-200 dark:bg-white/10 md:w-px md:h-auto self-stretch"></div>

            {/* Developer Info */}
            <div className="flex-1 w-full">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 to-violet-500 flex items-center justify-center text-white shadow-xl animate-pulse-slow">
                        <Terminal className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 animate-gradient leading-none" style={{ backgroundSize: '300% 100%', animationDuration: '3s' }}>SA SUJON</div>
                        <div className="flex items-center gap-2 mt-1">
                             <span className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-300 px-2 py-0.5 rounded">Architect</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <a href="mailto:hcentury346@gmail.com" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
                        <motion.div 
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="p-2 bg-red-100 text-red-600 rounded-full"
                        >
                            <Mail className="w-4 h-4" />
                        </motion.div>
                        <span className="text-sm font-medium opacity-80 group-hover:opacity-100">
                            <span className="group-hover:hidden">Email Address</span>
                            <span className="hidden group-hover:block">hcentury346@gmail.com</span>
                        </span>
                    </a>
                    
                    <a href="tel:+8801821295207" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
                        <motion.div 
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="p-2 bg-green-100 text-green-600 rounded-full"
                        >
                            <Phone className="w-4 h-4" />
                        </motion.div>
                        <span className="text-sm font-medium opacity-80 group-hover:opacity-100">
                            <span className="group-hover:hidden">Phone</span>
                            <span className="hidden group-hover:block">+880 1821-295207</span>
                        </span>
                    </a>

                    <a href="https://wa.me/8801821295207" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="p-2 bg-[#25D366] text-white rounded-full"
                        >
                            {/* WhatsApp SVG */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                        </motion.div>
                        <span className="text-sm font-medium opacity-80 group-hover:opacity-100">WhatsApp</span>
                    </a>

                    <a href="https://github.com/SA-SUJON/TradesMen/" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="p-2 bg-gray-800 text-white rounded-full"
                        >
                            <Github className="w-4 h-4" />
                        </motion.div>
                        <span className="text-sm font-medium opacity-80 group-hover:opacity-100">GitHub</span>
                    </a>
                </div>
            </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 text-center">
            <p className="text-[10px] leading-relaxed opacity-40 max-w-2xl mx-auto">
                © 2026 TradesMen. All rights reserved. All software design, AI algorithms, and interface elements are the intellectual property of TradesMen. Unauthorized reproduction or distribution is strictly prohibited.
            </p>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
