const capitalize = require('capitalize');
const log = require('../log');
const { getWatcherConfigurations, getTriggerConfigurations } = require('../configuration');

/**
 * Register component.
 *
 * @param {*} name
 * @param {*} configuration
 */
function registerComponent(provider, name, configuration, path) {
    const providerCapitalized = capitalize(provider);
    const nameCapitalized = capitalize(name);

    let Component;
    try {
        const componentFile = `${path}/${providerCapitalized.toLowerCase()}/${providerCapitalized}`;
        /* eslint-disable-next-line */
        Component = require(componentFile);
    } catch (e) {
        log.error(`Component ${providerCapitalized} does not exist`);
    }
    if (Component) {
        log.info(`Register component ${nameCapitalized} of type ${providerCapitalized} with configuration ${JSON.stringify(configuration)}`);
        const component = new Component();
        component.register(providerCapitalized, nameCapitalized, configuration);
        return component;
    }
    return undefined;
}

function registerComponents(configurations, path) {
    if (configurations) {
        const providers = Object.keys(configurations);
        return providers.map((provider) => {
            log.info(`Register all components for provider ${provider}`);
            const providerConfigurations = configurations[provider];
            return Object.keys(providerConfigurations)
                .map(configurationName => registerComponent(
                    provider,
                    configurationName,
                    providerConfigurations[configurationName],
                    path,
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
    return registerComponents(configurations, '../watcher/providers');
}

/**
 * Register triggers.
 */
function registerTriggers() {
    const configurations = getTriggerConfigurations();
    return registerComponents(configurations, '../trigger/providers');
}

module.exports = {
    registerWatchers,
    registerTriggers,
};
