import React, { useState } from 'react';
import { Card, Input } from './ui/BaseComponents';
import { ArrowRightLeft } from 'lucide-react';
import { getThemeClasses } from '../utils/themeUtils';
import { useTheme } from '../contexts/ThemeContext';

const Conversions: React.FC = () => {
  const { theme } = useTheme();
  const styles = getThemeClasses(theme);
  
  // Weight State
  const [gram, setGram] = useState<number | ''>('');
  const [kg, setKg] = useState<number | ''>('');
  const [pound, setPound] = useState<number | ''>('');
  const [ounce, setOunce] = useState<number | ''>('');

  const handleGram = (val: number) => {
    setGram(val);
    setKg(val ? Number((val / 1000).toFixed(4)) : '');
    setPound(val ? Number((val * 0.00220462).toFixed(4)) : '');
    setOunce(val ? Number((val * 0.035274).toFixed(4)) : '');
  };

  const handleKg = (val: number) => {
    setKg(val);
    setGram(val ? Number((val * 1000).toFixed(1)) : '');
    setPound(val ? Number((val * 2.20462).toFixed(4)) : '');
    setOunce(val ? Number((val * 35.274).toFixed(4)) : '');
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className={`text-xl font-bold flex items-center gap-2 mb-6 ${styles.accentText}`}>
            <ArrowRightLeft className="w-5 h-5" /> Weight Converter
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Input 
                label="Grams (g)"
                type="number"
                value={gram}
                onChange={(e) => handleGram(e.target.valueAsNumber)}
            />
             <Input 
                label="Kilograms (kg)"
                type="number"
                value={kg}
                onChange={(e) => handleKg(e.target.valueAsNumber)}
            />
            <Input 
                label="Pounds (lb)"
                type="number"
                value={pound}
                readOnly
                className="opacity-70 cursor-not-allowed"
            />
            <Input 
                label="Ounces (oz)"
                type="number"
                value={ounce}
                readOnly
                className="opacity-70 cursor-not-allowed"
            />
        </div>
      </Card>
      
       <Card className="opacity-70">
        <h2 className={`text-lg font-bold flex items-center gap-2 mb-4 ${styles.accentText}`}>
            Common Retail Units
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className={`p-3 rounded-lg ${theme === 'material' ? 'bg-indigo-50' : 'bg-black/5 dark:bg-white/5'}`}>
                <div className="font-bold">1 Dozen</div>
                <div>12 Pcs</div>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'material' ? 'bg-indigo-50' : 'bg-black/5 dark:bg-white/5'}`}>
                <div className="font-bold">1 Gross</div>
                <div>144 Pcs</div>
            </div>
             <div className={`p-3 rounded-lg ${theme === 'material' ? 'bg-indigo-50' : 'bg-black/5 dark:bg-white/5'}`}>
                <div className="font-bold">1 Metric Ton</div>
                <div>1000 KG</div>
            </div>
             <div className={`p-3 rounded-lg ${theme === 'material' ? 'bg-indigo-50' : 'bg-black/5 dark:bg-white/5'}`}>
                <div className="font-bold">1 Quintal</div>
                <div>100 KG</div>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default Conversions;
