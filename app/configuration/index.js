const envProp = require('env-dot-prop');

function getVersion() {
    return process.env.WUD_VERSION || 'unknown';
}

function getLogLevel() {
    return process.env.WUD_LOG_LEVEL || 'info';
}
/**
 * Get watcher configuration.
 */
function getWatcherConfigurations() {
    return envProp.get('wud.watcher') || {};
}

/**
 * Get trigger configurations.
 */
function getTriggerConfigurations() {
    return envProp.get('wud.trigger') || {};
}

/**
 * Get registry configurations.
 * @returns {*}
 */
function getRegistryConfigurations() {
    return envProp.get('wud.registry') || {};
}

/**
 * Get authentication configurations.
 * @returns {*}
 */
function getAuthenticationConfigurations() {
    return envProp.get('wud.auth') || {};
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
    getVersion,
    getLogLevel,
    getStoreConfiguration,
    getWatcherConfigurations,
    getTriggerConfigurations,
    getRegistryConfigurations,
    getAuthenticationConfigurations,
    getApiConfiguration,
};
