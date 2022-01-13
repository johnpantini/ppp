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

    for (const param of Object.keys(params)) {
      formData.append(param, params[param]);
    }

    return fetch(url.toString(), {
      method: 'POST',
      cache: 'no-cache',
      body: formData
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
}
