const log = require('./log');
const store = require('./store');
const registry = require('./registry');
const api = require('./api');

log.info('What\'s up, docker? is starting');

async function main() {
    // Init store
    await store.init();

    // Init api
    await api.init();

    // Register triggers
    registry.registerTriggers();

    // Register watchers
    registry.registerWatchers();
}
main();
