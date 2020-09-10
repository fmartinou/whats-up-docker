const capitalize = require('capitalize');
const log = require('../log');
const {
    getWatcherConfigurations,
    getTriggerConfigurations,
    getRegistryConfigurations,
} = require('../configuration');

const state = {
    triggers: {},
    watchers: {},
    registries: {},
};

function getState() {
    return state;
}

/**
 * Register a component.
 *
 * @param {*} name
 * @param {*} configuration
 */
function registerComponent(kind, provider, name, configuration, path) {
    const providerLowercase = provider.toLowerCase();
    const nameLowercase = name.toLowerCase();

    let Component;
    try {
        const componentFile = `${path}/${providerLowercase.toLowerCase()}/${capitalize(provider)}`;
        /* eslint-disable-next-line */
        Component = require(componentFile);
    } catch (e) {
        log.error(`Component ${providerLowercase} does not exist (${e.message})`);
    }
    if (Component) {
        log.info(`Register ${kind} ${nameLowercase} of type ${providerLowercase} with configuration ${JSON.stringify(configuration)}`);
        const component = new Component();
        component.register(providerLowercase, nameLowercase, configuration);
        state[kind][component.getId()] = component;
        return component;
    }
    return undefined;
}

/**
 * Register all found components.
 * @param configurations
 * @param path
 * @returns {*[]}
 */
function registerComponents(kind, configurations, path) {
    if (configurations) {
        const providers = Object.keys(configurations);
        return providers.map((provider) => {
            log.info(`Register all components for provider ${provider}`);
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
    }
    return [];
}

function registerWatchers() {
    const configurations = getWatcherConfigurations();

    Object.keys(configurations).forEach((watcherKey) => {
        const watcherKeyNormalize = watcherKey.toLowerCase();
        registerComponent('watchers', 'docker', watcherKeyNormalize, configurations[watcherKeyNormalize], '../watchers/providers');
    });

    if (Object.keys(configurations).length === 0) {
        log.info('No Watcher configured => Init a default one (Docker with default options)');
        registerComponent('watchers', 'docker', 'local', {}, '../watchers/providers');
    }
}

/**
 * Register triggers.
 */
function registerTriggers() {
    const configurations = getTriggerConfigurations();
    registerComponents('triggers', configurations, '../triggers/providers');
}

function registerRegistries() {
    const configurations = getRegistryConfigurations();
    Object.keys(configurations).forEach((registryKey) => {
        const registryKeyNormalize = registryKey.toLowerCase();
        registerComponent('registries', registryKeyNormalize, registryKeyNormalize, configurations[registryKeyNormalize], '../registries/providers');
    });
    if (Object.keys(configurations).length === 0) {
        log.info('No Registry configured => Init a default one (Docker Hub with default options)');
        registerComponent('registries', 'hub', 'hub', {}, '../registries/providers');
    }
}

module.exports = {
    registerWatchers,
    registerTriggers,
    registerRegistries,
    getState,
};
