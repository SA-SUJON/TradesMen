import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Product, CartItem, ChatMessage } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

interface AIContextType {
  messages: ChatMessage[];
  sendMessage: (text: string, image?: string) => Promise<void>;
  filterInventory: (query: string, currentInventory: Product[]) => Promise<string[]>;
  isProcessing: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  showAssistant: boolean;
  setShowAssistant: (show: boolean) => void;
  // New Settings Config
  apiKey: string;
  setApiKey: (key: string) => void;
  aiModel: string;
  setAiModel: (model: string) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

interface AIProviderProps {
  children: ReactNode;
  inventory: Product[];
  setInventory: (inv: Product[] | ((val: Product[]) => Product[])) => void;
  cart: CartItem[];
  setCart: (cart: CartItem[] | ((val: CartItem[]) => CartItem[])) => void;
}

// --- Tool Definitions ---

const addInventoryTool: FunctionDeclaration = {
  name: 'addInventoryItem',
  description: 'Add a new product to the shop inventory with details. Use this when the user wants to stock new items or scans a memo.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: 'Name of the product' },
      sellingPrice: { type: Type.NUMBER, description: 'Selling price per unit' },
      buyingPrice: { type: Type.NUMBER, description: 'Cost price per unit (optional)' },
      stock: { type: Type.NUMBER, description: 'Quantity to add to stock' },
      unit: { type: Type.STRING, description: 'Unit of measurement (kg, g, pc)' },
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

export const AIProvider: React.FC<AIProviderProps> = ({ children, inventory, setInventory, cart, setCart }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'intro',
    role: 'model',
    text: 'Hello! I am your Shop Manager. I can help you manage inventory, bill items, or scan memos. How can I help?'
  }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Settings with Local Storage
  const [showAssistant, setShowAssistant] = useLocalStorage<boolean>('tradesmen-ai-visible', false);
  const [apiKey, setApiKey] = useLocalStorage<string>('tradesmen-api-key', '');
  const [aiModel, setAiModel] = useLocalStorage<string>('tradesmen-ai-model', 'gemini-3-flash-preview');

  // Initialize Gemini Client with Dynamic Key
  // Note: process.env.API_KEY is the fallback if no user key is provided
  const clientKey = apiKey || process.env.API_KEY || '';
  const ai = new GoogleGenAI({ apiKey: clientKey });

  const sendMessage = async (text: string, image?: string) => {
    // 1. Add User Message to UI
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      image
    };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      if (!clientKey) throw new Error("API Key Missing. Please set your API Key in Settings > Manager.");

      // 2. Prepare Context (Simplified Inventory for Grounding)
      const inventoryList = inventory.map(p => `${p.name} ($${p.sellingPrice}/${p.unit}) @ ${p.shelfId || 'NoShelf'}`).join(', ');
      const systemInstruction = `You are "Manager", an AI assistant for a shopkeeper app called "TradesMen". 
      Current Inventory: [${inventoryList}].
      If the user sends an image, analyze it as a supplier invoice/memo and extract items to add to inventory using the "addInventoryItem" tool.
      If shelf/rack locations are mentioned (e.g., "A1", "Top Shelf"), include them in shelfId.
      Be concise.`;

      // 3. Construct Parts
      const parts: any[] = [];
      if (image) {
        // Extract mime type and data
        let mimeType = 'image/jpeg';
        let base64Data = image;

        if (image.includes(',')) {
            const [header, data] = image.split(',');
            base64Data = data;
            const match = header.match(/:(.*?);/);
            if (match) {
                mimeType = match[1];
            }
        }

        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        });
      }
      if (text) parts.push({ text });

      // 4. Call Gemini Model (Dynamic)
      const response = await ai.models.generateContent({
        model: aiModel,
        contents: { parts },
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: [addInventoryTool, addToCartTool, checkExpiryTool] }],
        }
      });

      // 5. Handle Function Calls
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
            toolResponseText += `Added ${args.name} to inventory${args.shelfId ? ` (Shelf ${args.shelfId})` : ''}. `;
          } 
          else if (call.name === 'addToCart') {
            // Fuzzy search for product
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
             // Mock reminder
             toolResponseText += `Reminder set: ${args.productName} expires in ${args.daysUntilExpiry} days. `;
          }
        }
      }

      // 6. Get Model Text Response
      const modelText = response.text || "";
      const finalResponse = toolResponseText ? `${toolResponseText} ${modelText}` : modelText;

      setMessages(prev => [...prev, {
        id: Date.now().toString() + 'bot',
        role: 'model',
        text: finalResponse || "Done."
      }]);

    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMsg = "I'm having trouble connecting right now. Please try again.";
      if (error?.message?.includes("404")) errorMsg = "Model not found. Please verify your API Key and Model selection in Settings.";
      if (error?.message?.includes("API Key")) errorMsg = "API Key Missing or Invalid.";
      
      setMessages(prev => [...prev, {
        id: Date.now().toString() + 'err',
        role: 'system',
        text: errorMsg,
        isError: true
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const filterInventory = async (query: string, currentInventory: Product[]): Promise<string[]> => {
    try {
      if (!clientKey) return [];
      
      // Simplify inventory for token efficiency
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
        contents: `Inventory: ${JSON.stringify(simplifiedInv)}\n\nQuery: "${query}"\n\nTask: Find items in the inventory that match the user's query (e.g., price conditions, stock levels, name keywords, supplier, category, shelf location). Return ONLY a JSON array of string IDs. Example: ["1", "5"]`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      const text = response.text;
      if (!text) return [];
      return JSON.parse(text);

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
        aiModel, setAiModel
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