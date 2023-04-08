const configuration = require('../configuration');
const Component = require('./Component');
const prometheusController = require('../prometheus/controller');

jest.mock('../configuration');

configuration.getLogLevel = () => 'info';

let registries = {};
let triggers = {};
let controllers = {};
let authentications = {};

configuration.getRegistryConfigurations = () => (registries);
configuration.getTriggerConfigurations = () => (triggers);
configuration.getControllerConfigurations = () => (controllers);
configuration.getAuthenticationConfigurations = () => (authentications);

const registry = require('./index');

beforeEach(() => {
    jest.resetAllMocks();
    prometheusController.init();
    registries = {};
    triggers = {};
    controllers = {};
    authentications = {};
});

afterEach(async () => {
    try {
        await registry.__get__('unregisterRegistries')();
        await registry.__get__('unregisterTriggers')();
        await registry.__get__('unregisterControllers')();
        await registry.__get__('unregisterAuthentications')();
    } catch (e) {
        // ignore error
    }
});

test('registerComponent should warn when component does not exist', () => {
    const registerComponent = registry.__get__('registerComponent');
    expect(registerComponent('kind', 'provider', 'name', {}, 'path')).rejects.toThrow('Error when registering component provider (Cannot find module \'path/provider/Provider\' from \'registry/index.js\'');
});

test('registerComponents should return empty array if not components', () => {
    const registerComponents = registry.__get__('registerComponents');
    expect(registerComponents('kind', undefined, 'path')).resolves.toEqual([]);
});

test('unregisterComponent should throw when component fails to unregister', () => {
    const unregisterComponent = registry.__get__('unregisterComponent');
    const component = new Component();
    component.unregister = () => { throw new Error('Error x'); };
    expect(unregisterComponent(component)).rejects.toThrowError('Error when unregistering component undefined.undefined');
});

test('registerRegistries should register all registries', async () => {
    registries = {
        hub: {
            login: 'login',
            token: 'token',
        },
        ecr: {
            accesskeyid: 'key',
            secretaccesskey: 'secret',
            region: 'region',
        },
    };
    await registry.__get__('registerRegistries')();
    expect(Object.keys(registry.getState().registry).sort()).toEqual(['ecr', 'gcr', 'ghcr', 'hotio', 'hub', 'quay']);
});

test('registerRegistries should register all anonymous registries by default', async () => {
    await registry.__get__('registerRegistries')();
    expect(Object.keys(registry.getState().registry).sort()).toEqual(['ecr', 'gcr', 'ghcr', 'hotio', 'hub', 'quay']);
});

test('registerRegistries should warn when registration errors occur', async () => {
    const spyLog = jest.spyOn(registry.__get__('log'), 'warn');
    registries = {
        hub: {
            login: false,
        },
    };
    await registry.__get__('registerRegistries')();
    expect(spyLog).toHaveBeenCalledWith('Some registries failed to register (Error when registering component hub ("login" must be a string))');
});

test('registerTriggers should register all triggers', async () => {
    triggers = {
        mock: {
            mock1: {},
            mock2: {},
        },
    };
    await registry.__get__('registerTriggers')();
    expect(Object.keys(registry.getState().trigger)).toEqual(['trigger.mock.mock1', 'trigger.mock.mock2']);
});

test('registerTriggers should warn when registration errors occur', async () => {
    const spyLog = jest.spyOn(registry.__get__('log'), 'warn');
    triggers = {
        trigger1: {
            fail: true,
        },
    };
    await registry.__get__('registerTriggers')();
    expect(spyLog).toHaveBeenCalledWith('Some triggers failed to register (Error when registering component trigger1 (Cannot find module \'../triggers/providers/trigger1/Trigger1\' from \'registry/index.js\'))');
});

test('registerControllers should register all controllers', async () => {
    controllers = {
        docker: {
            controller1: {
                host: 'host1',
            },
            controller2: {
                host: 'host2',
            },
        },
    };
    await registry.__get__('registerControllers')();
    expect(Object.keys(registry.getState().controller)).toEqual(['controller.docker.controller1', 'controller.docker.controller2']);
});

test('registerControllers should register local docker controller by default', async () => {
    await registry.__get__('registerControllers')();
    expect(Object.keys(registry.getState().controller)).toEqual(['controller.docker.local']);
});

test('registerControllers should warn when registration errors occur', async () => {
    const spyLog = jest.spyOn(registry.__get__('log'), 'warn');
    controllers = {
        docker: {
            controller1: {
                fail: true,
            },
        },
    };
    await registry.__get__('registerControllers')();
    expect(spyLog).toHaveBeenCalledWith('Some controllers failed to register (Error when registering component docker ("fail" is not allowed))');
});

