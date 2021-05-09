const { getVersion } = require('./configuration');
const log = require('./log');
const store = require('./store');
const registry = require('./registry');
const api = require('./api');
const prometheus = require('./prometheus');

log.info(`What's up Docker? is starting (version = ${getVersion()})`);

async function main() {
    // Init store
    await store.init();

    // Start Prometheus registry
    prometheus.init();

    // Register triggers
    await registry.registerTriggers();

    // Register registries
    await registry.registerRegistries();

    // Register watchers
    await registry.registerWatchers();

    // Init api
    await api.init();
}
main();
