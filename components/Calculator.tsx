import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Card, Input, Button, Select } from './ui/BaseComponents';
import { Calculator as CalcIcon, DollarSign, RefreshCw } from 'lucide-react';
import { getThemeClasses } from '../utils/themeUtils';
import { useTheme } from '../contexts/ThemeContext';

interface CalculatorProps {
  inventory: Product[];
}

const Calculator: React.FC<CalculatorProps> = ({ inventory }) => {
  const { theme } = useTheme();
  const styles = getThemeClasses(theme);
  
  const [mode, setMode] = useState<'price_to_weight' | 'weight_to_price'>('weight_to_price');
  const [basePrice, setBasePrice] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [targetPrice, setTargetPrice] = useState<number | ''>('');
  
  // Profit Checker State
  const [buyingPrice, setBuyingPrice] = useState<number | ''>('');
  const [profit, setProfit] = useState<{value: number, percent: number} | null>(null);

  // Preset Selection
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  useEffect(() => {
    if (selectedProduct) {
      const prod = inventory.find(p => p.id === selectedProduct);
      if (prod) {
        setBasePrice(prod.sellingPrice);
        if (prod.buyingPrice) setBuyingPrice(prod.buyingPrice);
      }
    }
  }, [selectedProduct, inventory]);

  const calculate = () => {
    const bp = Number(basePrice);
    if (!bp) return;

    if (mode === 'weight_to_price') {
      const w = Number(weight);
      if (w) {
        // Base price is usually per kg (1000g)
        const price = (bp / 1000) * w;
        setTargetPrice(parseFloat(price.toFixed(2)));
      }
    } else {
      const p = Number(targetPrice);
      if (p) {
        const w = (p / bp) * 1000;
        setWeight(parseFloat(w.toFixed(2)));
      }
    }
  };

  useEffect(() => {
    calculate();
    
    // Calculate Profit
    if (basePrice && buyingPrice) {
        const sell = Number(basePrice);
        const buy = Number(buyingPrice);
        const profitVal = sell - buy;
        const profitPercent = (profitVal / buy) * 100;
        setProfit({ value: profitVal, percent: profitPercent });
    } else {
        setProfit(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePrice, weight, targetPrice, mode, buyingPrice]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Calculator */}
        <Card className="h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold flex items-center gap-2 ${styles.accentText}`}>
              <CalcIcon className="w-5 h-5" /> Quick Calculator
            </h2>
            <button 
                onClick={() => setMode(m => m === 'weight_to_price' ? 'price_to_weight' : 'weight_to_price')}
                className={`text-sm underline opacity-70 hover:opacity-100 ${styles.accentText}`}
            >
                Switch to {mode === 'weight_to_price' ? 'Find Weight' : 'Find Price'}
            </button>
          </div>

          <div className="space-y-4">
             <Select 
                label="Load Preset Item" 
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
            >
                <option value="">-- Select Item --</option>
                {inventory.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (@ {p.sellingPrice}/kg)</option>
                ))}
            </Select>

            <div className="flex gap-4 items-end">
                <Input 
                    label="Price per KG" 
                    type="number" 
                    placeholder="0.00" 
                    value={basePrice} 
                    onChange={(e) => setBasePrice(e.target.valueAsNumber || '')}
                />
                <Button variant="secondary" onClick={() => { setBasePrice(''); setSelectedProduct(''); }} className="mb-[2px] px-3">
                    <RefreshCw className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label={mode === 'weight_to_price' ? "Weight (Grams)" : "Weight (Calculated)"}
                type="number" 
                placeholder="Grams" 
                value={weight} 
                readOnly={mode === 'price_to_weight'}
                onChange={(e) => setWeight(e.target.valueAsNumber || '')}
                className={mode === 'price_to_weight' ? 'opacity-70 cursor-not-allowed font-bold' : ''}
              />
              <Input 
                label={mode === 'weight_to_price' ? "Price (Calculated)" : "Target Price"}
                type="number" 
                placeholder="Amount" 
                value={targetPrice} 
                readOnly={mode === 'weight_to_price'}
                onChange={(e) => setTargetPrice(e.target.valueAsNumber || '')}
                className={mode === 'weight_to_price' ? 'opacity-70 cursor-not-allowed font-bold' : ''}
              />
            </div>
            
            {mode === 'weight_to_price' && targetPrice && (
                 <div className={`mt-4 p-4 rounded-lg text-center ${theme === 'glass' ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <span className="text-sm opacity-70">Final Price</span>
                    <div className={`text-3xl font-bold ${styles.accentText}`}>
                        {Number(targetPrice).toLocaleString()}
                    </div>
                 </div>
            )}
             {mode === 'price_to_weight' && weight && (
                 <div className={`mt-4 p-4 rounded-lg text-center ${theme === 'glass' ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <span className="text-sm opacity-70">Weight Needed</span>
                    <div className={`text-3xl font-bold ${styles.accentText}`}>
                        {Number(weight).toLocaleString()} g
                    </div>
                    <div className="text-sm opacity-70">
                        ({(Number(weight)/1000).toFixed(3)} kg)
                    </div>
                 </div>
            )}
          </div>
        </Card>

        {/* Profit Checker */}
        <Card className="h-full">
           <h2 className={`text-xl font-bold flex items-center gap-2 mb-6 ${styles.accentText}`}>
              <DollarSign className="w-5 h-5" /> Profit Analysis
            </h2>
            <div className="space-y-4">
                <Input 
                    label="Buying Price (per KG)"
                    type="number"
                    placeholder="Cost Price"
                    value={buyingPrice}
                    onChange={(e) => setBuyingPrice(e.target.valueAsNumber || '')}
                />
                 <Input 
                    label="Selling Price (per KG)"
                    type="number"
                    value={basePrice}
                    readOnly
                    className="opacity-60"
                />
                
                {profit && (
                    <div className={`mt-6 p-4 rounded-xl border-l-4 ${profit.value >= 0 ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-medium opacity-80">Net Profit/Loss per KG</span>
                            <span className={`font-bold text-lg ${profit.value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {profit.value >= 0 ? '+' : ''}{profit.value.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-medium opacity-80">Margin</span>
                             <span className={`font-bold ${profit.value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {profit.percent.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                )}
                {!buyingPrice && (
                    <div className="mt-6 p-4 text-center opacity-50 text-sm">
                        Enter buying price to see profit margin
                    </div>
                )}
            </div>
        </Card>
      </div>
    </div>
  );
};

export default Calculator;
