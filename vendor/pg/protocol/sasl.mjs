import crypto from 'crypto';

export let SASL;

(function (SASL) {
  const CLIENT_KEY = 'Client Key';
  const SERVER_KEY = 'Server Key';
  const GS2_HEADER = 'n,,';

  function createSession(username, mechanism) {
    const nonce = crypto.randomBytes(18).toString('base64');
    const clientFirstMessage = `${GS2_HEADER}${firstMessageBare(
      username,
      nonce
    )}`;

    return {
      username,
      mechanism,
      nonce,
      clientFirstMessage
    };
  }

  SASL.createSession = createSession;

  function continueSession(session, password, data) {
    const s = data.toString();
    const items = s.split(',');
    let nonce = '';
    let salt = '';
    let iteration = 0;

    for (const i of items) {
      switch (i[0]) {
        case 'r':
          nonce = i.substring(2);

          break;
        case 's':
          salt = i.substring(2);

          break;
        case 'i':
          iteration = parseInt(i.substring(2), 10);

          break;
      }
    }

    if (!nonce)
      throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing');

    if (!salt)
      throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing');

    if (!iteration)
      throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing');

    if (!nonce.startsWith(session.nonce))
      throw new Error('SASL: Server nonce does not start with client nonce');

    const serverFirstMessage = `r=${nonce},s=${salt},i=${iteration}`;
    const clientFinalMessageWithoutProof = `c=${encode64(
      GS2_HEADER
    )},r=${nonce}`;
    const authMessage = `${firstMessageBare(
      session.username,
      session.nonce
    )},${serverFirstMessage},${clientFinalMessageWithoutProof}`;
    const saltPass = hi(password, salt, iteration);
    const clientKey = hmac(saltPass, CLIENT_KEY);
    const storedKey = hash(clientKey);
    const clientSignature = hmac(storedKey, authMessage);
    const clientProofBytes = xor(clientKey, clientSignature);
    const clientProof = clientProofBytes.toString('base64');
    const serverKey = hmac(saltPass, SERVER_KEY);
    const serverSignatureBytes = hmac(serverKey, authMessage);

    session.serverSignature = serverSignatureBytes.toString('base64');
    session.clientFinalMessage =
      clientFinalMessageWithoutProof + ',p=' + clientProof;
  }

  SASL.continueSession = continueSession;

  function finalizeSession(session, data) {
    let serverSignature = '';
    const arr = data.split(',');

    for (const s of arr) {
      if (s[0] === 'v') serverSignature = s.substr(2);
    }

    if (serverSignature !== session.serverSignature)
      throw new Error('SASL: Server signature does not match');
  }

  SASL.finalizeSession = finalizeSession;

  function firstMessageBare(username, nonce) {
    return `n=${username},r=${nonce}`;
  }

  /**
   * Hi() is, essentially, PBKDF2 [RFC2898] with HMAC() as the
   * pseudorandom function (PRF) and with dkLen == output length of
   * HMAC() == output length of H()
   */
  function hi(text, salt, iterations) {
    return crypto.pbkdf2Sync(
      text,
      Buffer.from(salt, 'base64'),
      iterations,
      32,
      'sha256'
    );
  }

  const encode64 = (str) => Buffer.from(str).toString('base64');

  function hmac(key, msg) {
    return crypto.createHmac('sha256', key).update(msg).digest();
  }

  function hash(data) {
    return crypto.createHash('sha256').update(data).digest();
  }

  function xor(a, b) {
    a = Buffer.isBuffer(a) ? a : Buffer.from(a);
    b = Buffer.isBuffer(b) ? b : Buffer.from(b);

    if (a.length !== b.length)
      throw new Error('Buffers must be of the same length');

    const l = a.length;
    const out = Buffer.allocUnsafe(l);

    for (let i = 0; i < l; i++) {
      out[i] = a[i] ^ b[i];
    }

    return out;
  }
})(SASL || (SASL = {}));
