const ncc = require('/ppp/vendor/ncc/index.min.js');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

(async () => {
  const sw = fs.readFileSync('/ppp/ppp-sw.js', 'utf8');
  const script = new vm.Script(sw);
  const context = {
    self: {
      addEventListener: () => {}
    }
  };

  vm.createContext(context);
  script.runInContext(context);

  globalThis.removeDecorators = context.removeDecorators;

  for (const traderPath of [
    '/ppp/lib/traders/alor-openapi-v2.js',
    '/ppp/lib/traders/alpaca-v2-plus.js',
    '/ppp/lib/traders/binance-v3.js',
    '/ppp/lib/traders/bybit-v5.js',
    '/ppp/lib/traders/capitalcom.js',
    '/ppp/lib/traders/finam-trade-api.js',
    '/ppp/lib/traders/ib.js',
    '/ppp/lib/traders/paper-trade.js',
    '/ppp/lib/traders/combined-l1.js',
    '/ppp/lib/traders/combined-orderbook.js',
    '/ppp/lib/traders/tinkoff-grpc-web.js',
    '/ppp/lib/traders/utex-margin-stocks.js'
  ]) {
    const { code } = await ncc(traderPath, {
      cache: false,
      minify: true,
      quiet: true
    });

    if (code) {
      fs.writeFileSync(
        `/ppp/lib/traders/build/${path
          .basename(traderPath)
          .replace('.js', '.min.js')}`,
        code
      );
    }
  }

  for (const orderPath of [
    '/ppp/lib/orders/stop-loss-take-profit/impl.js',
    '/ppp/lib/orders/market-data-recorder/impl.js'
  ]) {
    const { code } = await ncc(orderPath, {
      cache: false,
      minify: true,
      quiet: true
    });

    if (code) {
      fs.writeFileSync(orderPath.replace('.js', '.min.js'), code);
    }
  }
})();
