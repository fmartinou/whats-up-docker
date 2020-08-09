const envProp = require('env-dot-prop');

function getLogLevel() {
    return process.env.WUD_LOG_LEVEL || 'info';
}
/**
 * Get Input configurations.
 */
function getWatcherConfigurations() {
    return envProp.get('wud.watcher');
}

/**
 * Get output configurations.
 */
function getTriggerConfigurations() {
    return envProp.get('wud.trigger');
}

/**
 * Get Input configurations.
 */
function getStoreConfiguration() {
    return envProp.get('wud.store');
}

/**
 * Get API configurations.
 */
function getApiConfiguration() {
    return envProp.get('wud.api');
}

module.exports = {
    getLogLevel,
    getStoreConfiguration,
    getWatcherConfigurations,
    getTriggerConfigurations,
    getApiConfiguration,
};
