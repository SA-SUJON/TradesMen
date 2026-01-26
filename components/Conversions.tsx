
import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Select } from './ui/BaseComponents';
import { ArrowRightLeft, Package, Box, Scale, TrendingUp, AlertTriangle, DollarSign, Calculator, Table2, Coins, RefreshCw } from 'lucide-react';
import { getThemeClasses } from '../utils/themeUtils';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CURRENCIES } from '../utils/currencyList';

const Conversions: React.FC = () => {
  const { theme, unitSystem, currencyCode } = useTheme();
  const styles = getThemeClasses(theme);
  
  const [activeTool, setActiveTool] = useState<'unit' | 'bulk' | 'currency'>('currency');

  // --- CURRENCY CONVERTER STATE ---
  const [fromCurrency, setFromCurrency] = useState(currencyCode || 'USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState<number | ''>(1);
  const [result, setResult] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchRate = async () => {
      setIsLoadingRate(true);
      try {
          const response = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
          const data = await response.json();
          if (data && data.rates && data.rates[toCurrency]) {
              const rate = data.rates[toCurrency];
              setExchangeRate(rate);
              setLastUpdated(new Date(data.time_last_update_utc).toLocaleDateString());
          } else {
              setExchangeRate(null);
          }
      } catch (e) {
          console.error("Failed to fetch rates", e);
          setExchangeRate(null);
      } finally {
          setIsLoadingRate(false);
      }
  };

  useEffect(() => {
      fetchRate();
  }, [fromCurrency, toCurrency]);

  useEffect(() => {
      if (amount && exchangeRate) {
          setResult(Number(amount) * exchangeRate);
      } else {
          setResult(null);
      }
  }, [amount, exchangeRate]);

  // --- UNIT CONVERTER STATE ---
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

  // --- BULK REPACKING STATE ---
  const [bulkWeight, setBulkWeight] = useState<number | ''>('');
  const [bulkUnit, setBulkUnit] = useState('kg'); // kg, maund, quintal
  const [bulkCost, setBulkCost] = useState<number | ''>('');
  
  const [packetWeight, setPacketWeight] = useState<number | ''>('');
  const [packetUnit, setPacketUnit] = useState('g'); // g, kg
  
  const [wastage, setWastage] = useState<number | ''>(0); // percentage
  const [margin, setMargin] = useState<number | ''>(20); // percentage

  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (bulkWeight && bulkCost && packetWeight) {
        // 1. Convert Bulk to Grams
        let totalBulkGrams = 0;
        if (bulkUnit === 'kg') totalBulkGrams = Number(bulkWeight) * 1000;
        else if (bulkUnit === 'maund') totalBulkGrams = Number(bulkWeight) * 40 * 1000;
        else if (bulkUnit === 'quintal') totalBulkGrams = Number(bulkWeight) * 100 * 1000;

        // 2. Apply Wastage
        const wastePercent = Number(wastage) || 0;
        const wasteGrams = totalBulkGrams * (wastePercent / 100);
        const usableGrams = totalBulkGrams - wasteGrams;
        
        // 3. Packet Size in Grams
        let packetGrams = 0;
        if (packetUnit === 'g') packetGrams = Number(packetWeight);
        else if (packetUnit === 'kg') packetGrams = Number(packetWeight) * 1000;

        if (packetGrams > 0) {
             const numPackets = Math.floor(usableGrams / packetGrams);
             const costPerPacket = Number(bulkCost) / numPackets;
             const marginPercent = Number(margin) || 0;
             const sellingPrice = costPerPacket * (1 + marginPercent / 100);
             const totalRevenue = numPackets * sellingPrice;
             const totalProfit = totalRevenue - Number(bulkCost);

             setResults({
                 numPackets,
                 costPerPacket,
                 sellingPrice,
                 totalProfit,
                 wasteGrams
             });
        }
    } else {
        setResults(null);
    }
  }, [bulkWeight, bulkUnit, bulkCost, packetWeight, packetUnit, wastage, margin]);

  return (
    <div className="space-y-6 pb-24">
        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl overflow-x-auto scrollbar-hide">
             <button onClick={() => setActiveTool('currency')} className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTool === 'currency' ? 'bg-white shadow text-blue-600 dark:bg-gray-800 dark:text-blue-400' : 'opacity-60'}`}>Currency</button>
             <button onClick={() => setActiveTool('unit')} className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTool === 'unit' ? 'bg-white shadow text-purple-600 dark:bg-gray-800 dark:text-purple-400' : 'opacity-60'}`}>Units</button>
             <button onClick={() => setActiveTool('bulk')} className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTool === 'bulk' ? 'bg-white shadow text-green-600 dark:bg-gray-800 dark:text-green-400' : 'opacity-60'}`}>Bulk Repack</button>
        </div>

        <AnimatePresence mode="wait">
             {activeTool === 'currency' && (
                 <motion.div key="currency" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                     <Card>
                         <h3 className="font-bold flex items-center gap-2 mb-4"><Coins className="w-5 h-5 text-blue-500" /> Exchange Rates</h3>
                         <div className="flex flex-col gap-4">
                             <div className="flex items-end gap-2">
                                 <div className="flex-grow">
                                     <label className="text-xs font-bold opacity-60 mb-1 block">Amount</label>
                                     <input type="number" value={amount} onChange={e => setAmount(e.target.valueAsNumber)} className="w-full text-3xl font-bold bg-transparent border-b border-gray-200 outline-none pb-2" />
                                 </div>
                                 <div className="w-1/3">
                                     <Select value={fromCurrency} onChange={e => setFromCurrency(e.target.value)}>
                                         {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                     </Select>
                                 </div>
                             </div>
                             
                             <div className="flex justify-center -my-2 relative z-10">
                                 <button onClick={() => { const temp = fromCurrency; setFromCurrency(toCurrency); setToCurrency(temp); }} className="p-2 bg-gray-100 rounded-full border border-white shadow-sm hover:rotate-180 transition-transform"><ArrowRightLeft className="w-4 h-4" /></button>
                             </div>

                             <div className="flex items-end gap-2 bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                                  <div className="flex-grow">
                                     <label className="text-xs font-bold opacity-60 mb-1 block">Result</label>
                                     <div className="text-3xl font-bold text-blue-600">{result ? result.toFixed(2) : '...'}</div>
                                 </div>
                                 <div className="w-1/3">
                                     <Select value={toCurrency} onChange={e => setToCurrency(e.target.value)}>
                                         {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                     </Select>
                                 </div>
                             </div>
                             
                             <div className="flex justify-between items-center text-xs opacity-50 mt-2">
                                 <div className="flex items-center gap-2">
                                     <span>1 {fromCurrency} = {exchangeRate ? exchangeRate.toFixed(4) : '...'} {toCurrency}</span>
                                     <button 
                                        onClick={fetchRate}
                                        disabled={isLoadingRate}
                                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
                                        title="Refresh Rates"
                                     >
                                         <RefreshCw className={`w-3 h-3 ${isLoadingRate ? 'animate-spin' : ''}`} />
                                     </button>
                                 </div>
                                 <span>Updated: {lastUpdated}</span>
                             </div>
                         </div>
                     </Card>
                 </motion.div>
             )}

             {activeTool === 'unit' && (
                 <motion.div key="unit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                     <Card>
                         <h3 className="font-bold flex items-center gap-2 mb-4"><Scale className="w-5 h-5 text-purple-500" /> Weight Converter</h3>
                         <div className="grid grid-cols-2 gap-4">
                             <Input label="Grams (g)" type="number" value={gram} onChange={e => handleGram(e.target.valueAsNumber)} />
                             <Input label="Kilograms (kg)" type="number" value={kg} onChange={e => handleKg(e.target.valueAsNumber)} />
                             {/* Removed custom opaque styles, relying on new theme utils */}
                             <Input label="Pounds (lbs)" type="number" value={pound} readOnly />
                             <Input label="Ounces (oz)" type="number" value={ounce} readOnly />
                         </div>
                     </Card>
                 </motion.div>
             )}

             {activeTool === 'bulk' && (
                 <motion.div key="bulk" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                     <Card>
                         <h3 className="font-bold flex items-center gap-2 mb-4"><Package className="w-5 h-5 text-green-500" /> Repacking Calculator</h3>
                         
                         <div className="space-y-4">
                             <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                                 <div className="text-xs font-bold opacity-50 uppercase mb-2">Bulk Source</div>
                                 <div className="grid grid-cols-2 gap-3">
                                     <Input label="Total Weight" type="number" value={bulkWeight} onChange={e => setBulkWeight(e.target.valueAsNumber)} />
                                     <Select label="Unit" value={bulkUnit} onChange={e => setBulkUnit(e.target.value)}>
                                         <option value="kg">KG</option>
                                         <option value="maund">Maund (40kg)</option>
                                         <option value="quintal">Quintal (100kg)</option>
                                     </Select>
                                     <div className="col-span-2"><Input label="Total Cost" type="number" value={bulkCost} onChange={e => setBulkCost(e.target.valueAsNumber)} /></div>
                                     <div className="col-span-2"><Input label="Wastage %" type="number" value={wastage} onChange={e => setWastage(e.target.valueAsNumber)} /></div>
                                 </div>
                             </div>

                             <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                                 <div className="text-xs font-bold opacity-50 uppercase mb-2">Packet Target</div>
                                 <div className="grid grid-cols-2 gap-3">
                                     <Input label="Packet Weight" type="number" value={packetWeight} onChange={e => setPacketWeight(e.target.valueAsNumber)} />
                                     <Select label="Unit" value={packetUnit} onChange={e => setPacketUnit(e.target.value)}>
                                         <option value="g">Grams</option>
                                         <option value="kg">KG</option>
                                     </Select>
                                     <div className="col-span-2"><Input label="Target Margin %" type="number" value={margin} onChange={e => setMargin(e.target.valueAsNumber)} /></div>
                                 </div>
                             </div>

                             {results && (
                                 <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                                     <h4 className="font-bold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2"><Table2 className="w-4 h-4" /> Results</h4>
                                     <div className="space-y-2 text-sm">
                                         <div className="flex justify-between"><span>Packets Created:</span> <strong>{results.numPackets}</strong></div>
                                         <div className="flex justify-between"><span>Cost per Packet:</span> <strong>{results.costPerPacket.toFixed(2)}</strong></div>
                                         <div className="flex justify-between text-lg border-t border-green-200 pt-1 mt-1"><span>Sell Price:</span> <strong className="text-green-700 dark:text-green-400">{results.sellingPrice.toFixed(2)}</strong></div>
                                         <div className="flex justify-between opacity-70"><span>Total Profit:</span> <span>{results.totalProfit.toFixed(2)}</span></div>
                                     </div>
                                 </div>
                             )}
                         </div>
                     </Card>
                 </motion.div>
             )}
        </AnimatePresence>
    </div>
  );
};

export default Conversions;
