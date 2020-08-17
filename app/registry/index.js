const capitalize = require('capitalize');
const log = require('../log');
const { getWatcherConfigurations, getTriggerConfigurations } = require('../configuration');

const watchers = {};
const triggers = {};

/**
 * Register a component.
 *
 * @param {*} name
 * @param {*} configuration
 */
function registerComponent(provider, name, configuration, path, state) {
    const stateToUpdate = state;
    const providerLowercase = provider.toLowerCase();
    const nameLowercase = name.toLowerCase();

    let Component;
    try {
        const componentFile = `${path}/${providerLowercase.toLowerCase()}/${capitalize(provider)}`;
        /* eslint-disable-next-line */
        Component = require(componentFile);
    } catch (e) {
        log.error(`Component ${providerLowercase} does not exist`);
    }
    if (Component) {
        log.info(`Register component ${nameLowercase} of type ${providerLowercase} with configuration ${JSON.stringify(configuration)}`);
        const component = new Component();
        component.register(providerLowercase, nameLowercase, configuration);
        stateToUpdate[component.getId()] = component;
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
function registerComponents(configurations, path, state) {
    if (configurations) {
        const providers = Object.keys(configurations);
        return providers.map((provider) => {
            log.info(`Register all components for provider ${provider}`);
            const providerConfigurations = configurations[provider];
            return Object.keys(providerConfigurations)
                .map((configurationName) => registerComponent(
                    provider,
                    configurationName,
                    providerConfigurations[configurationName],
                    path,
                    state,
                ));
        }).flat();
    }
    return [];
}

/**
 * Register inputs.
 */
function registerWatchers() {
    const configurations = getWatcherConfigurations();
    if (configurations) {
        return registerComponents(configurations, '../watcher/providers', watchers);
    }
    log.info('No Watcher found => Init a default Docker one');
    return [registerComponent('docker', 'local', {}, '../watcher/providers', watchers)];
}

/**
 * Register triggers.
 */
function registerTriggers() {
    const configurations = getTriggerConfigurations();
    return registerComponents(configurations, '../trigger/providers', triggers);
}

module.exports = {
    registerWatchers,
    registerTriggers,
    triggers,
    watchers,
};
