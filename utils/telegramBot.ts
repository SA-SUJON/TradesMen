
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
    const cleanToken = token.trim();
    // timeout=0 for short polling in this context
    const response = await fetch(`${TELEGRAM_API_BASE}${cleanToken}/getUpdates?offset=${offset}&timeout=0`);
    const data = await response.json();
    if (data.ok) {
      return data.result;
    }
    return [];
  } catch (error) {
    // Silent fail for polling errors to avoid console spam, effectively retry next tick
    return [];
  }
};

export const sendChatAction = async (token: string, chatId: string, action: string = 'typing') => {
    try {
        const cleanToken = token.trim();
        await fetch(`${TELEGRAM_API_BASE}${cleanToken}/sendChatAction`, {
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
    const cleanToken = token.trim();
    await fetch(`${TELEGRAM_API_BASE}${cleanToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
        // parse_mode explicitly removed. AI output often contains special chars (*, _) 
        // that break Telegram's Markdown/MarkdownV2 parser if not perfectly escaped.
      }),
    });
  } catch (error) {
    console.error("Telegram Send Error:", error);
  }
};

export const getBotInfo = async (token: string) => {
  try {
    const cleanToken = token.trim();
    const response = await fetch(`${TELEGRAM_API_BASE}${cleanToken}/getMe`);
    const data = await response.json();
    return data.ok ? data.result : null;
  } catch (error) {
    return null;
  }
};
