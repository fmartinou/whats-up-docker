const joi = require('joi');
const express = require('express');
const log = require('../log');
const apiRouter = require('./api');
const uiRouter = require('./ui');
const prometheusRouter = require('./prometheus');
const healthRouter = require('./health');

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

        // Mount API
        app.use('/api', apiRouter.init());

        // Mount Healthcheck
        app.use('/health', healthRouter.init());

        // Mount Prometheus metrics
        app.use('/metrics', prometheusRouter.init());

        // Serve ui (resulting from ui built & copied on docker build)
        app.use('/', uiRouter.init());

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
