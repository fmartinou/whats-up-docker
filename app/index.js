const log = require('./log');
const store = require('./store');
const registry = require('./registry');
const api = require('./api');
const prometheus = require('./prometheus');

log.info('What\'s up, docker? is starting');

async function main() {
    // Init store
    await store.init();

    // Start Prometheus registry
    prometheus.startRegistry();

    // Register triggers
    registry.registerTriggers();

    // Register registries
    registry.registerRegistries();

    // Register watchers
    registry.registerWatchers();

    // Init api
    await api.init();
}
main();
