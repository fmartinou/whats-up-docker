/**
 * Registry handling all components (registries, triggers, controllers).
 */
const capitalize = require('capitalize');
const log = require('../log').child({ component: 'registry' });
const {
    getControllerConfigurations,
    getTriggerConfigurations,
    getRegistryConfigurations,
    getAuthenticationConfigurations,
} = require('../configuration');

/**
 * Registry state.
 */
const state = {
    trigger: {},
    controller: {},
    registry: {},
    authentication: {},
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
 * @returns Promise
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
    return Promise.resolve([]);
}

/**
 * Register controllers.
 * @returns {Promise}
 */
async function registerControllers() {
    const configurations = getControllerConfigurations();
    try {
        if (Object.keys(configurations).length === 0) {
            log.info('No Controller configured => Init a default one (Docker with default options)');
            await registerComponent('controller', 'docker', 'local', {}, '../controllers/providers');
        }
        await registerComponents('controller', configurations, '../controllers/providers');
    } catch (e) {
        log.warn(`Some controllers failed to register (${e.message})`);
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
    const registriesToRegister = {};

    // Default registries
    registriesToRegister.ecr = () => registerComponent('registry', 'ecr', 'ecr', '', '../registries/providers');
    registriesToRegister.gcr = () => registerComponent('registry', 'gcr', 'gcr', '', '../registries/providers');
    registriesToRegister.ghcr = () => registerComponent('registry', 'ghcr', 'ghcr', '', '../registries/providers');
    registriesToRegister.hotio = () => registerComponent('registry', 'hotio', 'hotio', '', '../registries/providers');
    registriesToRegister.hub = () => registerComponent('registry', 'hub', 'hub', '', '../registries/providers');
    registriesToRegister.quay = () => registerComponent('registry', 'quay', 'quay', '', '../registries/providers');

    try {
        Object.keys(configurations).forEach((registryKey) => {
            const registryKeyNormalize = registryKey.toLowerCase();
            registriesToRegister[registryKeyNormalize] = () => registerComponent(
                'registry',
                registryKeyNormalize,
                registryKeyNormalize,
                configurations[registryKeyNormalize],
                '../registries/providers',
            );
        });
        await Promise.all(Object.values(registriesToRegister)
            .sort()
            .map(((registerFn) => registerFn())));
    } catch (e) {
        log.warn(`Some registries failed to register (${e.message})`);
        log.debug(e);
    }
}

/**
 * Register authentications.
 */
async function registerAuthentications() {
    const configurations = getAuthenticationConfigurations();
    try {
        if (Object.keys(configurations).length === 0) {
            log.info('No authentication configured => Allow anonymous access');
            await registerComponent('authentication', 'anonymous', 'anonymous', {}, '../authentications/providers');
        }
        await registerComponents('authentication', configurations, '../authentications/providers');
    } catch (e) {
        log.warn(`Some authentications failed to register (${e.message})`);
        log.debug(e);
    }
}

/**
 * Unregister a component.
 * @param component
 * @param kind
 * @returns {Promise}
 */
async function unregisterComponent(component, kind) {
    try {
        await component.unregister();
    } catch (e) {
        throw new Error(`Error when unregistering component ${component.getId()}`);
    } finally {
        const components = getState()[kind];
        if (components) {
            delete components[component.getId()];
        }
    }
}

/**
 * Unregister all components of kind.
 * @param components
 * @param kind
 * @returns {Promise}
 */
async function unregisterComponents(components, kind) {
    const unregisterPromises = components
        .map(async (component) => unregisterComponent(component, kind));
    return Promise.all(unregisterPromises);
}

/**
 * Unregister all controllers.
 * @returns {Promise}
 */
async function unregisterControllers() {
    return unregisterComponents(Object.values(getState().controller), 'controller');
}

/**
 * Unregister all triggers.
 * @returns {Promise}
 */
async function unregisterTriggers() {
    return unregisterComponents(Object.values(getState().trigger), 'trigger');
}

/**
 * Unregister all registries.
 * @returns {Promise}
 */
async function unregisterRegistries() {
    return unregisterComponents(Object.values(getState().registry), 'registry');
}

/**
 * Unregister all authentications.
 * @returns {Promise<unknown>}
 */
async function unregisterAuthentications() {
    return unregisterComponents(Object.values(getState().authentication), 'authentication');
}

/**
 * Deregister all components.
 * @returns {Promise}
 */
async function unregisterAll() {
    try {
        await unregisterControllers();
        await unregisterTriggers();
        await unregisterRegistries();
        await unregisterAuthentications();
    } catch (e) {
        throw new Error(`Error when trying to unregister ${e.message}`);
    }
}

async function init() {
    // Register triggers
    await registerTriggers();

    // Register registries
    await registerRegistries();

    // Register controllers
    await registerControllers();

    // Register authentications
    await registerAuthentications();

    // Gracefully exit when possible
    process.on('SIGINT', unregisterAll);
    process.on('SIGTERM', unregisterAll);
}

module.exports = {
    init,
    getState,
};
