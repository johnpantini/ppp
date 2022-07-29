import net from 'net';
import * as util from 'util';

const SOCKS_VERSION5 = 5;
let USERPASS;

/*
 * Authentication methods
 ************************
 * o  X'00' NO AUTHENTICATION REQUIRED
 * o  X'01' GSSAPI
 * o  X'02' USERNAME/PASSWORD
 * o  X'03' to X'7F' IANA ASSIGNED
 * o  X'80' to X'FE' RESERVED FOR PRIVATE METHODS
 * o  X'FF' NO ACCEPTABLE METHODS
 */
const AUTHENTICATION = {
  NOAUTH: 0x00,
  GSSAPI: 0x01,
  USERPASS: 0x02,
  NONE: 0xff
};
/*
 * o  CMD
 *    o  CONNECT X'01'
 *    o  BIND X'02'
 *    o  UDP ASSOCIATE X'03'
 */

const REQUEST_CMD = {
  CONNECT: 0x01,
  BIND: 0x02,
  UDP_ASSOCIATE: 0x03
};
/*
 * o  ATYP address type of following address
 *    o  IP V4 address: X'01'
 *    o  DOMAINNAME: X'03'
 *    o  IP V6 address: X'04'
 */

const ATYP = {
  IP_V4: 0x01,
  DNS: 0x03,
  IP_V6: 0x04
};

const Address = {
  read: function (buffer, offset) {
    if (buffer[offset] === ATYP.IP_V4) {
      return util.format(
        '%s.%s.%s.%s',
        buffer[offset + 1],
        buffer[offset + 2],
        buffer[offset + 3],
        buffer[offset + 4]
      );
    } else if (buffer[offset] === ATYP.DNS) {
      return buffer.toString(
        'utf8',
        offset + 2,
        offset + 2 + buffer[offset + 1]
      );
    } else if (buffer[offset] === ATYP.IP_V6) {
      return buffer.slice(buffer[offset + 1], buffer[offset + 1 + 16]);
    }
  },
  sizeOf: function (buffer, offset) {
    if (buffer[offset] === ATYP.IP_V4) {
      return 4;
    } else if (buffer[offset] === ATYP.DNS) {
      return buffer[offset + 1];
    } else if (buffer[offset] === ATYP.IP_V6) {
      return 16;
    }
  }
};

const Port = {
  read: function (buffer, offset) {
    if (buffer[offset] === ATYP.IP_V4) {
      return buffer.readUInt16BE(8);
    } else if (buffer[offset] === ATYP.DNS) {
      return buffer.readUInt16BE(5 + buffer[offset + 1]);
    } else if (buffer[offset] === ATYP.IP_V6) {
      return buffer.readUInt16BE(20);
    }
  }
};

function createSocksServer(cb, userpass) {
  USERPASS = userpass;

  const socksServer = net.createServer();

  socksServer.on('connection', (socket) => {
    initSocksConnection.bind(socket)(cb);
  });

  return socksServer;
}

function initSocksConnection(onAccept) {
  this.on('error', (err) => {
    console.error(err);
  });

  this.handshake = handshake.bind(this);
  this.onAccept = onAccept;

  this.once('data', this.handshake);
}

function handshake(chunk) {
  if (chunk[0] === SOCKS_VERSION5) {
    this.handshake5 = handshake5.bind(this);
    this.handshake5(chunk);
  } else {
    this.end();
  }
}

function handshake5(chunk) {
  let methodCount = 0;

  if (chunk[0] !== SOCKS_VERSION5) {
    this.end();

    return;
  }

  methodCount = chunk[1];

  this.authMethods = [];

  for (let i = 2; i < methodCount + 2; i++) {
    this.authMethods.push(chunk[i]);
  }

  const resp = new Buffer(2);

  resp[0] = 0x05;

  if (USERPASS) {
    if (this.authMethods.indexOf(AUTHENTICATION.USERPASS) > -1) {
      this.handleAuthRequest = handleAuthRequest.bind(this);

      this.once('data', this.handleAuthRequest);

      resp[1] = AUTHENTICATION.USERPASS;

      this.write(resp);
    } else {
      resp[1] = 0xff;

      this.end(resp);
    }
  } else if (this.authMethods.indexOf(AUTHENTICATION.NOAUTH) > -1) {
    this.handleConnRequest = handleConnRequest.bind(this);

    this.once('data', this.handleConnRequest);

    resp[1] = AUTHENTICATION.NOAUTH;

    this.write(resp);
  } else {
    resp[1] = 0xff;

    this.end(resp);
  }
}

function handleAuthRequest(chunk) {
  let username, password;

  if (chunk[0] !== 1) {
    this.end(new Buffer([0x01, 0x01]));

    return;
  }

  try {
    const na = [];
    const pa = [];
    let ni, pi;

    for (ni = 2; ni < 2 + chunk[1]; ni++) na.push(chunk[ni]);

    username = new Buffer(na).toString('utf8');

    for (pi = ni + 1; pi < ni + 1 + chunk[ni]; pi++) pa.push(chunk[pi]);

    password = new Buffer(pa).toString('utf8');
  } catch (e) {
    this.end(new Buffer([0x01, 0x01]));

    return;
  }

  if (
    USERPASS &&
    USERPASS.username === username &&
    USERPASS.password === password
  ) {
    this.handleConnRequest = handleConnRequest.bind(this);

    this.once('data', this.handleConnRequest);
    this.write(new Buffer([0x01, 0x00]));
  } else {
    this.end(new Buffer([0x01, 0x01]));
  }
}

function handleConnRequest(chunk) {
  const cmd = chunk[1];
  let address, port;

  if (chunk[0] !== SOCKS_VERSION5) {
    this.end(new Buffer([0x05, 0x01]));

    return;
  }

  try {
    address = Address.read(chunk, 3);
    port = Port.read(chunk, 3);
  } catch (err) {
    console.error(err);

    return;
  }

  if (cmd === REQUEST_CMD.CONNECT) {
    this.request = chunk;

    this.onAccept(this, port, address, proxyReady5.bind(this));
  } else {
    this.end(new Buffer([0x05, 0x01]));
  }
}

function proxyReady5() {
  const resp = new Buffer(this.request.length);

  this.request.copy(resp);

  resp[0] = SOCKS_VERSION5;
  resp[1] = 0x00;
  resp[2] = 0x00;

  this.write(resp);
}

export { createSocksServer };
