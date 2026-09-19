import ppp from '../ppp.js';

export async function checkTelegramBotToken({ token }) {
  return ppp.fetch(`https://api.telegram.org/bot${token}/getMe`, {
    cache: 'reload'
  });
}

export class TelegramBot {
  constructor({ token }) {
    this.token = token;
  }

  async request(method, params = {}) {
    const url = new URL(
      `/bot${this.token}/${method}`,
      'https://api.telegram.org'
    );

    return ppp.fetch(url.toString(), {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
  }

  async sendMessage(chatId, text, params = {}) {
    return this.request(
      'sendMessage',
      Object.assign(
        {
          chat_id: chatId,
          text
        },
        params
      )
    );
  }

  async setWebhook(url, params = {}) {
    return this.request(
      'setWebhook',
      Object.assign(
        {
          url
        },
        params
      )
    );
  }

  async deleteWebhook(params = {}) {
    return this.request('deleteWebhook', params);
  }
}
