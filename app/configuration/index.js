const envProp = require('env-dot-prop');

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

module.exports = {
    getStoreConfiguration,
    getWatcherConfigurations,
    getTriggerConfigurations,
};
