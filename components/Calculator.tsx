import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Card, Input, Button, Select } from './ui/BaseComponents';
import { Calculator as CalcIcon, DollarSign, RefreshCw, Volume2, VolumeX, Scale, ScanBarcode, TrendingDown, CheckCircle2 } from 'lucide-react';
import { getThemeClasses } from '../utils/themeUtils';
import { useTheme } from '../contexts/ThemeContext';
import { speak, formatUnit } from '../utils/appUtils';
import BarcodeScanner from './BarcodeScanner';

interface CalculatorProps {
  inventory: Product[];
}

const Calculator: React.FC<CalculatorProps> = ({ inventory }) => {
  const { theme, voiceEnabled, setVoiceEnabled, unitSystem, setUnitSystem } = useTheme();
  const styles = getThemeClasses(theme);
  
  const [mode, setMode] = useState<'price_to_weight' | 'weight_to_price' | 'value_compare'>('weight_to_price');
  const [basePrice, setBasePrice] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [targetPrice, setTargetPrice] = useState<number | ''>('');
  
  // Comparison Mode State
  const [compA, setCompA] = useState({ weight: '' as number | '', unit: 'g', price: '' as number | '' });
  const [compB, setCompB] = useState({ weight: '' as number | '', unit: 'kg', price: '' as number | '' });

  // Scanner State
  const [showScanner, setShowScanner] = useState(false);
  
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
        speak(`${prod.name} selected. Price is ${prod.sellingPrice} per kilo.`, voiceEnabled);
      }
    }
  }, [selectedProduct, inventory, voiceEnabled]);

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
    } else if (mode === 'price_to_weight') {
      const p = Number(targetPrice);
      if (p) {
        const w = (p / bp) * 1000;
        setWeight(parseFloat(w.toFixed(2)));
      }
    }
  };

  const handleScan = (code: string) => {
      const prod = inventory.find(p => p.barcode === code || p.id === code);
      if (prod) {
          setSelectedProduct(prod.id);
          speak(`Found ${prod.name}`, voiceEnabled);
      } else {
          alert("Product not found in inventory!");
          speak("Product not found", voiceEnabled);
      }
      setShowScanner(false);
  };

  useEffect(() => {
    if (mode !== 'value_compare') {
        calculate();
    }
    
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

  // Comparison Logic
  const getRatePerGram = (w: number, u: string, p: number) => {
      if (!w || !p) return 0;
      const mass = u === 'kg' ? w * 1000 : w;
      return p / mass;
  };
  const rateA = getRatePerGram(Number(compA.weight), compA.unit, Number(compA.price));
  const rateB = getRatePerGram(Number(compB.weight), compB.unit, Number(compB.price));
  
  let winner: 'A' | 'B' | 'Tie' | null = null;
  let savings = 0;
  
  if (rateA > 0 && rateB > 0) {
      if (rateA < rateB) {
          winner = 'A';
          savings = ((rateB - rateA) / rateB) * 100;
      } else if (rateB < rateA) {
          winner = 'B';
          savings = ((rateA - rateB) / rateA) * 100;
      } else {
          winner = 'Tie';
      }
  }

  return (
    <div className="space-y-6">
      {showScanner && <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Calculator */}
        <Card className="h-full relative">
            {/* Tool Bar */}
            <div className="absolute top-4 right-4 flex gap-2">
                <button 
                    onClick={() => setUnitSystem(unitSystem === 'metric' ? 'local' : 'metric')}
                    className={`p-2 rounded-full transition-all ${theme === 'glass' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800'}`}
                    title="Toggle Units (Metric/Local)"
                >
                    <Scale className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`p-2 rounded-full transition-all ${theme === 'glass' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800'}`}
                    title="Toggle Voice"
                >
                    {voiceEnabled ? <Volume2 className="w-4 h-4 text-blue-500" /> : <VolumeX className="w-4 h-4 opacity-50" />}
                </button>
            </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold flex items-center gap-2 ${styles.accentText}`}>
              <CalcIcon className="w-5 h-5" /> Quick Calculator
            </h2>
          </div>
          
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button 
                    onClick={() => setMode('weight_to_price')}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${mode === 'weight_to_price' ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' : 'opacity-60 hover:opacity-100'}`}
                >
                    Find Price
                </button>
                <button 
                    onClick={() => setMode('price_to_weight')}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${mode === 'price_to_weight' ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' : 'opacity-60 hover:opacity-100'}`}
                >
                    Find Weight
                </button>
                <button 
                    onClick={() => setMode('value_compare')}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${mode === 'value_compare' ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' : 'opacity-60 hover:opacity-100'}`}
                >
                    Compare Value
                </button>
          </div>

          {mode !== 'value_compare' ? (
              <div className="space-y-4">
                 <div className="flex gap-2 items-end">
                     <div className="flex-grow">
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
                     </div>
                     <Button onClick={() => setShowScanner(true)} className="mb-[2px] px-3" title="Scan Barcode">
                         <ScanBarcode className="w-5 h-5" />
                     </Button>
                 </div>

                <div className="flex gap-4 items-end">
                    <Input 
                        label="Price per KG" 
                        type="number" 
                        placeholder="0.00" 
                        value={basePrice} 
                        onChange={(e) => setBasePrice(e.target.valueAsNumber || '')}
                    />
                    <Button variant="secondary" onClick={() => { setBasePrice(''); setSelectedProduct(''); setWeight(''); setTargetPrice(''); }} className="mb-[2px] px-3">
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label={mode === 'weight_to_price' ? "Weight (Grams)" : "Weight (Result)"}
                    type="number" 
                    placeholder="Grams" 
                    value={weight} 
                    readOnly={mode === 'price_to_weight'}
                    onChange={(e) => setWeight(e.target.valueAsNumber || '')}
                    className={mode === 'price_to_weight' ? 'opacity-70 cursor-not-allowed font-bold' : ''}
                  />
                  <Input 
                    label={mode === 'weight_to_price' ? "Price (Result)" : "Target Price"}
                    type="number" 
                    placeholder="Amount" 
                    value={targetPrice} 
                    readOnly={mode === 'weight_to_price'}
                    onChange={(e) => setTargetPrice(e.target.valueAsNumber || '')}
                    className={mode === 'weight_to_price' ? 'opacity-70 cursor-not-allowed font-bold' : ''}
                  />
                </div>
                
                {/* Results Display Area */}
                {mode === 'weight_to_price' && targetPrice && (
                     <div className={`mt-4 p-4 rounded-lg text-center ${theme === 'glass' ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        <span className="text-sm opacity-70">Final Price</span>
                        <div className={`text-3xl font-bold ${styles.accentText}`}>
                            {Number(targetPrice).toLocaleString()}
                        </div>
                        {/* Speak Button for Result */}
                        <div className="mt-2">
                            <button 
                                onClick={() => speak(`The price is ${targetPrice}`, true)}
                                className="text-xs opacity-50 hover:opacity-100 flex items-center justify-center gap-1 mx-auto"
                            >
                                <Volume2 className="w-3 h-3" /> Replay
                            </button>
                        </div>
                     </div>
                )}
                 {mode === 'price_to_weight' && weight && (
                     <div className={`mt-4 p-4 rounded-lg text-center ${theme === 'glass' ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        <span className="text-sm opacity-70">Weight Needed</span>
                        <div className={`text-3xl font-bold ${styles.accentText}`}>
                            {unitSystem === 'local' 
                                ? formatUnit(Number(weight), 'g', 'local') 
                                : `${Number(weight).toLocaleString()} g`
                            }
                        </div>
                        <div className="text-sm opacity-70">
                            ({(Number(weight)/1000).toFixed(3)} kg)
                        </div>
                     </div>
                )}
              </div>
          ) : (
              // VALUE COMPARISON MODE
              <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                      {/* Item A */}
                      <div className={`p-3 rounded-xl border-2 transition-all ${winner === 'A' ? 'border-green-500 bg-green-50/50 dark:bg-green-900/20' : 'border-transparent bg-gray-50 dark:bg-white/5'}`}>
                          <div className="text-xs font-bold opacity-50 mb-2 uppercase text-center">Option A</div>
                          <div className="space-y-2">
                              <div className="flex gap-1">
                                  <Input placeholder="Qty" type="number" value={compA.weight} onChange={e => setCompA({...compA, weight: e.target.valueAsNumber || ''})} className="min-w-0" />
                                  <Select value={compA.unit} onChange={e => setCompA({...compA, unit: e.target.value})} className="w-16 px-1">
                                      <option value="g">g</option>
                                      <option value="kg">kg</option>
                                  </Select>
                              </div>
                              <Input placeholder="Price" type="number" value={compA.price} onChange={e => setCompA({...compA, price: e.target.valueAsNumber || ''})} />
                          </div>
                      </div>

                      {/* Item B */}
                      <div className={`p-3 rounded-xl border-2 transition-all ${winner === 'B' ? 'border-green-500 bg-green-50/50 dark:bg-green-900/20' : 'border-transparent bg-gray-50 dark:bg-white/5'}`}>
                          <div className="text-xs font-bold opacity-50 mb-2 uppercase text-center">Option B</div>
                          <div className="space-y-2">
                              <div className="flex gap-1">
                                  <Input placeholder="Qty" type="number" value={compB.weight} onChange={e => setCompB({...compB, weight: e.target.valueAsNumber || ''})} className="min-w-0" />
                                  <Select value={compB.unit} onChange={e => setCompB({...compB, unit: e.target.value})} className="w-16 px-1">
                                      <option value="g">g</option>
                                      <option value="kg">kg</option>
                                  </Select>
                              </div>
                              <Input placeholder="Price" type="number" value={compB.price} onChange={e => setCompB({...compB, price: e.target.valueAsNumber || ''})} />
                          </div>
                      </div>
                  </div>

                  {/* Result Banner */}
                  <div className={`p-4 rounded-xl text-center transition-all min-h-[100px] flex flex-col justify-center items-center ${
                      winner ? (winner === 'Tie' ? 'bg-gray-100 dark:bg-white/10' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200') : 'bg-gray-50 dark:bg-white/5 opacity-50'
                  }`}>
                      {winner ? (
                          <>
                             {winner === 'Tie' ? (
                                 <div className="font-bold text-lg">Both options offer the same value.</div>
                             ) : (
                                 <>
                                    <div className="text-sm font-bold opacity-70 uppercase tracking-wide mb-1">Better Value</div>
                                    <div className="text-2xl font-black flex items-center gap-2">
                                        <CheckCircle2 className="w-6 h-6" /> Option {winner}
                                    </div>
                                    <div className="mt-1 font-medium flex items-center gap-1">
                                        <TrendingDown className="w-4 h-4" /> Save {savings.toFixed(1)}%
                                    </div>
                                 </>
                             )}
                          </>
                      ) : (
                          <div className="text-sm">Enter details for both items to compare.</div>
                      )}
                  </div>
              </div>
          )}
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