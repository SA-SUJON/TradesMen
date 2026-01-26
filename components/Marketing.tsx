
import React, { useState, useMemo } from 'react';
import { Customer, Sale, Campaign } from '../types';
import { Card, Button, Input, Select } from './ui/BaseComponents';
import { Megaphone, Sparkles, Send, Users, AlertCircle, Trophy, Moon, Copy, Check, MessageCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { useAI } from '../contexts/AIContext';
import { openWhatsApp } from '../utils/appUtils';
import { motion, AnimatePresence } from 'framer-motion';
import useLocalStorage from '../hooks/useLocalStorage';

interface MarketingProps {
    customers: Customer[];
    sales: Sale[];
}

const Marketing: React.FC<MarketingProps> = ({ customers, sales }) => {
    const { theme } = useTheme();
    const styles = getThemeClasses(theme);
    const { sendMessage, isProcessing } = useAI();

    const [activeSegment, setActiveSegment] = useState<'all' | 'vip' | 'debt' | 'dormant'>('all');
    const [messageDraft, setMessageDraft] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [campaigns, setCampaigns] = useLocalStorage<Campaign[]>('tradesmen-campaigns', []);

    // --- SEGMENTATION LOGIC ---
    const segments = useMemo(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        // 1. VIPs: Spent more than average
        const customerSpend: Record<string, number> = {};
        sales.forEach(s => {
            if(s.customerId) customerSpend[s.customerId] = (customerSpend[s.customerId] || 0) + s.totalAmount;
        });
        const totalRev = Object.values(customerSpend).reduce((a,b) => a+b, 0);
        const avgSpend = totalRev / (Object.keys(customerSpend).length || 1);
        const vips = customers.filter(c => (customerSpend[c.id] || 0) > avgSpend);

        // 2. Debtors
        const debtors = customers.filter(c => c.debt > 0);

        // 3. Dormant: No purchase in 30 days
        const dormant = customers.filter(c => {
            const lastSale = sales
                .filter(s => s.customerId === c.id)
                .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            
            if (!lastSale) return false; // Never bought
            return new Date(lastSale.date) < thirtyDaysAgo;
        });

        return { all: customers, vip: vips, debt: debtors, dormant };
    }, [customers, sales]);

    const currentTargets = segments[activeSegment];

    // --- AI GENERATION ---
    const generateMessage = async () => {
        setIsGenerating(true);
        let prompt = "";
        
        switch(activeSegment) {
            case 'debt':
                prompt = "Write a polite, short (under 30 words) WhatsApp message reminding a customer to pay their outstanding balance at our shop. Use 1 emoji. Be professional.";
                break;
            case 'vip':
                prompt = "Write an exciting, exclusive short WhatsApp message for a VIP customer offering a special deal on their next visit. Use emojis. Under 30 words.";
                break;
            case 'dormant':
                prompt = "Write a warm, short WhatsApp message saying we miss them and inviting them back to the shop with new stock arrivals. Use emojis. Under 30 words.";
                break;
            default:
                prompt = "Write a catchy, general sales announcement for a shop WhatsApp status or broadcast. Short, punchy, emojis.";
        }

        try {
            // Use the AI context to generate
            const response = await sendMessage(`TASK: ${prompt} \n\nOUTPUT: Just the message text, nothing else.`);
            // Strip any "Manager:" prefix if it appears
            const clean = response.replace(/^Manager:\s*/i, '').replace(/^"|"$/g, '');
            setMessageDraft(clean);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(messageDraft);
        alert("Message copied!");
    };

    const saveCampaign = () => {
        if(!messageDraft) return;
        const newCamp: Campaign = {
            id: Date.now().toString(),
            name: `${activeSegment.toUpperCase()} Blast`,
            type: activeSegment === 'debt' ? 'debt' : 'offer',
            message: messageDraft,
            targetCount: currentTargets.length,
            date: new Date().toISOString()
        };
        setCampaigns(prev => [newCamp, ...prev]);
        alert("Campaign Saved to History!");
    };

    return (
        <div className="space-y-6 pb-24">
            <Card className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-none">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                        <Megaphone className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Smart Campaigns</h2>
                        <p className="opacity-80 text-sm">Boost retention with AI-powered messaging</p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: Configuration */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Segmentation Tabs */}
                    <Card>
                        <h3 className="font-bold mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-blue-500" /> Select Audience</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <button 
                                onClick={() => setActiveSegment('all')}
                                className={`p-3 rounded-xl border-2 text-center transition-all ${activeSegment === 'all' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700' : 'border-gray-100 dark:border-white/10 hover:bg-gray-50'}`}
                            >
                                <div className="text-2xl font-black mb-1">{segments.all.length}</div>
                                <div className="text-xs font-bold uppercase opacity-60">All Customers</div>
                            </button>
                            <button 
                                onClick={() => setActiveSegment('vip')}
                                className={`p-3 rounded-xl border-2 text-center transition-all ${activeSegment === 'vip' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700' : 'border-gray-100 dark:border-white/10 hover:bg-gray-50'}`}
                            >
                                <div className="text-2xl font-black mb-1">{segments.vip.length}</div>
                                <div className="text-xs font-bold uppercase opacity-60 flex items-center justify-center gap-1"><Trophy className="w-3 h-3" /> VIPs</div>
                            </button>
                            <button 
                                onClick={() => setActiveSegment('dormant')}
                                className={`p-3 rounded-xl border-2 text-center transition-all ${activeSegment === 'dormant' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700' : 'border-gray-100 dark:border-white/10 hover:bg-gray-50'}`}
                            >
                                <div className="text-2xl font-black mb-1">{segments.dormant.length}</div>
                                <div className="text-xs font-bold uppercase opacity-60 flex items-center justify-center gap-1"><Moon className="w-3 h-3" /> Dormant</div>
                            </button>
                            <button 
                                onClick={() => setActiveSegment('debt')}
                                className={`p-3 rounded-xl border-2 text-center transition-all ${activeSegment === 'debt' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700' : 'border-gray-100 dark:border-white/10 hover:bg-gray-50'}`}
                            >
                                <div className="text-2xl font-black mb-1">{segments.debt.length}</div>
                                <div className="text-xs font-bold uppercase opacity-60 flex items-center justify-center gap-1"><AlertCircle className="w-3 h-3" /> Debtors</div>
                            </button>
                        </div>
                    </Card>

                    {/* AI Writer */}
                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Sparkles className="w-32 h-32" /></div>
                        <div className="flex justify-between items-center mb-4 relative z-10">
                            <h3 className="font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-500" /> Magic Writer</h3>
                            <Button variant="secondary" onClick={generateMessage} disabled={isGenerating || isProcessing} className="text-xs px-3 h-8 gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:opacity-90">
                                {isGenerating ? 'Magic working...' : 'Auto-Generate'} <Sparkles className="w-3 h-3" />
                            </Button>
                        </div>
                        
                        <div className="relative z-10">
                            <textarea 
                                value={messageDraft}
                                onChange={(e) => setMessageDraft(e.target.value)}
                                className={`w-full h-32 p-4 rounded-xl resize-none text-base outline-none transition-all ${styles.inputWrapper} !items-start`}
                                placeholder={isGenerating ? "AI is writing your campaign..." : "Draft your message here or use Auto-Generate..."}
                            />
                            
                            <div className="flex gap-2 mt-4">
                                <Button onClick={handleCopy} disabled={!messageDraft} variant="secondary" className="flex-1 gap-2"><Copy className="w-4 h-4" /> Copy Text</Button>
                                <Button onClick={saveCampaign} disabled={!messageDraft} className="flex-1 gap-2 bg-blue-600 text-white"><Check className="w-4 h-4" /> Save Campaign</Button>
                            </div>
                        </div>
                    </Card>

                    {/* Target List */}
                    <Card>
                        <h3 className="font-bold mb-4">Target Audience ({currentTargets.length})</h3>
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-2">
                            {currentTargets.length > 0 ? currentTargets.map(c => (
                                <div key={c.id} className="flex justify-between items-center p-3 rounded-xl border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${activeSegment === 'debt' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {c.name.slice(0,1)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{c.name}</div>
                                            <div className="text-xs opacity-60">{c.phone || 'No phone'}</div>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => openWhatsApp(c.phone, messageDraft)} 
                                        disabled={!messageDraft || !c.phone}
                                        className="h-8 w-8 p-0 rounded-full flex items-center justify-center bg-green-500 text-white hover:bg-green-600 border-none shadow-sm"
                                        title="Send via WhatsApp"
                                    >
                                        <Send className="w-3.5 h-3.5 ml-0.5" />
                                    </Button>
                                </div>
                            )) : (
                                <div className="text-center py-8 opacity-50">No customers match this segment.</div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right: History */}
                <div className="lg:col-span-1">
                    <Card className="h-full">
                        <h3 className="font-bold mb-4">Campaign History</h3>
                        <div className="space-y-4">
                            {campaigns.length > 0 ? campaigns.map(camp => (
                                <div key={camp.id} className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-sm">{camp.name}</div>
                                        <div className="text-[10px] opacity-50">{new Date(camp.date).toLocaleDateString()}</div>
                                    </div>
                                    <p className="text-xs opacity-70 italic line-clamp-2 mb-2">"{camp.message}"</p>
                                    <div className="flex items-center gap-1 text-[10px] font-bold opacity-60">
                                        <Users className="w-3 h-3" /> Targets: {camp.targetCount}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-12 opacity-40">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    No past campaigns.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default Marketing;
