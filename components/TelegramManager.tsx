
import React, { useEffect, useRef } from 'react';
import { useAI } from '../contexts/AIContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { TelegramConfig } from '../types';
import { getTelegramUpdates, sendTelegramMessage, sendChatAction } from '../utils/telegramBot';

// Polling Interval in ms
const POLL_INTERVAL = 3000; 

const TelegramManager: React.FC = () => {
    const { sendMessage } = useAI();
    const [config] = useLocalStorage<TelegramConfig>('tradesmen-telegram-config', { botToken: '', chatId: '', isEnabled: false });
    
    // Persist offset to avoid re-replying to old messages on reload
    const [lastUpdateId, setLastUpdateId] = useLocalStorage<number>('tradesmen-telegram-offset', 0);
    
    const intervalRef = useRef<any>(null);
    const isProcessingRef = useRef(false);
    
    // Use a ref for sendMessage to avoid resetting the interval when AI context updates
    const sendMessageRef = useRef(sendMessage);
    useEffect(() => {
        sendMessageRef.current = sendMessage;
    }, [sendMessage]);

    useEffect(() => {
        // Basic validation before starting poll
        if (!config.isEnabled || !config.botToken || config.botToken.length < 10) {
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
                        // Track max ID seen
                        maxId = Math.max(maxId, update.update_id);

                        const senderId = String(update.message?.chat.id);
                        const allowedId = config.chatId?.trim();
                        
                        // Strict ID Check (only if configured)
                        if (allowedId && senderId !== allowedId) {
                            console.warn(`Blocking message from unauthorized chat ID: ${senderId}`);
                            continue; 
                        }

                        if (update.message && update.message.text) {
                            const userText = update.message.text;
                            
                            // Send "Typing..." status to Telegram so user knows it's working
                            await sendChatAction(config.botToken, senderId, 'typing');

                            // Tag message source for clarity in Manager History
                            const contextText = `[Telegram Message]: ${userText}`;
                            
                            // Send to AI Manager using the ref
                            // This will automatically add it to the AI Context history/sessions
                            const aiResponse = await sendMessageRef.current(contextText);
                            
                            // Send Response back to Telegram
                            await sendTelegramMessage(config.botToken, senderId, aiResponse);
                        }
                    }
                    // Update offset only after successful processing
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
    }, [config, lastUpdateId, setLastUpdateId]);

    return null; // Invisible Background Component
};

export default TelegramManager;
