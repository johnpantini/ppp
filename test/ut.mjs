import { EventEmitter } from 'events';
import { inspect } from 'util';
import { Aurora, USDataServer } from '../salt/states/ppp/lib/aurora/aurora.mjs';

process.env.UT_BYPASS = 1;

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

export class AuroraConnection extends EventEmitter {
  constructor({ username, password }) {
    super();

    this.aurora = new Aurora({
      username,
      password
    });

    this.aurora.on('dataserver', this.#onAuroraDataServer.bind(this));
    this.aurora.on('connect', this.#onAuroraConnect.bind(this));
    this.aurora.on('disconnect', this.#onAuroraDisconnect.bind(this));

    this.aurora.on('error', () => {
      this.aurora.disconnect();
    });

    if (process.env.UT_BYPASS === '1') this.#onAuroraConnect();
    else this.aurora.connect();
  }

  log(message) {
    console.log(
      `[AuroraConnection][${process.env.UT_USERNAME}] ` +
        inspect(message, { depth: 10 })
    );
  }

  #onAuroraConnect() {
    if (process.env.UT_BYPASS === '1')
      this.aurora.AuthServerAddressResponse({
        realm: 'aurora',
        authServerAddress: 'sso.unitedtraders.com',
        authServerPort: 6566,
        clientId: 'aurora-terminal'
      });
    else {
      const requestId = this.aurora.createReqId();

      const authServerAddressRequest = this.aurora.makeProtoMessage(
        'AuthServerAddressRequest',
        {
          requestId
        }
      );

      this.aurora.log('Sending new AuthServerAddressRequest...');
      this.aurora.socket.write(authServerAddressRequest);
    }
  }

  #onAuroraDataServer(server) {
    if (this._usServer) {
      this._usServer.removeAllListeners('ConnectionPermit');
      this._usServer.removeAllListeners('HistoryResponse');
      this._usServer.removeAllListeners('reconnect');
      this._usServer.removeAllListeners('connect');
      this._usServer.disconnect();
      this._usServer = void 0;
    }

    this._usServer = new USDataServer(
      server.Address,
      server.Port,
      this.aurora.accessToken
    );

    this._usServer.on('connect', this._onUSServerConnect.bind(this));
    this._usServer.on('reconnect', this._onUSServerReconnect.bind(this));

    this._usServer.on(
      'ConnectionPermit',
      this._onUSServerConnectionPermit.bind(this)
    );
    this._usServer.on('MarketPrint', this._onUSServerMarketPrint.bind(this));
    this._usServer.on('HistoryResponse', this._onUSServerHistoryResponse.bind(this));
    this._usServer.connect();
  }

  _onUSServerConnectionPermit() {
    this.log('_onUSServerConnectionPermit');

    this._usServer.historyRequest('AAPL~US');

    // this._usServer.dataSubscriptionRequest('AAPL~US', true);
    //
    // setTimeout(() => {
    //   this._usServer.dataSubscriptionRequest('AAPL~US', false);
    // }, 5000);
  }

  _onUSServerReconnect(attempt) {
    this.log('_onUSServerReconnect');
  }

  _onUSServerConnect() {
    this._usServer.tokenLogin();
  }

  _onUSServerMarketPrint(payload) {
    const json = JSON.parse(JSON.stringify(payload));

    console.log(json);
  }

  _onUSServerHistoryResponse(payload) {
    const json = JSON.parse(JSON.stringify(payload));

    console.log(json);
  }

  #onAuroraDisconnect() {
    this.log('#onAuroraDisconnect');
  }
}

new AuroraConnection({
  username: process.env.UT_USERNAME,
  password: process.env.UT_PASSWORD
});
