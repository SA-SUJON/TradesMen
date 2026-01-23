
import React, { useState, useEffect } from 'react';
import { ThemeType, BusinessProfile, TelegramConfig, AuthConfig } from '../types';
import { Card, Input, Button, Select } from './ui/BaseComponents';
import { Palette, Layout, Box, Droplets, Check, AlertCircle, Sparkles, Monitor, Camera, Volume2, Scale, Database, Download, Upload, Cloud, RefreshCw, Loader2, Lock, Building2, FileText, Plus, Smartphone, Key, Moon, Code, MessageSquare, Bot, ShieldCheck } from 'lucide-react';
import { getThemeClasses } from '../utils/themeUtils';
import { useTheme } from '../contexts/ThemeContext';
import { useAI } from '../contexts/AIContext';
import { initGapi, handleAuth, uploadBackup, downloadBackup, getClientIdStatus } from '../utils/googleDrive';
import useLocalStorage from '../hooks/useLocalStorage';
import { getBotInfo } from '../utils/telegramBot';

const Settings: React.FC = () => {
  const { 
      theme, setTheme, 
      showNavLabels, setShowNavLabels, 
      showQuickScan, setShowQuickScan,
      voiceEnabled, setVoiceEnabled,
      unitSystem, setUnitSystem,
      darkMode, setDarkMode
  } = useTheme();
  
  const { 
      showAssistant, setShowAssistant, 
      apiKey, setApiKey,
      aiModel, setAiModel
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

  // ... (Backup logic same as before) ...
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

  // ... (Theme options same as before) ...
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
                  <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={authConfig.enableLock} 
                          onChange={(e) => setAuthConfig({...authConfig, enableLock: e.target.checked})} 
                      />
                      <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600`}></div>
                  </label>
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
              <div className="flex items-center gap-2 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={telegramConfig.isEnabled} 
                          onChange={(e) => setTelegramConfig({...telegramConfig, isEnabled: e.target.checked})} 
                          disabled={!telegramConfig.botToken}
                      />
                      <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600`}></div>
                  </label>
                  <span className="text-sm font-medium">Enable Bot Polling</span>
              </div>
          </div>
      </Card>

      {/* ... (Existing Cards: Database, Business Profile, AI Config, Local Backup, Interface, Theme) ... */}
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
              <div><Select label="AI Model Version" value={aiModel} onChange={(e) => setAiModel(e.target.value)}>{modelOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</Select></div>
              <div className="space-y-4">
                  <div className="flex items-center justify-between"><div><div className="font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-500" /> Enable Manager Button</div></div><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={showAssistant} onChange={(e) => setShowAssistant(e.target.checked)} /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-4"></div></label></div>
                  <div className="flex items-center justify-between"><div><div className="font-bold flex items-center gap-2"><Plus className="w-4 h-4 text-green-500" /> Quick Scan Button</div></div><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={showQuickScan} onChange={(e) => setShowQuickScan(e.target.checked)} /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-4"></div></label></div>
                  <div className="flex items-center justify-between"><div><div className="font-bold flex items-center gap-2"><Volume2 className="w-4 h-4" /> Voice Feedback</div></div><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={voiceEnabled} onChange={(e) => setVoiceEnabled(e.target.checked)} /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-4"></div></label></div>
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
           <div className="flex items-center justify-between"><div><div className="font-bold flex items-center gap-2"><Moon className="w-4 h-4" /> Dark Mode</div></div><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-4"></div></label></div>
           <div className="flex items-center justify-between"><div><div className="font-bold flex items-center gap-2"><Scale className="w-4 h-4" /> Unit System</div></div><div className={`flex rounded-lg p-1 ${theme === 'neumorphism' ? 'bg-[#E0E5EC] dark:bg-[#292d3e] shadow-inner' : 'bg-gray-100 dark:bg-gray-800'}`}><button onClick={() => setUnitSystem('metric')} className={`px-3 py-1 text-xs rounded-md transition-all ${unitSystem === 'metric' ? 'bg-white shadow text-black' : 'opacity-60'}`}>Metric</button><button onClick={() => setUnitSystem('local')} className={`px-3 py-1 text-xs rounded-md transition-all ${unitSystem === 'local' ? 'bg-white shadow text-black' : 'opacity-60'}`}>Local</button></div></div>
          <div className="flex items-center justify-between"><div><div className="font-bold">Show Navigation Labels</div></div><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={showNavLabels} onChange={(e) => setShowNavLabels(e.target.checked)} /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-4"></div></label></div>
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
    </div>
  );
};

export default Settings;
