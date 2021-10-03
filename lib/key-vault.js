import { auth0Bridge, auth0BridgeCallback } from './auth0-bridge.js';

export function parseJwt(token) {
  const [header, payload, signature] = token.split('.');

  return JSON.parse(atob(payload));
}

class KeyVault {
  #keys = {};

  setKey(key, value) {
    this.#keys[key] = value;

    localStorage.setItem(`ppp-${key}`, value?.trim());
  }

  getKey(key) {
    if (!this.#keys[key])
      this.#keys[key] = localStorage.getItem(`ppp-${key}`)?.trim();

    return this.#keys[key];
  }

  async checkGitHubToken({ token }) {
    try {
      return await fetch('https://api.github.com/user', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token ${token}`
        }
      });
    } catch (e) {
      console.error(e);

      return {
        ok: false,
        status: 422
      };
    }
  }

  async checkAuth0MgmntToken({ token, email }) {
    try {
      const json = parseJwt(token);
      const url = new URL(
        `users-by-email?fields=user_id&include_fields=true&email=${encodeURIComponent(
          email
        )}`,
        json.aud
      );

      const r1 = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!r1.ok) {
        return r1;
      }

      const j1 = await r1.json();

      if (!j1.length)
        return {
          ok: false,
          status: 404
        };

      r1.details = j1;
      r1.domain = url.hostname;

      return r1;
    } catch (e) {
      console.error(e);

      return {
        ok: false,
        status: 422
      };
    }
  }

  async checkMongoRealmCredentials({ publicKey, privateKey, auth0Token }) {
    return auth0Bridge({
      auth0Token,
      code: `console.log(await new Promise((resolve, reject) => {
        request.post(
          {
            url: 'https://realm.mongodb.com/api/admin/v3.0/auth/providers/mongodb-cloud/login',
            json: {
              username: '${publicKey}',
              apiKey: '${privateKey}'
            }
          }, ${auth0BridgeCallback}
        );
      }));`
    });
  }
}

export { KeyVault };
