export function parseJwt(token) {
  const [header, payload, signature] = token.split('.');

  return JSON.parse(
    typeof Buffer !== 'undefined'
      ? Buffer.from(payload, 'base64')
      : atob(payload)
  );
}

export function isJWTTokenExpired(jwtToken) {
  if (jwtToken) {
    try {
      const [, payload] = jwtToken.split('.');
      const { exp: expires } = JSON.parse(
        typeof Buffer !== 'undefined'
          ? Buffer.from(payload, 'base64')
          : atob(payload)
      );

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
  const string =
    typeof Buffer !== 'undefined'
      ? Buffer.from(base64, 'base64').toString('binary')
      : globalThis.atob(base64);
  const buffer = new ArrayBuffer(string.length);
  const bufferView = new Uint8Array(buffer);

  for (let i = 0; i < string.length; i++) {
    bufferView[i] = string.charCodeAt(i);
  }

  return buffer;
}

export function bufferToString(iv) {
  const s = String.fromCharCode.apply(null, new Uint8Array(iv));

  return typeof Buffer !== 'undefined'
    ? Buffer.from(iv).toString('base64')
    : globalThis.btoa(s);
}

export function generateIV() {
  return globalThis.crypto.getRandomValues(new Uint8Array(12));
}

export function uuidv4() {
  return globalThis.crypto.randomUUID();
}

export async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await globalThis.crypto.subtle.digest(
    'SHA-256',
    msgBuffer
  );
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function HMAC(secretKey, message, options = {}) {
  let keyUint8Array = secretKey;
  const encoder = new TextEncoder();
  const messageUint8Array = encoder.encode(message);

  if (typeof secretKey === 'string') {
    keyUint8Array = encoder.encode(secretKey);
  }

  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'raw',
    keyUint8Array,
    { name: 'HMAC', hash: options.algorithm ?? 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await globalThis.crypto.subtle.sign(
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