test('registerAuthentications should register all auth strategies', async () => {
    authentications = {
        basic: {
            john: {
                user: 'john',
                hash: 'hash',
            },
            jane: {
                user: 'jane',
                hash: 'hash',
            },
        },
    };
    await registry.__get__('registerAuthentications')();
    expect(Object.keys(registry.getState().authentication)).toEqual(['authentication.basic.john', 'authentication.basic.jane']);
});

test('registerAuthentications should warn when registration errors occur', async () => {
    const spyLog = jest.spyOn(registry.__get__('log'), 'warn');
    authentications = {
        basic: {
            john: {
                fail: true,
            },
        },
    };
    await registry.__get__('registerAuthentications')();
    expect(spyLog).toHaveBeenCalledWith('Some authentications failed to register (Error when registering component basic ("user" is required))');
});

test('registerAuthentications should register anonymous auth by default', async () => {
    await registry.__get__('registerAuthentications')();
    expect(Object.keys(registry.getState().authentication)).toEqual(['authentication.anonymous.anonymous']);
});

test('init should register all components', async () => {
    registries = {
        hub: {
            login: 'login',
            token: 'token',
        },
        ecr: {
            accesskeyid: 'key',
            secretaccesskey: 'secret',
            region: 'region',
        },
    };
    triggers = {
        mock: {
            mock1: {},
            mock2: {},
        },
    };
    controllers = {
        docker: {
            controller1: {
                host: 'host1',
            },
            controller2: {
                host: 'host2',
            },
        },
    };
    authentications = {
        basic: {
            john: {
                user: 'john',
                hash: 'hash',
            },
            jane: {
                user: 'jane',
                hash: 'hash',
            },
        },
    };
    await registry.init();
    expect(Object.keys(registry.getState().registry).sort()).toEqual(['ecr', 'gcr', 'ghcr', 'hotio', 'hub', 'quay']);
    expect(Object.keys(registry.getState().trigger)).toEqual(['trigger.mock.mock1', 'trigger.mock.mock2']);
    expect(Object.keys(registry.getState().controller)).toEqual(['controller.docker.controller1', 'controller.docker.controller2']);
    expect(Object.keys(registry.getState().authentication)).toEqual(['authentication.basic.john', 'authentication.basic.jane']);
});

test('unregisterAll should unregister all components', async () => {
    registries = {
        hub: {
            login: 'login',
            token: 'token',
        },
        ecr: {
            accesskeyid: 'key',
            secretaccesskey: 'secret',
            region: 'region',
        },
    };
    triggers = {
        mock: {
            mock1: {},
            mock2: {},
        },
    };
    controllers = {
        controller1: {
            host: 'host1',
        },
        controller2: {
            host: 'host2',
        },
    };
    authentications = {
        basic: {
            john: {
                user: 'john',
                hash: 'hash',
            },
            jane: {
                user: 'jane',
                hash: 'hash',
            },
        },
    };
    await registry.init();
    await registry.__get__('unregisterAll')();
    expect(Object.keys(registry.getState().registry).length).toEqual(0);
    expect(Object.keys(registry.getState().trigger).length).toEqual(0);
    expect(Object.keys(registry.getState().controller).length).toEqual(0);
    expect(Object.keys(registry.getState().authentication).length).toEqual(0);
});

test('unregisterAll should throw an error when any component fails to unregister', () => {
    const component = new Component();
    component.unregister = () => { throw new Error('Fail!!!'); };
    registry.getState().trigger = {
        trigger1: component,
    };
    expect(registry.__get__('unregisterAll')())
        .rejects
        .toThrowError('Error when unregistering component undefined.undefined');
});

test('unregisterRegistries should throw when errors occurred', async () => {
    const component = new Component();
    component.unregister = () => { throw new Error('Fail!!!'); };
    registry.getState().registry = {
        registry1: component,
    };
    expect(registry.__get__('unregisterRegistries')())
        .rejects
        .toThrowError('Error when unregistering component undefined.undefined');
});

test('unregisterTriggers should throw when errors occurred', async () => {
    const component = new Component();
    component.unregister = () => { throw new Error('Fail!!!'); };
    registry.getState().trigger = {
        trigger1: component,
    };
    expect(registry.__get__('unregisterTriggers')())
        .rejects
        .toThrowError('Error when unregistering component undefined.undefined');
});

test('unregisterControllers should throw when errors occurred', async () => {
    const component = new Component();
    component.unregister = () => { throw new Error('Fail!!!'); };
    registry.getState().controller = {
        controller1: component,
    };
    expect(registry.__get__('unregisterControllers')())
        .rejects
        .toThrowError('Error when unregistering component undefined.undefined');
});
