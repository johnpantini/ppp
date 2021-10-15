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

export class PPPCrypto {
  #key;

  constructor(ppp) {
    this.ppp = ppp;
  }

  async #generateKey() {
    if (!this.#key) {
      const token = this.ppp.keyVault.getKey('github-token');
      const rawKey = new TextEncoder().encode(token.slice(4, 36));

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

  async encrypt(iv, plaintext) {
    if (typeof iv === 'string') iv = stringToBuffer(iv);

    const encoded = new TextEncoder().encode(plaintext);
    const key = await this.#generateKey();
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

  async decrypt(iv, ciphertext) {
    if (typeof iv === 'string') iv = stringToBuffer(iv);

    const key = await this.#generateKey();
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
