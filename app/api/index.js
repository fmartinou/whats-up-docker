const joi = require('@hapi/joi');
const express = require('express');
const log = require('../log');
const logRouter = require('./log');
const storeRouter = require('./store');
const imageRouter = require('./image');
const triggerRouter = require('./trigger');
const watcherRouter = require('./watcher');
const { getApiConfiguration } = require('../configuration');

// Configuration Schema
const configurationSchema = joi.object().keys({
    enabled: joi.boolean().default(true),
    port: joi.number().default(3000).integer().min(0)
        .max(65535),
});

// Validate Configuration
const configurationToValidate = configurationSchema.validate(getApiConfiguration() || {});
if (configurationToValidate.error) {
    throw configurationToValidate.error;
}
const configuration = configurationToValidate.value;

/**
 * Init Http API.
 * @returns {Promise<void>}
 */
async function init() {
    // Start API if enabled
    if (configuration.enabled) {
        log.debug(`HTTP API enabled => Start Http listener on port ${configuration.port}`);

        // Init Express app
        const app = express();

        // Mount log router
        app.use('/api/log', logRouter.init());

        // Mount store router
        app.use('/api/store', storeRouter.init());

        // Mount images router
        app.use('/api/images', imageRouter.init());

        // Mount trigger router
        app.use('/api/triggers', triggerRouter.init());

        // Mount watcher router
        app.use('/api/watchers', watcherRouter.init());

        // Listen
        app.listen(configuration.port, () => {
            log.info(`HTTP API exposed on port ${configuration.port}`);
        });
    } else {
        log.debug('WUD API disabled');
    }
}

module.exports = {
    init,
};
