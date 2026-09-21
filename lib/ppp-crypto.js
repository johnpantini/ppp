/**
 * Decodes a JWT payload without verifying its signature.
 * @param {string} token Dot-separated JWT.
 * @returns {Record<string, unknown> & {exp?: number}} Decoded claims.
 * @throws {Error} If the payload cannot be decoded as JSON.
 */
export function parseJwt(token) {
  const [, payload] = token.split('.');

  return JSON.parse(
    typeof Buffer !== 'undefined'
      ? Buffer.from(payload, 'base64').toString('utf8')
      : atob(payload)
  );
}

/**
 * Treats missing, invalid and nearly expired tokens as expired.
 * @param {string | null | undefined} jwtToken JWT to inspect.
 * @returns {boolean} True at or within one second of the exp claim.
 */
export function isJWTTokenExpired(jwtToken) {
  if (jwtToken) {
    try {
      const { exp: expires } = parseJwt(jwtToken);

      if (typeof expires === 'number') {
        return Date.now() + 1000 >= expires * 1000;
      }
    } catch {
      return true;
    }
  }

  return true;
}

/**
 * @param {string} base64 Base64-encoded bytes.
 * @returns {ArrayBuffer} Decoded bytes.
 */
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

/**
 * Encodes bytes using standard base64, without interpreting them as text.
 * @param {ArrayBuffer | Uint8Array} iv Bytes to encode.
 * @returns {string} Base64 representation.
 */
export function bufferToString(iv) {
  const s = String.fromCharCode.apply(null, new Uint8Array(iv));

  return typeof Buffer !== 'undefined'
    ? Buffer.from(new Uint8Array(iv)).toString('base64')
    : globalThis.btoa(s);
}

/** @returns {Uint8Array} A fresh 12-byte AES-GCM initialization vector. */
export function generateIV() {
  return globalThis.crypto.getRandomValues(new Uint8Array(12));
}

/** @returns {string} A cryptographically random UUID v4. */
export function uuidv4() {
  return globalThis.crypto.randomUUID();
}

/**
 * @param {string} message Text encoded as UTF-8 before hashing.
 * @returns {Promise<string>} Lowercase, 64-character SHA-256 hex digest.
 */
export async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await globalThis.crypto.subtle.digest(
    'SHA-256',
    msgBuffer
  );
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * @overload
 * @param {string | BufferSource} secretKey UTF-8 secret or raw key bytes.
 * @param {string} message Message to sign.
 * @param {{algorithm?: string, format: 'hex'}} options Hex output options.
 * @returns {Promise<string>} Lowercase hex signature.
 */
/**
 * @overload
 * @param {string | BufferSource} secretKey UTF-8 secret or raw key bytes.
 * @param {string} message Message to sign.
 * @param {{algorithm?: string, format?: undefined}} [options] Raw output options.
 * @returns {Promise<ArrayBuffer>} Raw signature bytes.
 */
/**
 * Signs UTF-8 text with a raw HMAC key using Web Crypto.
 * @param {string | BufferSource} secretKey UTF-8 secret or raw key bytes.
 * @param {string} message Message to sign.
 * @param {{algorithm?: string, format?: 'hex'}} [options] SHA-256 by default.
 * @returns {Promise<ArrayBuffer | string>} Raw signature, or hex when requested.
 */
export async function HMAC(secretKey, message, options = {}) {
  const encoder = new TextEncoder();
  const messageUint8Array = encoder.encode(message);
  const keyUint8Array =
    typeof secretKey === 'string' ? encoder.encode(secretKey) : secretKey;

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

/**
 * Derives an AWS Signature V4 signing key for S3-compatible storage.
 * @param {object} options Signing scope and credentials.
 * @param {string} options.ycStaticKeySecret Secret access key.
 * @param {string} options.date UTC date in YYYYMMDD form.
 * @param {string} options.region Storage region.
 * @returns {Promise<ArrayBuffer>} Derived binary signing key.
 */
export async function generateAWSSigningKey({
  ycStaticKeySecret,
  date,
  region
}) {
  const dateKey = await HMAC(`AWS4${ycStaticKeySecret}`, date);
  const regionKey = await HMAC(dateKey, region);
  const serviceKey = await HMAC(regionKey, 's3');

  return HMAC(serviceKey, 'aws4_request');
}
