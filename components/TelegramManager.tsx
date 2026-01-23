
import React, { useEffect, useRef, useState } from 'react';
import { useAI } from '../contexts/AIContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { TelegramConfig } from '../types';
import { getTelegramUpdates, sendTelegramMessage, sendChatAction } from '../utils/telegramBot';

// Polling Interval in ms
const POLL_INTERVAL = 3000; 

const TelegramManager: React.FC = () => {
    const { sendMessage } = useAI();
    const [config] = useLocalStorage<TelegramConfig>('tradesmen-telegram-config', { botToken: '', chatId: '', isEnabled: false });
    const [lastUpdateId, setLastUpdateId] = useState<number>(0);
    const intervalRef = useRef<any>(null);
    const isProcessingRef = useRef(false);
    
    // Use a ref for sendMessage to avoid resetting the interval when AI context updates
    const sendMessageRef = useRef(sendMessage);
    useEffect(() => {
        sendMessageRef.current = sendMessage;
    }, [sendMessage]);

    useEffect(() => {
        if (!config.isEnabled || !config.botToken) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        const poll = async () => {
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;

            try {
                // Fetch updates with offset = lastUpdateId + 1
                const updates = await getTelegramUpdates(config.botToken, lastUpdateId + 1);
                
                if (updates.length > 0) {
                    let maxId = lastUpdateId;
                    
                    for (const update of updates) {
                        maxId = Math.max(maxId, update.update_id);

                        const senderId = String(update.message?.chat.id);
                        
                        // Strict ID Check
                        if (config.chatId && senderId !== config.chatId) {
                            console.warn(`Blocking message from unauthorized chat ID: ${senderId}`);
                            continue; 
                        }

                        if (update.message && update.message.text) {
                            const userText = update.message.text;
                            
                            // Send "Typing..." status to Telegram
                            sendChatAction(config.botToken, senderId, 'typing');

                            // Send to AI Manager using the ref
                            // We prepend [Telegram] to the prompt internally if needed, but for history sake, raw text is fine.
                            // The AI Context will add it to the history.
                            const aiResponse = await sendMessageRef.current(userText);
                            
                            // Send Response back to Telegram
                            await sendTelegramMessage(config.botToken, senderId, aiResponse);
                        }
                    }
                    setLastUpdateId(maxId);
                }
            } catch (e) {
                console.error("Telegram Poll Loop Error", e);
            } finally {
                isProcessingRef.current = false;
            }
        };

        // Start Polling
        intervalRef.current = setInterval(poll, POLL_INTERVAL);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [config, lastUpdateId]); // removed sendMessage from dependency

    return null; // Invisible Background Component
};

export default TelegramManager;
