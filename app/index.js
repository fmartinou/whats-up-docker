const { getVersion } = require('./configuration');
const log = require('./log');
const store = require('./store');
const registry = require('./registry');
const api = require('./api');
const prometheus = require('./prometheus');
const engine = require('./engine');

async function main() {
    log.info(`What's up Docker? is starting (version = ${getVersion()})`);

    // Start engine
    engine.start();

    // Init store
    await store.init();

    // Start Prometheus registry
    prometheus.init();

    // Init registry
    await registry.init();

    // Init api
    await api.init();
}
main();
