
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Product, CartItem, ChatMessage, ChatSession, Sale, Expense, Customer, AIConfig, BusinessProfile } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

interface AIContextType {
  messages: ChatMessage[];
  sendMessage: (text: string, images?: string[]) => Promise<string>; 
  filterInventory: (query: string, currentInventory: Product[]) => Promise<string[]>;
  isProcessing: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  showAssistant: boolean;
  setShowAssistant: (show: boolean) => void;
  // Settings Config
  apiKey: string;
  setApiKey: (key: string) => void;
  aiModel: string;
  setAiModel: (model: string) => void;
  aiConfig: AIConfig;
  setAiConfig: (config: AIConfig | ((val: AIConfig) => AIConfig)) => void;
  // History Management
  sessions: ChatSession[];
  currentSessionId: string | null;
  startNewChat: () => void;
  loadSession: (id: string) => void;
  deleteSession: (id: string) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

interface AIProviderProps {
  children: ReactNode;
  inventory: Product[];
  setInventory: (inv: Product[] | ((val: Product[]) => Product[])) => void;
  cart: CartItem[];
  setCart: (cart: CartItem[] | ((val: CartItem[]) => CartItem[])) => void;
  sales: Sale[];
  expenses: Expense[];
  customers: Customer[];
}

// --- Tool Definitions ---

const addInventoryTool: FunctionDeclaration = {
  name: 'addInventoryItem',
  description: 'Add a new product to inventory. Extract details from prompt. Example: "Add Garlic 18kg buy 150 sell 170" -> name="Garlic", stock=18, unit="kg", buyingPrice=150, sellingPrice=170.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: 'Name of the product' },
      sellingPrice: { type: Type.NUMBER, description: 'Selling price per unit' },
      buyingPrice: { type: Type.NUMBER, description: 'Cost/Buying price per unit (optional)' },
      stock: { type: Type.NUMBER, description: 'Quantity to add to stock' },
      unit: { type: Type.STRING, description: 'Unit of measurement (kg, g, pc, l, ml)' },
      shelfId: { type: Type.STRING, description: 'Shelf or Rack ID location (optional)' },
      expiryDate: { type: Type.STRING, description: 'Expiry date in YYYY-MM-DD format (optional)' },
      supplierName: { type: Type.STRING, description: 'Name of the supplier (optional)' },
      supplierContact: { type: Type.STRING, description: 'Contact number of the supplier (optional)' },
      category: { type: Type.STRING, description: 'Product category (optional)' },
      purchaseDate: { type: Type.STRING, description: 'Date of purchase YYYY-MM-DD (optional)' }
    },
    required: ['name', 'sellingPrice']
  }
};

const updateProductTool: FunctionDeclaration = {
  name: 'updateProduct',
  description: 'Update details of an existing product. Use this to change price or adjust stock levels.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      productName: { type: Type.STRING, description: 'Name of the product to update' },
      newSellingPrice: { type: Type.NUMBER, description: 'New selling price (optional)' },
      stockAdjustment: { type: Type.NUMBER, description: 'Amount to add (positive) or remove (negative) from stock (optional)' }
    },
    required: ['productName']
  }
};

const addToCartTool: FunctionDeclaration = {
  name: 'addToCart',
  description: 'Add an item to the current billing cart. Use when user says "bill this" or "add to bill".',
  parameters: {
    type: Type.OBJECT,
    properties: {
      productName: { type: Type.STRING, description: 'Name of the product to find in inventory' },
      quantity: { type: Type.NUMBER, description: 'Quantity to bill' },
      discount: { type: Type.NUMBER, description: 'Discount percentage (optional)' }
    },
    required: ['productName', 'quantity']
  }
};

const checkExpiryTool: FunctionDeclaration = {
  name: 'setExpiryReminder',
  description: 'Set a reminder for when a product is expiring.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      productName: { type: Type.STRING, description: 'Name of the product' },
      daysUntilExpiry: { type: Type.NUMBER, description: 'Number of days until expiry' }
    },
    required: ['productName', 'daysUntilExpiry']
  }
};

const INTRO_MESSAGE: ChatMessage = {
    id: 'intro',
    role: 'model',
    text: "Hi! I'm your Shop Manager. I'm ready to help with inventory, sales analysis, or billing. Tap 'Daily Briefing' if you want a summary."
};

