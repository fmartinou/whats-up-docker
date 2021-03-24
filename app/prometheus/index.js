const { collectDefaultMetrics, register } = require('prom-client');

const log = require('../log');
const image = require('./image');
const registry = require('./registry');
const trigger = require('./trigger');
const updateAvailable = require('./update-available');
const watcher = require('./watcher');

/**
 * Start the Prometheus registry.
 */
function init() {
    log.info('Init Prometheus module');
    collectDefaultMetrics();
    image.init();
    registry.init();
    trigger.init();
    updateAvailable.init();
    watcher.init();
}

/**
 * Return all metrics as string for Prometheus scrapping.
 * @returns {string}
 */
async function output() {
    return register.metrics();
}

module.exports = {
    init,
    output,
};
