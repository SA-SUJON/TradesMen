import React from 'react';
import { ThemeType } from '../types';
import { Card } from './ui/BaseComponents';
import { Palette, Layout, Box, Droplets, Check, AlertCircle, Sparkles, Monitor, Camera, Volume2, Scale, Database, Download, Upload } from 'lucide-react';
import { getThemeClasses } from '../utils/themeUtils';
import { useTheme } from '../contexts/ThemeContext';
import { useAI } from '../contexts/AIContext';

const Settings: React.FC = () => {
  const { 
      theme, setTheme, 
      showNavLabels, setShowNavLabels, 
      showQuickScan, setShowQuickScan,
      voiceEnabled, setVoiceEnabled,
      unitSystem, setUnitSystem
  } = useTheme();
  
  const { showAssistant, setShowAssistant } = useAI();
  const styles = getThemeClasses(theme);

  // Helper to get all app data for backup
  const getAllData = () => {
    const data: Record<string, any> = {};
    if (typeof window !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('tradesmen-')) {
                try {
                    data[key] = JSON.parse(localStorage.getItem(key) || 'null');
                } catch (e) {
                    data[key] = localStorage.getItem(key);
                }
            }
        }
    }
    return data;
  };

  const handleExport = () => {
    const data = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        appData: getAllData()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradesmen-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target?.result as string;
            const parsed = JSON.parse(content);
            
            if (!parsed.appData) throw new Error("Invalid backup file format");

            if (window.confirm("WARNING: This will overwrite ALL current data (Inventory, Sales, Customers, etc.) with the backup. Are you sure?")) {
                // Clear current tradesmen data
                const keysToRemove = [];
                for(let i=0; i<localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if(key && key.startsWith('tradesmen-')) keysToRemove.push(key);
                }
                keysToRemove.forEach(k => localStorage.removeItem(k));

                // Restore
                Object.entries(parsed.appData).forEach(([key, value]) => {
                     localStorage.setItem(key, JSON.stringify(value));
                });
                
                alert("Data restored successfully! The app will now reload.");
                window.location.reload();
            }
        } catch (err) {
            alert("Failed to restore data. Invalid file format.");
            console.error(err);
        }
        // Reset input
        event.target.value = ''; 
    };
    reader.readAsText(file);
  };

  // Ordered strictly as requested
  const themeOptions: { id: ThemeType; label: string; desc: string; icon: React.ReactNode }[] = [
    { 
      id: 'material', 
      label: 'Material You', 
      desc: 'Playful, rounded, pastel colors.',
      icon: <Palette className="w-5 h-5" />
    },
    { 
      id: 'fluent', 
      label: 'Microsoft Fluent 2', 
      desc: 'Professional, clean, acrylic feel.',
      icon: <Layout className="w-5 h-5" />
    },
    { 
      id: 'neumorphism', 
      label: 'Neumorphism', 
      desc: 'Soft 3D shadows and depth.',
      icon: <Box className="w-5 h-5" />
    },
    { 
      id: 'glass', 
      label: 'Glassmorphism', 
      desc: 'Translucent, vibrant, modern.',
      icon: <Droplets className="w-5 h-5" />
    },
  ];

  return (
    <div className="space-y-6">
      {/* AI Settings Section */}
      <Card>
        <h2 className={`text-xl font-bold flex items-center gap-2 mb-6 ${styles.accentText}`}>
           <Sparkles className="w-5 h-5" /> Smart Manager
        </h2>
        <div className="flex items-center justify-between">
            <div>
                <div className="font-bold">Manager Visibility</div>
                <div className="text-sm opacity-60">Show the floating AI button on screen.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={showAssistant}
                    onChange={(e) => setShowAssistant(e.target.checked)}
                />
                <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600`}></div>
            </label>
        </div>
      </Card>

      {/* Interface Settings */}
      <Card>
        <h2 className={`text-xl font-bold flex items-center gap-2 mb-6 ${styles.accentText}`}>
           <Monitor className="w-5 h-5" /> Interface
        </h2>
        <div className="space-y-6">
           {/* Voice Toggle */}
           <div className="flex items-center justify-between">
              <div>
                  <div className="font-bold flex items-center gap-2"><Volume2 className="w-4 h-4" /> Voice Feedback</div>
                  <div className="text-sm opacity-60">Speak out results, alerts, and totals.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={voiceEnabled}
                      onChange={(e) => setVoiceEnabled(e.target.checked)}
                  />
                  <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600`}></div>
              </label>
          </div>

           {/* Unit Toggle */}
           <div className="flex items-center justify-between">
              <div>
                  <div className="font-bold flex items-center gap-2"><Scale className="w-4 h-4" /> Unit System</div>
                  <div className="text-sm opacity-60">Use Local Units (Maund/Seer) or Metric (KG).</div>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button 
                    onClick={() => setUnitSystem('metric')}
                    className={`px-3 py-1 text-xs rounded-md transition-all ${unitSystem === 'metric' ? 'bg-white shadow text-black' : 'opacity-60'}`}
                  >
                    Metric
                  </button>
                  <button 
                    onClick={() => setUnitSystem('local')}
                    className={`px-3 py-1 text-xs rounded-md transition-all ${unitSystem === 'local' ? 'bg-white shadow text-black' : 'opacity-60'}`}
                  >
                    Local
                  </button>
              </div>
          </div>

          <div className="flex items-center justify-between">
              <div>
                  <div className="font-bold">Show Navigation Labels</div>
                  <div className="text-sm opacity-60">Display text labels next to icons in the navigation bar.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={showNavLabels}
                      onChange={(e) => setShowNavLabels(e.target.checked)}
                  />
                  <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600`}></div>
              </label>
          </div>

          <div className="flex items-center justify-between">
              <div>
                  <div className="font-bold flex items-center gap-2"><Camera className="w-4 h-4" /> Quick Scan Button</div>
                  <div className="text-sm opacity-60">Show the floating camera button for quick invoice scanning.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={showQuickScan}
                      onChange={(e) => setShowQuickScan(e.target.checked)}
                  />
                  <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600`}></div>
              </label>
          </div>
        </div>
      </Card>

      {/* Data Management Section */}
      <Card>
        <h2 className={`text-xl font-bold flex items-center gap-2 mb-6 ${styles.accentText}`}>
           <Database className="w-5 h-5" /> Data Management
        </h2>
        <div className="space-y-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-xl text-sm mb-4">
                <div className="font-bold text-yellow-800 dark:text-yellow-500 mb-1">Backup & Restore</div>
                <p className="opacity-80">
                    Save your entire shop data (Inventory, Customers, Sales, etc.) to a file or restore from a previous backup. 
                    Useful for switching devices.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                    onClick={handleExport}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-bold ${
                        theme === 'glass' ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white' : 
                        'bg-white border-gray-200 hover:border-blue-500 hover:text-blue-600 dark:bg-gray-800 dark:border-gray-700'
                    }`}
                >
                    <Download className="w-5 h-5" /> Export Backup
                </button>
                
                <label className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-bold cursor-pointer ${
                        theme === 'glass' ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white' : 
                        'bg-white border-gray-200 hover:border-green-500 hover:text-green-600 dark:bg-gray-800 dark:border-gray-700'
                    }`}>
                    <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                    <Upload className="w-5 h-5" /> Restore Backup
                </label>
            </div>
        </div>
      </Card>

      {/* Theme Settings */}
      <Card>
        <h2 className={`text-xl font-bold flex items-center gap-2 mb-6 ${styles.accentText}`}>
           <Palette className="w-5 h-5" /> Appearance
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themeOptions.map((option) => {
            const isSelected = theme === option.id;
            let containerClass = "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-4 ";
            
            if (isSelected) {
               containerClass += "border-blue-500 bg-blue-500/5 ";
            } else {
               containerClass += "border-transparent hover:bg-black/5 dark:hover:bg-white/5 ";
               if (theme === 'glass') containerClass += "bg-white/5 border-white/10 ";
               else if (theme === 'neumorphism') containerClass += "shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff] ";
               else containerClass += "bg-gray-50 dark:bg-gray-800/50 ";
            }

            return (
              <button 
                key={option.id}
                onClick={() => setTheme(option.id)}
                className={containerClass}
              >
                <div className={`p-3 rounded-full ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                  {option.icon}
                </div>
                <div className="text-left flex-grow">
                  <div className="font-bold flex justify-between items-center">
                    {option.label}
                    {isSelected && <Check className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div className="text-sm opacity-60 mt-1">
                    {option.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>
      
      {/* About */}
       <Card>
        <h2 className={`text-lg font-bold flex items-center gap-2 mb-4 ${styles.accentText}`}>
           <AlertCircle className="w-5 h-5" /> About
        </h2>
        <div className="opacity-70 text-sm space-y-2">
            <p>TradesMen Utility v1.1.0 (Voice & Scan Enabled)</p>
            <p>Data is stored locally on your device. Clearing your browser cache will remove your inventory.</p>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
