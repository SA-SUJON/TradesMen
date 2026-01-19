
import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Select } from './ui/BaseComponents';
import { ArrowRightLeft, Package, Box, Scale, TrendingUp, AlertTriangle, DollarSign, Calculator, Table2 } from 'lucide-react';
import { getThemeClasses } from '../utils/themeUtils';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const Conversions: React.FC = () => {
  const { theme, unitSystem } = useTheme();
  const styles = getThemeClasses(theme);
  
  const [activeTool, setActiveTool] = useState<'unit' | 'bulk'>('bulk');

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
        else if (bulkUnit === 'maund') totalBulkGrams = Number(bulkWeight) * 40 * 1000; // 1 Maund = 40kg approx
        else if (bulkUnit === 'quintal') totalBulkGrams = Number(bulkWeight) * 100 * 1000;

        // 2. Apply Wastage
        const wastePercent = Number(wastage) || 0;
        const wasteGrams = totalBulkGrams * (wastePercent / 100);
        const usableGrams = totalBulkGrams - wasteGrams;

        // 3. Convert Packet to Grams
        let singlePacketGrams = 0;
        if (packetUnit === 'g') singlePacketGrams = Number(packetWeight);
        else if (packetUnit === 'kg') singlePacketGrams = Number(packetWeight) * 1000;

        if (singlePacketGrams > 0) {
            // 4. Calculate Packets
            const totalPackets = Math.floor(usableGrams / singlePacketGrams);
            const leftoverGrams = usableGrams % singlePacketGrams;

            // 5. Cost Analysis
            // Cost Per Packet = Total Cost / Total Packets (loading entire cost onto sellable items)
            const costPerPacket = totalPackets > 0 ? Number(bulkCost) / totalPackets : 0;
            
            // 6. Sell Price
            const marginPercent = Number(margin) || 0;
            const sellingPrice = costPerPacket * (1 + marginPercent / 100);

            // 7. Total Profit
            const projectedRevenue = sellingPrice * totalPackets;
            const projectedProfit = projectedRevenue - Number(bulkCost);

            setResults({
                totalPackets,
                wasteGrams,
                costPerPacket,
                sellingPrice,
                projectedProfit,
                leftoverGrams,
                effectiveCostPerKg: (Number(bulkCost) / (usableGrams / 1000)) // Cost per usable kg
            });
        }
    } else {
        setResults(null);
    }
  }, [bulkWeight, bulkUnit, bulkCost, packetWeight, packetUnit, wastage, margin]);

  return (
    <div className="space-y-6 pb-24">
      {/* Tool Toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl">
        <button 
            onClick={() => setActiveTool('bulk')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTool === 'bulk' ? 'bg-white shadow text-blue-600 dark:bg-gray-800 dark:text-blue-400' : 'opacity-60 hover:opacity-100'}`}
        >
            <Package className="w-4 h-4" /> Bulk Repacking
        </button>
        <button 
            onClick={() => setActiveTool('unit')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTool === 'unit' ? 'bg-white shadow text-blue-600 dark:bg-gray-800 dark:text-blue-400' : 'opacity-60 hover:opacity-100'}`}
        >
            <ArrowRightLeft className="w-4 h-4" /> Unit Converter
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTool === 'bulk' ? (
             <motion.div 
                key="bulk"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
             >
                {/* Inputs */}
                <Card>
                    <h2 className={`text-xl font-bold flex items-center gap-2 mb-6 ${styles.accentText}`}>
                        <Box className="w-5 h-5" /> Bulk Details
                    </h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex gap-2">
                                <Input label="Bulk Weight" type="number" placeholder="50" value={bulkWeight} onChange={e => setBulkWeight(e.target.valueAsNumber)} />
                                <div className="w-24 flex-shrink-0">
                                    <Select label="Unit" value={bulkUnit} onChange={e => setBulkUnit(e.target.value)}>
                                        <option value="kg">KG</option>
                                        <option value="maund">Maund</option>
                                        <option value="quintal">Quintal</option>
                                    </Select>
                                </div>
                            </div>
                            <Input label="Total Cost" type="number" placeholder="5000" value={bulkCost} onChange={e => setBulkCost(e.target.valueAsNumber)} />
                        </div>

                        <div className="h-px bg-gray-200 dark:bg-white/10 my-4" />
                        
                        <h2 className={`text-md font-bold flex items-center gap-2 mb-4 opacity-80`}>
                            <Package className="w-4 h-4" /> Retail Strategy
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex gap-2">
                                <Input label="Pkt Size" type="number" placeholder="250" value={packetWeight} onChange={e => setPacketWeight(e.target.valueAsNumber)} />
                                <div className="w-20 flex-shrink-0">
                                    <Select label="Unit" value={packetUnit} onChange={e => setPacketUnit(e.target.value)}>
                                        <option value="g">g</option>
                                        <option value="kg">kg</option>
                                    </Select>
                                </div>
                            </div>
                             <Input label="Wastage %" type="number" placeholder="0" value={wastage} onChange={e => setWastage(e.target.valueAsNumber)} />
                        </div>
                        <div className="pt-2">
                             <Input label="Target Profit Margin %" type="number" placeholder="20" value={margin} onChange={e => setMargin(e.target.valueAsNumber)} />
                        </div>
                    </div>
                </Card>

                {/* Results */}
                {results ? (
                    <div className="space-y-4">
                         {/* Primary Stats */}
                         <div className="grid grid-cols-2 gap-4">
                             <Card className="!p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none">
                                 <div className="text-sm opacity-80 mb-1">Total Packets</div>
                                 <div className="text-3xl font-display font-bold">{results.totalPackets}</div>
                                 <div className="text-xs opacity-60 mt-1">Ready for sale</div>
                             </Card>
                             <Card className="!p-4 bg-white dark:bg-gray-800">
                                 <div className="text-sm opacity-60 mb-1">Sell Price / Pkt</div>
                                 <div className={`text-3xl font-display font-bold ${styles.accentText}`}>
                                    {results.sellingPrice.toFixed(2)}
                                 </div>
                                 <div className="text-xs opacity-60 mt-1">Cost: {results.costPerPacket.toFixed(2)}</div>
                             </Card>
                         </div>

                         {/* Profit & Wastage Detail */}
                         <Card className="!p-0 overflow-hidden">
                             <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                                 <div className="font-bold flex items-center gap-2">
                                     <TrendingUp className="w-4 h-4 text-green-500" /> Projected Profit
                                 </div>
                                 <div className="font-bold text-green-600 dark:text-green-400 text-lg">
                                     {results.projectedProfit.toFixed(2)}
                                 </div>
                             </div>
                             <div className="p-4 grid grid-cols-2 gap-6 text-sm">
                                 <div>
                                     <div className="opacity-60 mb-1 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3 text-orange-500" /> Invisible Loss
                                     </div>
                                     <div className="font-medium">
                                         {(results.wasteGrams / 1000).toFixed(2)} kg
                                     </div>
                                     <div className="text-xs opacity-50 mt-1">
                                         Wastage removed
                                     </div>
                                 </div>
                                 <div>
                                     <div className="opacity-60 mb-1">Effective Cost</div>
                                     <div className="font-medium">
                                         {results.effectiveCostPerKg.toFixed(2)} / kg
                                     </div>
                                      <div className="text-xs opacity-50 mt-1">
                                         After wastage
                                     </div>
                                 </div>
                             </div>
                         </Card>
                    </div>
                ) : (
                    <div className="text-center opacity-40 p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                        <Calculator className="w-8 h-8 mx-auto mb-2" />
                        Enter bulk and packet details to see calculation.
                    </div>
                )}
             </motion.div>
        ) : (
            <motion.div 
                key="unit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
            >
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
                
                <Card className="opacity-90">
                    <h2 className={`text-lg font-bold flex items-center gap-2 mb-4 ${styles.accentText}`}>
                        <Table2 className="w-5 h-5" /> Common Retail Conversions
                    </h2>
                    <div className="overflow-hidden rounded-lg border border-gray-100 dark:border-white/10">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase opacity-60 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Retail Unit</th>
                                    <th className="px-4 py-3 font-semibold text-right">Standard Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-medium">1 Dozen</td>
                                    <td className="px-4 py-3 text-right">12 Pieces</td>
                                </tr>
                                <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-medium">1 Score (Kodi)</td>
                                    <td className="px-4 py-3 text-right">20 Pieces</td>
                                </tr>
                                <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-medium">1 Gross</td>
                                    <td className="px-4 py-3 text-right">144 Pieces</td>
                                </tr>
                                <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-medium">1 Maund (Man)</td>
                                    <td className="px-4 py-3 text-right">40 KG</td>
                                </tr>
                                <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-medium">1 Quintal</td>
                                    <td className="px-4 py-3 text-right">100 KG</td>
                                </tr>
                                <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-medium">1 Metric Ton</td>
                                    <td className="px-4 py-3 text-right">1000 KG</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Conversions;
