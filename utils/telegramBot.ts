
// utils/telegramBot.ts

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
    };
    text?: string;
    date: number;
  };
}

export const getTelegramUpdates = async (token: string, offset: number): Promise<TelegramUpdate[]> => {
  try {
    // timeout=0 for short polling in this context, or higher for long polling if we were a backend.
    // Since we are in a browser loop, we keep it snappy but don't block too long.
    const response = await fetch(`${TELEGRAM_API_BASE}${token}/getUpdates?offset=${offset}&timeout=0`);
    const data = await response.json();
    if (data.ok) {
      return data.result;
    }
    return [];
  } catch (error) {
    console.error("Telegram Poll Error:", error);
    return [];
  }
};

export const sendChatAction = async (token: string, chatId: string, action: string = 'typing') => {
    try {
        await fetch(`${TELEGRAM_API_BASE}${token}/sendChatAction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, action: action })
        });
    } catch (e) {
        // Ignore action errors
    }
};

export const sendTelegramMessage = async (token: string, chatId: string, text: string) => {
  try {
    // Clean text of simple markdown that might break standard text messages if not parsed correctly
    // or just send as plain text to ensure delivery.
    // For now, we send plain text to avoid 400 Bad Request from Telegram on malformed Markdown.
    await fetch(`${TELEGRAM_API_BASE}${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
        // parse_mode removed to ensure reliability. 
        // AI output often contains unmatched * or _ which causes Telegram API to reject the message entirely.
      }),
    });
  } catch (error) {
    console.error("Telegram Send Error:", error);
  }
};

export const getBotInfo = async (token: string) => {
  try {
    const response = await fetch(`${TELEGRAM_API_BASE}${token}/getMe`);
    const data = await response.json();
    return data.ok ? data.result : null;
  } catch (error) {
    return null;
  }
};
