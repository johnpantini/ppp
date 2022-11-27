import ppp from '../ppp.js';

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

const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substring(1));
}

function stringify(arr, offset = 0) {
  // noinspection PointlessArithmeticExpressionJS
  return (
    byteToHex[arr[offset + 0]] +
    byteToHex[arr[offset + 1]] +
    byteToHex[arr[offset + 2]] +
    byteToHex[arr[offset + 3]] +
    '-' +
    byteToHex[arr[offset + 4]] +
    byteToHex[arr[offset + 5]] +
    '-' +
    byteToHex[arr[offset + 6]] +
    byteToHex[arr[offset + 7]] +
    '-' +
    byteToHex[arr[offset + 8]] +
    byteToHex[arr[offset + 9]] +
    '-' +
    byteToHex[arr[offset + 10]] +
    byteToHex[arr[offset + 11]] +
    byteToHex[arr[offset + 12]] +
    byteToHex[arr[offset + 13]] +
    byteToHex[arr[offset + 14]] +
    byteToHex[arr[offset + 15]]
  ).toLowerCase();
}

export function uuidv4() {
  const rnds = new Uint8Array(16);

  window.crypto.getRandomValues(rnds);

  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  return stringify(rnds);
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
