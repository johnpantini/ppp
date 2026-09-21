import ppp from '../ppp.js';

/**
 * @param {{token: string}} options Bot API token.
 * @returns {Promise<Response>} Raw getMe response; caller checks status and body.
 */
export async function checkTelegramBotToken({ token }) {
  return ppp.fetch(`https://api.telegram.org/bot${token}/getMe`, {
    cache: 'reload'
  });
}

/** Telegram Bot API requests sent through the application's configured proxy. */
export class TelegramBot {
  /** @param {{token: string}} options Bot API credentials. */
  constructor({ token }) {
    this.token = token;
  }

  /**
   * @param {string} method Telegram Bot API method name.
   * @param {Record<string, unknown>} [params] JSON request body.
   * @returns {Promise<Response>} Raw response, including API-level errors.
   */
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

  /**
   * @param {string | number} chatId Destination chat identifier.
   * @param {string} text Message body.
   * @param {Record<string, unknown>} [params] Additional API fields; may override defaults.
   * @returns {Promise<Response>} Raw sendMessage response.
   */
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

  /**
   * @param {string} url HTTPS webhook endpoint.
   * @param {Record<string, unknown>} [params] Additional API fields.
   * @returns {Promise<Response>} Raw setWebhook response.
   */
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

  /**
   * @param {Record<string, unknown>} [params] API fields, such as drop_pending_updates.
   * @returns {Promise<Response>} Raw deleteWebhook response.
   */
  async deleteWebhook(params = {}) {
    return this.request('deleteWebhook', params);
  }
}
