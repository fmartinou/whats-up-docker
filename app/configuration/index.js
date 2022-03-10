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
 * Get Server configurations.
 */
function getServerConfiguration() {
    // Deprecated env var namespace; to be removed on next major version
    const apiConfiguration = envProp.get('wud.api');

    // New en var namespace
    const serverConfiguration = envProp.get('wud.server');

    // Merge deprecated & new env vars
    return {
        ...apiConfiguration,
        ...serverConfiguration,
    };
}

function getPublicUrl(req) {
    const publicUrl = process.env.WUD_PUBLIC_URL;
    if (publicUrl) {
        return publicUrl;
    }
    // Try to guess from request
    return `${req.protocol}://${req.hostname}`;
}

module.exports = {
    getVersion,
    getLogLevel,
    getStoreConfiguration,
    getWatcherConfigurations,
    getTriggerConfigurations,
    getRegistryConfigurations,
    getAuthenticationConfigurations,
    getServerConfiguration,
    getPublicUrl,
};
