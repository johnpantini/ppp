import ppp from '../ppp.js';

export function parseJwt(token) {
  const [header, payload, signature] = token.split('.');

  return JSON.parse(atob(payload));
}

export function isJWTTokenExpired(jwtToken) {
  if (jwtToken) {
    try {
      const [, payload] = jwtToken.split('.');
      const { exp: expires } = JSON.parse(atob(payload));

      if (typeof expires === 'number') {
        return Date.now() + 1000 >= expires * 1000;
      }
    } catch {
      return true;
    }
  }

  return true;
}

export function stringToBuffer(base64) {
  const string = window.atob(base64);
  const buffer = new ArrayBuffer(string.length);
  const bufferView = new Uint8Array(buffer);

  for (let i = 0; i < string.length; i++) {
    bufferView[i] = string.charCodeAt(i);
  }

  return buffer;
}

export function bufferToString(iv) {
  return window.btoa(String.fromCharCode.apply(null, new Uint8Array(iv)));
}

export function generateIV() {
  return window.crypto.getRandomValues(new Uint8Array(12));
}

export function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

export async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export class PPPCrypto {
  #key;

  resetKey() {
    this.#key = void 0;
  }

  async #generateKey(password = ppp.keyVault.getKey('master-password')) {
    if (!this.#key) {
      const rawKey = new TextEncoder().encode(
        password.slice(0, 32).padEnd(32, '.')
      );

      this.#key = await window.crypto.subtle.importKey(
        'raw',
        rawKey,
        'AES-GCM',
        true,
        ['encrypt', 'decrypt']
      );
    }

    return this.#key;
  }

  async encrypt(iv, plaintext, password) {
    if (typeof iv === 'string') iv = stringToBuffer(iv);

    const encoded = new TextEncoder().encode(plaintext);
    const key = await this.#generateKey(password);
    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encoded
    );

    return bufferToString(ciphertext);
  }

  async decrypt(iv, ciphertext, password) {
    if (typeof iv === 'string') iv = stringToBuffer(iv);

    const key = await this.#generateKey(password);
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      stringToBuffer(ciphertext)
    );

    return new TextDecoder().decode(decrypted);
  }
}

export async function HMAC(secretKey, message, options = {}) {
  let keyUint8Array = secretKey;
  const encoder = new TextEncoder();
  const messageUint8Array = encoder.encode(message);

  if (typeof secretKey === 'string') {
    keyUint8Array = encoder.encode(secretKey);
  }

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyUint8Array,
    { name: 'HMAC', hash: options.algorithm ?? 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await window.crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageUint8Array
  );

  if (options?.format === 'hex') {
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return hashHex;
  } else {
    return signature;
  }
}
