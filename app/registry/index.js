/**
 * Registry handling all components (registries, triggers, watchers).
 */
const capitalize = require('capitalize');
const log = require('../log').child({ component: 'registry' });
const {
    getWatcherConfigurations,
    getTriggerConfigurations,
    getRegistryConfigurations,
} = require('../configuration');

/**
 * Registry state.
 */
const state = {
    trigger: {},
    watcher: {},
    registry: {},
};

function getState() {
    return state;
}

/**
 * Register a component.
 *
 * @param {*} kind
 * @param {*} provider
 * @param {*} name
 * @param {*} configuration
 * @param {*} path
 */
async function registerComponent(kind, provider, name, configuration, path) {
    const providerLowercase = provider.toLowerCase();
    const nameLowercase = name.toLowerCase();
    const componentFile = `${path}/${providerLowercase.toLowerCase()}/${capitalize(provider)}`;
    try {
        // eslint-disable-next-line
        const Component = require(componentFile);
        const component = new Component();
        const componentRegistered = await component.register(
            kind,
            providerLowercase,
            nameLowercase,
            configuration,
        );
        state[kind][component.getId()] = component;
        return componentRegistered;
    } catch (e) {
        throw new Error(`Error when registering component ${providerLowercase} (${e.message})`);
    }
}

/**
 * Register all found components.
 * @param kind
 * @param configurations
 * @param path
 * @returns {*[]}
 */
async function registerComponents(kind, configurations, path) {
    if (configurations) {
        const providers = Object.keys(configurations);
        const providerPromises = providers.map((provider) => {
            log.info(`Register all components of kind ${kind} for provider ${provider}`);
            const providerConfigurations = configurations[provider];
            return Object.keys(providerConfigurations)
                .map((configurationName) => registerComponent(
                    kind,
                    provider,
                    configurationName,
                    providerConfigurations[configurationName],
                    path,
                ));
        }).flat();
        return Promise.all(providerPromises);
    }
    return [];
}

/**
 * Register watchers.
 * @returns {Promise}
 */
async function registerWatchers() {
    const configurations = getWatcherConfigurations();
    let watchersToRegister = [];
    try {
        if (Object.keys(configurations).length === 0) {
            log.info('No Watcher configured => Init a default one (Docker with default options)');
            watchersToRegister.push(registerComponent('watcher', 'docker', 'local', {}, '../watchers/providers'));
        } else {
            watchersToRegister = watchersToRegister
                .concat(Object.keys(configurations).map((watcherKey) => {
                    const watcherKeyNormalize = watcherKey.toLowerCase();
                    return registerComponent('watcher', 'docker', watcherKeyNormalize, configurations[watcherKeyNormalize], '../watchers/providers');
                }));
        }
        await Promise.all(watchersToRegister);
    } catch (e) {
        log.warn(`Some watchers failed to register (${e.message})`);
        log.debug(e);
    }
}

/**
 * Register triggers.
 */
async function registerTriggers() {
    const configurations = getTriggerConfigurations();
    try {
        await registerComponents('trigger', configurations, '../triggers/providers');
    } catch (e) {
        log.warn(`Some triggers failed to register (${e.message})`);
        log.debug(e);
    }
}

/**
 * Register registries.
 * @returns {Promise}
 */
async function registerRegistries() {
    const configurations = getRegistryConfigurations();
    let registriesToRegister = [];
    try {
        if (Object.keys(configurations).length === 0) {
            log.info('No Registry configured => Init a default one (Docker Hub with default options)');
            registriesToRegister.push(registerComponent('registry', 'hub', 'hub', {}, '../registries/providers'));
        } else {
            registriesToRegister = registriesToRegister
                .concat(Object.keys(configurations).map((registryKey) => {
                    const registryKeyNormalize = registryKey.toLowerCase();
                    return registerComponent('registry', registryKeyNormalize, registryKeyNormalize, configurations[registryKeyNormalize], '../registries/providers');
                }));
        }
        await Promise.all(registriesToRegister);
    } catch (e) {
        log.warn(`Some registries failed to register (${e.message})`);
        log.debug(e);
    }
}

/**
 * Deregister a component.
 * @param component
 * @param kind
 * @returns {Promise}
 */
async function deregisterComponent(component, kind) {
    try {
        await component.deregister();
    } catch (e) {
        throw new Error(`Error when deregistering component ${component.getId()}`);
    } finally {
        const components = getState()[kind];
        if (components) {
            delete components[component.getId()];
        }
    }
}

/**
 * Deregister all components of kind.
 * @param components
 * @param kind
 * @returns {Promise}
 */
async function deregisterComponents(components, kind) {
    const deregisterPromises = components
        .map(async (component) => deregisterComponent(component, kind));
    return Promise.all(deregisterPromises);
}

/**
 * Deregister all watchers.
 * @returns {Promise}
 */
async function deregisterWatchers() {
    return deregisterComponents(Object.values(getState().watcher), 'watcher');
}

/**
 * Deregister all triggers.
 * @returns {Promise}
 */
async function deregisterTriggers() {
    return deregisterComponents(Object.values(getState().trigger), 'trigger');
}

/**
 * Deregister all registries.
 * @returns {Promise}
 */
async function deregisterRegistries() {
    return deregisterComponents(Object.values(getState().registry), 'registry');
}

/**
 * Deregister all components.
 * @returns {Promise}
 */
async function deregisterAll() {
    try {
        await deregisterWatchers();
        await deregisterTriggers();
        await deregisterRegistries();
    } catch (e) {
        throw new Error(`Error when trying to deregister ${e.message}`);
    }
}

async function init() {
    // Register triggers
    await registerTriggers();

    // Register registries
    await registerRegistries();

    // Register watchers
    await registerWatchers();

    // Gracefully exit when possible
    process.on('SIGINT', deregisterAll);
    process.on('SIGTERM', deregisterAll);
}

module.exports = {
    init,
    getState,
};