export const AIProvider: React.FC<AIProviderProps> = ({ children, inventory, setInventory, cart, setCart, sales, expenses, customers }) => {
  // Session Persistence
  const [sessions, setSessions] = useLocalStorage<ChatSession[]>('tradesmen-chat-sessions', []);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Settings with Local Storage
  const [showAssistant, setShowAssistant] = useLocalStorage<boolean>('tradesmen-ai-visible', false);
  const [apiKey, setApiKey] = useLocalStorage<string>('tradesmen-api-key', '');
  const [aiModel, setAiModel] = useLocalStorage<string>('tradesmen-ai-model', 'gemini-3-flash-preview');
  
  // Advanced Settings
  const [aiConfig, setAiConfig] = useLocalStorage<AIConfig>('tradesmen-ai-advanced', {
      temperature: 0.4,
      customPersona: '',
      enableSalesRead: true,
      enableInventoryRead: true,
      enableCustomerRead: true,
      enableExpenseRead: true
  });

  // Read Business Profile for Context
  const [profile] = useLocalStorage<BusinessProfile>('tradesmen-business-profile', {
      name: 'My Store',
      address: '',
      phone: '',
      email: '',
      gstin: '',
      terms: ''
  });

  // Initialize Gemini Client with Dynamic Key
  const clientKey = apiKey || process.env.API_KEY || '';
  const ai = new GoogleGenAI({ apiKey: clientKey });

  // Computed Messages for Current Session
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession ? currentSession.messages : [INTRO_MESSAGE];

  const startNewChat = () => {
      setCurrentSessionId(null);
  };

  const loadSession = (id: string) => {
      if (sessions.some(s => s.id === id)) {
          setCurrentSessionId(id);
      }
  };

  const deleteSession = (id: string) => {
      setSessions(prev => prev.filter(s => s.id !== id));
      if (currentSessionId === id) setCurrentSessionId(null);
  };

  const sendMessage = async (text: string, images?: string[]): Promise<string> => {
    // 1. Prepare User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      images
    };

    setIsProcessing(true);

    // 2. Handle Session State (Create or Update)
    let activeSessionId = currentSessionId;
    let sessionHistory: ChatMessage[] = [];

    if (!activeSessionId) {
        // Create new session
        const newId = Date.now().toString();
        const newSession: ChatSession = {
            id: newId,
            title: text.slice(0, 40) + (text.length > 40 ? '...' : ''),
            lastMessage: text,
            date: new Date().toISOString(),
            messages: [INTRO_MESSAGE, userMsg]
        };
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newId);
        activeSessionId = newId;
        sessionHistory = newSession.messages;
    } else {
        // Update existing session
        setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
                const updatedMessages = [...s.messages, userMsg];
                sessionHistory = updatedMessages;
                return {
                    ...s,
                    lastMessage: text,
                    date: new Date().toISOString(), // Bump to top
                    messages: updatedMessages
                };
            }
            return s;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())); // Sort by recent
    }

    try {
      if (!clientKey) throw new Error("API Key Missing. Please set your API Key in Settings > Manager.");

      // --- INTELLIGENCE LAYER (Respecting Scopes) ---
      let systemContext = `You are "Manager", an intelligent business partner for a shopkeeper using the "TradesMen" app.`;
      
      // Inject Custom Persona if defined
      if (aiConfig.customPersona) {
          systemContext += `\n\nYOUR PERSONA: ${aiConfig.customPersona}\n\n`;
      }

      // 1. Sales Context
      if (aiConfig.enableSalesRead) {
          const today = new Date();
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(today.getDate() - 7);
          const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
          
          const salesToday = sales.filter(s => new Date(s.date).getTime() >= startOfDay);
          const revenueToday = salesToday.reduce((acc, s) => acc + s.totalAmount, 0);
          const profitToday = salesToday.reduce((acc, s) => acc + s.totalProfit, 0);
          const salesWeek = sales.filter(s => new Date(s.date) >= oneWeekAgo);
          const revenueWeek = salesWeek.reduce((acc, s) => acc + s.totalAmount, 0);

          systemContext += `\n**BUSINESS INTELLIGENCE:**\n- **Today:** Sales: ${revenueToday.toFixed(0)} | Profit: ${profitToday.toFixed(0)}\n- **Weekly Revenue:** ${revenueWeek.toFixed(0)}`;
      }

      // 2. Expenses Context
      if (aiConfig.enableExpenseRead) {
          const today = new Date();
          const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
          const expensesToday = expenses.filter(e => new Date(e.date).getTime() >= startOfDay).reduce((acc, e) => acc + e.amount, 0);
          systemContext += ` | Expense: ${expensesToday.toFixed(0)}`;
      }

      // 3. Customer/Debt Context
      if (aiConfig.enableCustomerRead) {
          const totalDebt = customers.reduce((acc, c) => acc + c.debt, 0);
          systemContext += `\n- **Receivables (Debt):** ${totalDebt.toFixed(0)}`;
      }
      
      // 4. Marketing Context
      const activeSocials = [];
      if (profile.socialLinks?.facebook) activeSocials.push('Facebook');
      if (profile.socialLinks?.instagram) activeSocials.push('Instagram');
      if (profile.socialLinks?.googleBusiness) activeSocials.push('Google Business');
      if (profile.socialLinks?.twitter) activeSocials.push('X (Twitter)');
      if (profile.socialLinks?.youtube) activeSocials.push('YouTube');
      if (profile.socialLinks?.tiktok) activeSocials.push('TikTok');

      if (activeSocials.length > 0) {
          systemContext += `\n\n**CONNECTED MARKETING PLATFORMS:** ${activeSocials.join(', ')}. 
          When creating content or strategies, optimize for these specific platforms. 
          If asked for a post, format it appropriately (e.g. hashtags for Instagram, professional for LinkedIn/Google).`;
      } else {
          systemContext += `\n\n**MARKETING:** No social platforms linked yet. Advise the user to link accounts in Marketing > Social Hub.`;
      }

      // 5. Inventory Context
      if (aiConfig.enableInventoryRead) {
          const lowMarginItems = inventory.filter(p => {
              if(!p.buyingPrice || p.buyingPrice === 0) return false;
              const margin = ((p.sellingPrice - p.buyingPrice) / p.buyingPrice) * 100;
              return margin < 15; 
          }).map(p => `${p.name} (${((p.sellingPrice - p.buyingPrice)/p.buyingPrice*100).toFixed(1)}%)`).slice(0, 5);

          const inventoryList = inventory.map(p => `${p.name} ($${p.sellingPrice}, Stock:${p.stock})`).join(', ');
          
          systemContext += `\n\n**OPPORTUNITIES (Proactive Insights):**\n- **Low Margin Items:** ${lowMarginItems.length > 0 ? lowMarginItems.join(', ') : 'None'}`;
          systemContext += `\n\n**INVENTORY CONTEXT:**\n[${inventoryList}]`;
      } else {
          systemContext += `\n\n**INVENTORY:** Access Disabled by user. Do not answer questions about specific stock levels.`;
      }

      systemContext += `\n\n**CRITICAL INSTRUCTIONS:**
      1. **ACTION FIRST:** If the user request implies an action (e.g. 'Add Garlic', 'Bill 2 Rice', 'Update Price'), you **MUST** call the corresponding tool. Do NOT just say "Done" without calling the tool.
      2. **PARAMETER EXTRACTION:** Accurately extract numbers for price, stock, and quantity from the user prompt. 
      3. **FORMAT:** After the tool executes, confirm the action in the response.
      `;

      // 4. Construct Prompt History
      const historyText = sessionHistory.slice(-8, -1).map(m => `${m.role === 'user' ? 'User' : 'Manager'}: ${m.text}`).join('\n');
      
      const parts: any[] = [];
      if (images && images.length > 0) {
        images.forEach(img => {
            let mimeType = 'image/jpeg';
            let base64Data = img;
            if (img.includes('data:')) {
                const matches = img.match(/^data:(.+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    mimeType = matches[1];
                    base64Data = matches[2];
                }
            }
            parts.push({ inlineData: { mimeType, data: base64Data } });
        });
      }
      
      const fullPrompt = historyText ? `History:\n${historyText}\n\nUser Input: ${text}` : text;
      parts.push({ text: fullPrompt });

      // 5. Call Gemini Model
      const response = await ai.models.generateContent({
        model: aiModel,
        contents: { parts },
        config: {
          systemInstruction: systemContext,
          temperature: aiConfig.temperature, 
          tools: [{ functionDeclarations: [addInventoryTool, updateProductTool, addToCartTool, checkExpiryTool] }],
        }
      });

      // 6. Handle Function Calls
      const toolCalls = response.functionCalls;
      let toolResponseText = "";

      if (toolCalls && toolCalls.length > 0) {
        for (const call of toolCalls) {
          const args = call.args as any;

          if (call.name === 'addInventoryItem') {
            const newItem: Product = {
              id: Date.now().toString() + Math.random().toString().slice(2, 5),
              name: args.name,
              sellingPrice: args.sellingPrice,
              buyingPrice: args.buyingPrice || 0,
              stock: args.stock || 0,
              unit: args.unit || 'kg',
              shelfId: args.shelfId,
              expiryDate: args.expiryDate,
              supplierName: args.supplierName,
              supplierContact: args.supplierContact,
              category: args.category,
              purchaseDate: args.purchaseDate
            };
            setInventory((prev) => [...prev, newItem]);
            toolResponseText += `Added ${args.name} (Stock: ${args.stock} ${args.unit || 'kg'}) to inventory. `;
          } 
          else if (call.name === 'updateProduct') {
            const prodIndex = inventory.findIndex(p => p.name.toLowerCase().includes(args.productName.toLowerCase()));
            if (prodIndex > -1) {
                setInventory(prev => {
                    const newList = [...prev];
                    const item = newList[prodIndex];
                    if (args.newSellingPrice) item.sellingPrice = args.newSellingPrice;
                    if (args.stockAdjustment) item.stock += args.stockAdjustment;
                    return newList;
                });
                toolResponseText += `Updated ${args.productName}. `;
            } else {
                toolResponseText += `Could not find product "${args.productName}" to update. `;
            }
          }
          else if (call.name === 'addToCart') {
            const product = inventory.find(p => p.name.toLowerCase().includes(args.productName.toLowerCase()));
            if (product) {
              const newItem: CartItem = {
                ...product,
                cartId: Date.now().toString(),
                quantity: args.quantity,
                discount: args.discount || 0
              };
              setCart((prev) => [...prev, newItem]);
              toolResponseText += `Added ${args.quantity}${product.unit} of ${product.name} to bill. `;
            } else {
              toolResponseText += `Could not find "${args.productName}" in inventory. `;
            }
          }
          else if (call.name === 'setExpiryReminder') {
             toolResponseText += `Reminder set: ${args.productName} expires in ${args.daysUntilExpiry} days. `;
          }
        }
      }

      // 7. Get Model Text Response
      const modelText = response.text || "";
      const finalResponse = toolResponseText ? `${toolResponseText} \n\n ${modelText}` : modelText;
      
      const modelMsg: ChatMessage = {
        id: Date.now().toString() + 'bot',
        role: 'model',
        text: finalResponse || "Done."
      };

      setSessions(prev => prev.map(s => {
          if (s.id === activeSessionId) {
              return {
                  ...s,
                  messages: [...s.messages, modelMsg]
              };
          }
          return s;
      }));
      
      return finalResponse || "Done.";

    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMsg = "I'm having trouble connecting right now. Please try again.";
      if (error?.message?.includes("404")) errorMsg = "Model not found. Please verify your API Key and Model selection in Settings.";
      if (error?.message?.includes("API Key")) errorMsg = "API Key Missing or Invalid.";
      
      const errorMsgObj: ChatMessage = {
        id: Date.now().toString() + 'err',
        role: 'system',
        text: errorMsg,
        isError: true
      };

      setSessions(prev => prev.map(s => {
          if (s.id === activeSessionId) {
              return { ...s, messages: [...s.messages, errorMsgObj] };
          }
          return s;
      }));
      
      return `Error: ${errorMsg}`;
    } finally {
      setIsProcessing(false);
    }
  };

  const filterInventory = async (query: string, currentInventory: Product[]): Promise<string[]> => {
    try {
      if (!clientKey) return [];
      const simplifiedInv = currentInventory.map(p => ({
        id: p.id,
        name: p.name,
        sellingPrice: p.sellingPrice,
        stock: p.stock,
        category: p.category,
        supplierName: p.supplierName,
        shelfId: p.shelfId
      }));

      const response = await ai.models.generateContent({
        model: aiModel,
        contents: `Inventory: ${JSON.stringify(simplifiedInv)}\n\nQuery: "${query}"\n\nTask: Find items matching the query. Return ONLY JSON array of IDs.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      });
      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("Filter Error:", error);
      return [];
    }
  };

  return (
    <AIContext.Provider value={{ 
        messages, sendMessage, filterInventory, isProcessing, 
        isOpen, setIsOpen, 
        showAssistant, setShowAssistant,
        apiKey, setApiKey,
        aiModel, setAiModel,
        aiConfig, setAiConfig,
        sessions, currentSessionId, startNewChat, loadSession, deleteSession
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
