
import React, { useState, useMemo, useRef } from 'react';
import { Customer, Sale, Campaign, BusinessProfile } from '../types';
import { Card, Button, Input, Select } from './ui/BaseComponents';
import { Megaphone, Sparkles, Send, Users, AlertCircle, Trophy, Moon, Copy, Check, MessageCircle, Globe, Facebook, Instagram, Twitter, Youtube, MapPin, Share2, Video, PenTool, ExternalLink, Linkedin, Pin, MessageSquare, ShieldCheck, Lock, Heart, Repeat, MessageCircle as CommentIcon, Bookmark, MoreHorizontal, ThumbsUp, Image as ImageIcon, X } from 'lucide-react';
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

    // Navigation State
    const [mainTab, setMainTab] = useState<'outreach' | 'social' | 'replies'>('outreach');

    // Outreach State
    const [activeSegment, setActiveSegment] = useState<'all' | 'vip' | 'debt' | 'dormant'>('all');
    const [messageDraft, setMessageDraft] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [campaigns, setCampaigns] = useLocalStorage<Campaign[]>('tradesmen-campaigns', []);

    // Social Hub State
    const [profile, setProfile] = useLocalStorage<BusinessProfile>('tradesmen-business-profile', {
        name: 'My Store',
        address: '',
        phone: '',
        email: '',
        gstin: '',
        terms: '',
        socialLinks: {}
    });
    const [selectedPlatform, setSelectedPlatform] = useState<string>('facebook');
    const [socialDraft, setSocialDraft] = useState('');
    const [platformUrlInput, setPlatformUrlInput] = useState('');
    
    // Social Image State
    const [postImages, setPostImages] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reply Assistant State
    const [customerMessage, setCustomerMessage] = useState('');
    const [replyTone, setReplyTone] = useState('professional');
    const [generatedReply, setGeneratedReply] = useState('');

    // --- OUTREACH: SEGMENTATION LOGIC ---
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

    // --- AI GENERATION (Outreach) ---
    const generateOutreachMessage = async () => {
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
            const response = await sendMessage(`TASK: ${prompt} \n\nOUTPUT: Just the message text, nothing else.`);
            const clean = response.replace(/^Manager:\s*/i, '').replace(/^"|"$/g, '');
            setMessageDraft(clean);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    // --- AI GENERATION (Social) ---
    const generateSocialPost = async () => {
        setIsGenerating(true);
        let prompt = `Write a creative, engaging social media post for ${selectedPlatform.toUpperCase()}.
        Context: Promoting ${profile.name}, a retail shop.
        Style: Professional yet catchy. Include relevant hashtags for the platform.
        Length: Optimized for ${selectedPlatform}.
        `;

        if (postImages.length > 0) {
            prompt += `\n\nAnalyze the attached image(s). Describe what is seen briefly and create the post content specifically about these products/visuals.`;
        }

        try {
            // Pass images to AI if available
            const response = await sendMessage(`TASK: ${prompt}`, postImages.length > 0 ? postImages : undefined);
            const clean = response.replace(/^Manager:\s*/i, '');
            setSocialDraft(clean);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Image Handling ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPostImages(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file as Blob);
            });
        }
    };

    const removeImage = (index: number) => {
        setPostImages(prev => prev.filter((_, i) => i !== index));
    };

    // --- AI GENERATION (Reply) ---
    const generateReply = async () => {
        if (!customerMessage) return;
        setIsGenerating(true);
        const prompt = `Write a ${replyTone} reply to this customer message: "${customerMessage}".
        Business Name: ${profile.name}.
        Goal: Resolve issue or thank them, and encourage a visit. Keep it concise.`;

        try {
            const response = await sendMessage(`TASK: ${prompt}`);
            const clean = response.replace(/^Manager:\s*/i, '');
            setGeneratedReply(clean);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
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

    const updateSocialLink = (platform: string, url: string) => {
        const newLinks = { ...profile.socialLinks, [platform]: url };
        setProfile({ ...profile, socialLinks: newLinks });
        setPlatformUrlInput('');
    };

    // --- Deep Linking Helpers ---
    const openComposer = () => {
        const text = encodeURIComponent(socialDraft);
        let url = '';
        
        switch(selectedPlatform) {
            case 'twitter': url = `https://twitter.com/intent/tweet?text=${text}`; break;
            case 'linkedin': url = `https://www.linkedin.com/sharing/share-offsite/?url=${profile.socialLinks?.website || ''}&summary=${text}`; break; 
            case 'facebook': url = `https://www.facebook.com/sharer/sharer.php?u=${profile.socialLinks?.website || ''}&quote=${text}`; break;
            case 'whatsapp': url = `https://wa.me/?text=${text}`; break;
            default: 
                handleCopy(socialDraft);
                if (currentPlatform.link) window.open(currentPlatform.link, '_blank');
                return;
        }
        if(url) window.open(url, '_blank');
    };

    // --- RENDER PREVIEWS ---
    const renderPreview = () => {
        // Use uploaded image if available, else placeholder
        const displayImage = postImages.length > 0 ? postImages[0] : "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=500&q=60";
        
        switch (selectedPlatform) {
            case 'instagram':
                return (
                    <div className="bg-white text-black rounded-sm border border-gray-200 w-full max-w-[320px] mx-auto text-sm shadow-sm font-sans">
                        <div className="p-2 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                                <div className="w-full h-full rounded-full bg-white border-2 border-transparent">
                                    <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
                                        <div className="flex items-center justify-center h-full font-bold text-[10px]">{profile.name.slice(0,2)}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="font-bold text-xs">{profile.name.toLowerCase().replace(/\s/g,'_')}</div>
                            <div className="ml-auto"><MoreHorizontal className="w-4 h-4" /></div>
                        </div>
                        <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden relative">
                            <img src={displayImage} alt="Post" className="w-full h-full object-cover" />
                            {postImages.length > 1 && (
                                <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                                    <Copy className="w-3 h-3" /> 1/{postImages.length}
                                </div>
                            )}
                        </div>
                        <div className="p-2">
                            <div className="flex gap-3 mb-2">
                                <Heart className="w-6 h-6" />
                                <CommentIcon className="w-6 h-6" />
                                <Send className="w-6 h-6" />
                                <div className="ml-auto"><Bookmark className="w-6 h-6" /></div>
                            </div>
                            <div className="font-bold text-xs mb-1">1,240 likes</div>
                            <div className="text-xs">
                                <span className="font-bold mr-1">{profile.name.toLowerCase().replace(/\s/g,'_')}</span>
                                {socialDraft || <span className="opacity-50">Your caption will appear here...</span>}
                            </div>
                        </div>
                    </div>
                );
            case 'twitter':
                return (
                    <div className="bg-white text-black p-4 rounded-xl border border-gray-200 w-full max-w-[350px] mx-auto text-sm shadow-sm font-sans">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold">
                                {profile.name.slice(0,1)}
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center gap-1">
                                    <span className="font-bold">{profile.name}</span>
                                    <span className="text-blue-500"><Check className="w-3 h-3 bg-blue-500 text-white rounded-full p-[1px]" /></span>
                                    <span className="opacity-50">@{profile.name.replace(/\s/g,'')} · 1m</span>
                                </div>
                                <div className="mt-1 whitespace-pre-wrap">
                                    {socialDraft || <span className="opacity-50">Start typing to preview tweet...</span>}
                                </div>
                                <div className="mt-2 rounded-xl overflow-hidden border border-gray-100 relative">
                                     <img src={displayImage} alt="Post" className="w-full h-32 object-cover" />
                                     {postImages.length > 1 && (
                                        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded">
                                            +{postImages.length - 1} more
                                        </div>
                                     )}
                                </div>
                                <div className="flex justify-between mt-3 opacity-60 max-w-[200px]">
                                    <CommentIcon className="w-4 h-4" />
                                    <Repeat className="w-4 h-4" />
                                    <Heart className="w-4 h-4" />
                                    <Share2 className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'linkedin':
                return (
                    <div className="bg-white text-black rounded-lg border border-gray-200 w-full max-w-[320px] mx-auto text-sm shadow-sm font-sans">
                        <div className="p-3 flex items-start gap-2">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-600">
                                {profile.name.slice(0,1)}
                            </div>
                            <div className="flex-grow">
                                <div className="font-bold text-sm leading-tight">{profile.name}</div>
                                <div className="text-xs opacity-60">Retail Business • 1st</div>
                                <div className="text-xs opacity-60 flex items-center gap-1">1h • <Globe className="w-3 h-3" /></div>
                            </div>
                        </div>
                        <div className="px-3 pb-2 text-sm whitespace-pre-wrap">
                            {socialDraft || <span className="opacity-50">Draft your professional update here...</span>}
                        </div>
                        <div className="bg-gray-100 aspect-video flex items-center justify-center overflow-hidden">
                             <img src={displayImage} alt="Post" className="w-full h-full object-cover" />
                        </div>
                        <div className="px-4 py-2 flex justify-between border-t border-gray-100 text-gray-500">
                            <div className="flex flex-col items-center gap-1"><ThumbsUp className="w-4 h-4" /><span className="text-[10px]">Like</span></div>
                            <div className="flex flex-col items-center gap-1"><MessageSquare className="w-4 h-4" /><span className="text-[10px]">Comment</span></div>
                            <div className="flex flex-col items-center gap-1"><Repeat className="w-4 h-4" /><span className="text-[10px]">Repost</span></div>
                            <div className="flex flex-col items-center gap-1"><Send className="w-4 h-4" /><span className="text-[10px]">Send</span></div>
                        </div>
                    </div>
                );
            case 'tiktok':
                return (
                    <div className="bg-black text-white rounded-2xl w-full max-w-[280px] h-[480px] mx-auto relative overflow-hidden shadow-xl border border-gray-800 font-sans">
                        <img src={displayImage} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                        
                        <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold border-2 border-white">
                                {profile.name.slice(0,1)}
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Heart className="w-8 h-8 fill-white text-white drop-shadow-md" />
                                <span className="text-xs font-bold shadow-black drop-shadow-md">1.2k</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <MessageCircle className="w-8 h-8 fill-white text-white drop-shadow-md" />
                                <span className="text-xs font-bold shadow-black drop-shadow-md">342</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Share2 className="w-8 h-8 fill-white text-white drop-shadow-md" />
                                <span className="text-xs font-bold shadow-black drop-shadow-md">Share</span>
                            </div>
                        </div>

                        <div className="absolute bottom-4 left-4 right-16 text-left">
                            <div className="font-bold text-sm mb-1 shadow-black drop-shadow-md">@{profile.name.replace(/\s/g, '').toLowerCase()}</div>
                            <div className="text-xs leading-snug shadow-black drop-shadow-md line-clamp-4">
                                {socialDraft || "Describe your video here... #viral #business"}
                            </div>
                            <div className="flex items-center gap-2 mt-2 opacity-80">
                                <div className="w-3 h-3 rounded-full bg-white/20"></div>
                                <div className="text-[10px] scrolling-text w-24 overflow-hidden whitespace-nowrap">Original Sound - {profile.name}</div>
                            </div>
                        </div>
                    </div>
                );
            case 'pinterest':
                return (
                    <div className="bg-white text-black rounded-3xl w-full max-w-[280px] mx-auto overflow-hidden shadow-md font-sans">
                        <div className="relative">
                            <img src={displayImage} className="w-full aspect-[2/3] object-cover" />
                            <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-2 rounded-full font-bold text-xs shadow-sm">Save</div>
                            <div className="absolute bottom-3 left-3 bg-white/80 p-1.5 rounded-full hover:bg-white transition-colors cursor-pointer">
                                <ExternalLink className="w-4 h-4 text-black" />
                            </div>
                        </div>
                        <div className="p-3">
                            <div className="font-bold text-sm mb-1 line-clamp-2 leading-tight">
                                {socialDraft ? socialDraft.split('\n')[0] : "Your Pin Title"}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                                    {profile.name.slice(0,1)}
                                </div>
                                <div className="text-xs opacity-70 truncate">{profile.name}</div>
                            </div>
                        </div>
                    </div>
                );
            case 'youtube':
                return (
                    <div className="bg-white text-black w-full max-w-[320px] mx-auto rounded-none font-sans">
                        <div className="aspect-video bg-black relative">
                            <img src={displayImage} className="w-full h-full object-cover opacity-90" />
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1 rounded">12:34</div>
                        </div>
                        <div className="p-3 flex gap-3 items-start">
                            <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                                {profile.name.slice(0,1)}
                            </div>
                            <div className="flex-grow">
                                <div className="font-bold text-sm leading-tight line-clamp-2 mb-1">
                                    {socialDraft ? socialDraft.split('\n')[0] : "Video Title Goes Here"}
                                </div>
                                <div className="text-xs opacity-60">
                                    {profile.name} • 1.2K views • 2 hours ago
                                </div>
                            </div>
                            <MoreHorizontal className="w-4 h-4 opacity-50 rotate-90" />
                        </div>
                    </div>
                );
            case 'googleBusiness':
                return (
                    <div className="bg-white text-black rounded-lg border border-gray-200 w-full max-w-[300px] mx-auto shadow-sm overflow-hidden font-sans">
                        <div className="p-3 flex items-center gap-2 border-b border-gray-50">
                            <img src="https://www.gstatic.com/images/branding/product/1x/google_my_business_48dp.png" className="w-5 h-5" alt="GMB" />
                            <span className="text-xs font-bold text-gray-600">Update on Search</span>
                        </div>
                        <div className="aspect-video bg-gray-100 overflow-hidden relative">
                             <img src={displayImage} className="w-full h-full object-cover" />
                             <div className="absolute bottom-0 left-0 bg-blue-600 text-white text-[10px] px-2 py-1 rounded-tr-lg">New</div>
                        </div>
                        <div className="p-3">
                            <div className="text-sm mb-3 whitespace-pre-wrap leading-relaxed text-gray-800">
                                {socialDraft || "Share your latest news, offers, or events..."}
                            </div>
                            <button className="w-full border border-gray-300 rounded text-blue-600 text-sm py-1.5 font-medium hover:bg-blue-50 transition-colors">
                                Learn more
                            </button>
                        </div>
                    </div>
                );
            case 'facebook':
            default:
                return (
                    <div className="bg-white text-black rounded-lg border border-gray-200 w-full max-w-[320px] mx-auto text-sm shadow-sm font-sans">
                        <div className="p-3 flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                                {profile.name.slice(0,1)}
                            </div>
                            <div>
                                <div className="font-bold text-sm leading-none">{profile.name}</div>
                                <div className="text-[10px] opacity-60 flex items-center gap-1">Just now · <Globe className="w-3 h-3" /></div>
                            </div>
                            <div className="ml-auto"><MoreHorizontal className="w-5 h-5 opacity-60" /></div>
                        </div>
                        <div className="px-3 pb-2 whitespace-pre-wrap">
                            {socialDraft || <span className="opacity-50">What's on your mind?</span>}
                        </div>
                        <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                            <img src={displayImage} alt="Post" className="w-full h-full object-cover" />
                        </div>
                        <div className="px-3 py-2 border-t border-gray-100 flex justify-between text-gray-500">
                            <div className="flex items-center gap-2 text-xs font-bold"><ThumbsUp className="w-4 h-4" /> Like</div>
                            <div className="flex items-center gap-2 text-xs font-bold"><MessageSquare className="w-4 h-4" /> Comment</div>
                            <div className="flex items-center gap-2 text-xs font-bold"><Share2 className="w-4 h-4" /> Share</div>
                        </div>
                    </div>
                );
        }
    };

    const platforms = [
        { id: 'facebook', label: 'Facebook', icon: <Facebook className="w-5 h-5" />, color: 'bg-blue-600', link: profile.socialLinks?.facebook },
        { id: 'instagram', label: 'Instagram', icon: <Instagram className="w-5 h-5" />, color: 'bg-pink-600', link: profile.socialLinks?.instagram },
        { id: 'twitter', label: 'X (Twitter)', icon: <Twitter className="w-5 h-5" />, color: 'bg-black', link: profile.socialLinks?.twitter },
        { id: 'googleBusiness', label: 'Google', icon: <MapPin className="w-5 h-5" />, color: 'bg-blue-500', link: profile.socialLinks?.googleBusiness },
        { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, color: 'bg-[#0077b5]', link: profile.socialLinks?.linkedin },
        { id: 'pinterest', label: 'Pinterest', icon: <Pin className="w-5 h-5" />, color: 'bg-[#E60023]', link: profile.socialLinks?.pinterest },
        { id: 'tiktok', label: 'TikTok', icon: <Video className="w-5 h-5" />, color: 'bg-black', link: profile.socialLinks?.tiktok },
        { id: 'youtube', label: 'YouTube', icon: <Youtube className="w-5 h-5" />, color: 'bg-red-600', link: profile.socialLinks?.youtube },
    ];

    const currentPlatform = platforms.find(p => p.id === selectedPlatform) || platforms[0];

    return (
        <div className="space-y-6 pb-24">
            <Card className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-none relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                        <Megaphone className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Marketing Command</h2>
                        <p className="opacity-80 text-sm">Grow your business with AI-powered campaigns</p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <ShieldCheck className="w-24 h-24" />
                </div>
            </Card>

            {/* Tab Switcher */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl overflow-x-auto scrollbar-hide">
                <button 
                    onClick={() => setMainTab('outreach')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${mainTab === 'outreach' ? 'bg-white shadow text-pink-600 dark:bg-gray-800 dark:text-pink-400' : 'opacity-60 hover:opacity-100'}`}
                >
                    <Send className="w-4 h-4" /> Direct Blast
                </button>
                <button 
                    onClick={() => setMainTab('social')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${mainTab === 'social' ? 'bg-white shadow text-blue-600 dark:bg-gray-800 dark:text-blue-400' : 'opacity-60 hover:opacity-100'}`}
                >
                    <Share2 className="w-4 h-4" /> Social Studio
                </button>
                <button 
                    onClick={() => setMainTab('replies')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${mainTab === 'replies' ? 'bg-white shadow text-purple-600 dark:bg-gray-800 dark:text-purple-400' : 'opacity-60 hover:opacity-100'}`}
                >
                    <MessageSquare className="w-4 h-4" /> Reply Assistant
                </button>
            </div>

            {/* --- OUTREACH VIEW --- */}
            {mainTab === 'outreach' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-left-4 duration-300">
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
                                <Button variant="secondary" onClick={generateOutreachMessage} disabled={isGenerating || isProcessing} className="text-xs px-3 h-8 gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:opacity-90">
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
                                    <Button onClick={() => handleCopy(messageDraft)} disabled={!messageDraft} variant="secondary" className="flex-1 gap-2"><Copy className="w-4 h-4" /> Copy Text</Button>
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
            )}

            {/* --- SOCIAL MEDIA VIEW --- */}
            {mainTab === 'social' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="lg:col-span-1 space-y-4">
                        <Card>
                            <h3 className="font-bold mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500" /> Connected Platforms</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {platforms.map(p => (
                                    <button 
                                        key={p.id}
                                        onClick={() => setSelectedPlatform(p.id)}
                                        className={`relative p-3 rounded-xl border-2 text-center transition-all group overflow-hidden ${
                                            selectedPlatform === p.id 
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                                : 'border-transparent bg-gray-50 dark:bg-white/5 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center text-white mb-2 shadow-lg ${p.link ? p.color : 'bg-gray-300 dark:bg-gray-700'}`}>
                                            {p.icon}
                                        </div>
                                        <div className="text-xs font-bold">{p.label}</div>
                                        {p.link && (
                                            <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border border-white">
                                                <Check className="w-2.5 h-2.5 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </Card>

                        <Card>
                            <h3 className="font-bold mb-4 text-sm uppercase opacity-70 flex items-center gap-2">
                                <Lock className="w-3 h-3" /> Secure Configuration
                            </h3>
                            <div className="space-y-4">
                                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center gap-3 border border-gray-100 dark:border-white/10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${currentPlatform.color}`}>
                                        {currentPlatform.icon}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="font-bold text-sm">{currentPlatform.label}</div>
                                        <div className="text-xs opacity-60 flex items-center gap-1">
                                            {currentPlatform.link ? <span className="text-green-600 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Securely Linked</span> : 'Not Linked'}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Input 
                                        placeholder={`Paste your ${currentPlatform.label} Profile URL...`}
                                        value={currentPlatform.link || platformUrlInput}
                                        onChange={(e) => setPlatformUrlInput(e.target.value)}
                                        readOnly={!!currentPlatform.link}
                                    />
                                    {currentPlatform.link ? (
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="secondary" 
                                                onClick={() => updateSocialLink(currentPlatform.id, '')}
                                                className="w-full text-red-500 border-red-200 hover:bg-red-50"
                                            >
                                                Disconnect
                                            </Button>
                                            <Button 
                                                onClick={() => window.open(currentPlatform.link, '_blank')}
                                                className="w-full"
                                            >
                                                View Page
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button 
                                            onClick={() => updateSocialLink(currentPlatform.id, platformUrlInput)}
                                            className="w-full bg-blue-600 text-white"
                                            disabled={!platformUrlInput}
                                        >
                                            Securely Link
                                        </Button>
                                    )}
                                    <p className="text-[10px] opacity-50 text-center flex items-center justify-center gap-1">
                                        <Lock className="w-3 h-3" /> Encrypted Local Storage
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        {/* Social Content Writer */}
                        <Card className="relative overflow-hidden min-h-[400px] flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-purple-500" /> 
                                        AI Content Studio
                                        <span className="text-xs font-normal opacity-60 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full">
                                            {currentPlatform.label} Mode
                                        </span>
                                    </h3>
                                </div>

                                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/10 relative h-[300px]">
                                    {!socialDraft && !isGenerating && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 pointer-events-none">
                                            <PenTool className="w-12 h-12 mb-3" />
                                            <p>Select a platform and click "Auto-Generate"</p>
                                        </div>
                                    )}
                                    
                                    <textarea 
                                        value={socialDraft}
                                        onChange={(e) => setSocialDraft(e.target.value)}
                                        className="w-full h-full bg-transparent resize-none outline-none text-base leading-relaxed placeholder-gray-400 relative z-10"
                                        placeholder={isGenerating ? "AI is crafting your post..." : "Type here..."}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                        {/* Image Upload Trigger */}
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex-shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-xs text-gray-500 hover:border-purple-500 hover:text-purple-500 transition-colors"
                                        >
                                            <ImageIcon className="w-5 h-5 mb-1" />
                                            Add
                                        </button>
                                        <input 
                                            type="file" 
                                            multiple 
                                            accept="image/*" 
                                            className="hidden" 
                                            ref={fileInputRef} 
                                            onChange={handleImageUpload}
                                        />

                                        {/* Thumbnails */}
                                        {postImages.map((img, i) => (
                                            <div key={i} className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden group border border-gray-200 dark:border-gray-700">
                                                <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                                                <button 
                                                    onClick={() => removeImage(i)}
                                                    className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <Button 
                                            onClick={generateSocialPost}
                                            className="mr-auto bg-purple-100 text-purple-700 hover:bg-purple-200 border-none"
                                            disabled={isProcessing}
                                        >
                                            <Sparkles className="w-4 h-4 mr-2" /> {isGenerating ? 'Drafting...' : 'Auto-Generate'}
                                        </Button>

                                        {socialDraft && (
                                            <>
                                                <Button variant="secondary" onClick={() => handleCopy(socialDraft)} className="gap-2">
                                                    <Copy className="w-4 h-4" /> Copy
                                                </Button>
                                                <Button onClick={openComposer} className={`gap-2 text-white ${currentPlatform.color}`}>
                                                    Post Now <ExternalLink className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Live Preview Column */}
                            <div className="w-full md:w-[320px] flex-shrink-0">
                                <div className="bg-gray-100 dark:bg-black/30 rounded-2xl p-4 h-full border border-gray-200 dark:border-white/5">
                                    <div className="text-xs font-bold opacity-50 uppercase text-center mb-4">Live {currentPlatform.label} Preview</div>
                                    {renderPreview()}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* --- REPLY ASSISTANT VIEW --- */}
            {mainTab === 'replies' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <Card>
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-orange-500" /> Incoming Message
                        </h3>
                        <p className="text-sm opacity-60 mb-3">Paste the customer's comment or DM here.</p>
                        <textarea 
                            value={customerMessage}
                            onChange={(e) => setCustomerMessage(e.target.value)}
                            className={`w-full h-40 p-4 rounded-xl resize-none text-base outline-none transition-all ${styles.inputWrapper} !items-start`}
                            placeholder="e.g. 'Do you have this item in blue?' or 'My order is late!'"
                        />
                        <div className="mt-4">
                            <label className="text-xs font-bold opacity-60 uppercase mb-2 block">Reply Tone</label>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {['Professional', 'Friendly', 'Apologetic', 'Salesy'].map(tone => (
                                    <button
                                        key={tone}
                                        onClick={() => setReplyTone(tone.toLowerCase())}
                                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${replyTone === tone.toLowerCase() ? 'bg-blue-100 text-blue-700 border-blue-200 font-bold' : 'bg-gray-50 border-transparent opacity-60'}`}
                                    >
                                        {tone}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Button onClick={generateReply} className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white border-none" disabled={!customerMessage || isGenerating}>
                            {isGenerating ? 'Drafting Reply...' : 'Generate Magic Reply'} <Sparkles className="w-4 h-4 ml-2" />
                        </Button>
                    </Card>

                    <Card className="relative">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <PenTool className="w-5 h-5 text-green-500" /> AI Suggested Reply
                        </h3>
                        <div className={`w-full h-64 p-4 rounded-xl border ${generatedReply ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10'}`}>
                            {generatedReply ? (
                                <textarea 
                                    value={generatedReply}
                                    onChange={(e) => setGeneratedReply(e.target.value)}
                                    className="w-full h-full bg-transparent resize-none outline-none text-base"
                                />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-40">
                                    <Sparkles className="w-12 h-12 mb-2" />
                                    <p>Waiting for input...</p>
                                </div>
                            )}
                        </div>
                        {generatedReply && (
                            <div className="flex gap-2 mt-4">
                                <Button variant="secondary" onClick={() => handleCopy(generatedReply)} className="flex-1 gap-2">
                                    <Copy className="w-4 h-4" /> Copy Text
                                </Button>
                                <Button onClick={() => setGeneratedReply('')} variant="secondary" className="px-3 text-red-500 hover:bg-red-50">
                                    Clear
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Marketing;
