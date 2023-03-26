export async function checkTelegramBotToken({ token }) {
  return fetch(`https://api.telegram.org/bot${token}/getMe`, {
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

    const formData = new FormData();
    const keys = Object.keys(params);

    for (const param of keys) {
      formData.append(param, params[param]);
    }

    if (keys.length) {
      return fetch(url.toString(), {
        method: 'POST',
        cache: 'no-cache',
        body: formData
      });
    } else {
      return fetch(url.toString(), {
        method: 'POST',
        cache: 'no-cache'
      });
    }
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

  async deleteWebhook(url, params = {}) {
    return this.request('deleteWebhook', Object.assign({}, params));
  }
}
