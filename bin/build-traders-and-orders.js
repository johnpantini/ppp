const ncc = require('../vendor/ncc/index.min.js');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/**
 * Rebuilds deployable trader/order bundles using the browser's decorator transform.
 * Paths are resolved from this script so the build also works outside /ppp.
 * @returns {Promise<void>} Resolves after every bundle has been written.
 */
async function buildTradersAndOrders() {
  const sw = fs.readFileSync(path.join(root, 'ppp-sw.js'), 'utf8');
  const script = new vm.Script(sw);
  const context = {
    self: {
      addEventListener: () => {}
    }
  };

  vm.createContext(context);
  script.runInContext(context);

  globalThis.removeDecorators = context.removeDecorators;

  for (const traderName of [
    'alor-openapi-v2',
    'alpaca-v2-plus',
    'binance-v3',
    'bybit-v5',
    'capitalcom',
    'ib',
    'paper-trade',
    'combined-l1',
    'combined-orderbook',
    'tinkoff-grpc-web',
    'utex-margin-stocks'
  ]) {
    const traderPath = path.join(root, 'lib', 'traders', `${traderName}.js`);
    const { code } = await ncc(traderPath, {
      cache: false,
      minify: true,
      quiet: true
    });

    if (code) {
      fs.writeFileSync(
        path.join(root, 'lib', 'traders', 'build', `${traderName}.min.js`),
        code
      );
    }
  }

  for (const orderName of ['stop-loss-take-profit', 'market-data-recorder']) {
    const orderPath = path.join(root, 'lib', 'orders', orderName, 'impl.js');
    const { code } = await ncc(orderPath, {
      cache: false,
      minify: true,
      quiet: true,
      externals: [
        '../../../vendor/zip-full.min.js',
        '../../../vendor/jose.min.js',
        '../../../elements/pages/api-yc.js'
      ]
    });

    if (code) {
      fs.writeFileSync(orderPath.replace('.js', '.min.js'), code);
    }
  }
}

buildTradersAndOrders().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
