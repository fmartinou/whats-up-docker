const configuration = require('../configuration');
const log = require('../log');
const Component = require('./Component');
const prometheusWatcher = require('../prometheus/watcher');

jest.mock('../configuration');

configuration.getLogLevel = () => 'info';

let registries = {};
let triggers = {};
let watchers = {};

configuration.getRegistryConfigurations = () => (registries);
configuration.getTriggerConfigurations = () => (triggers);
configuration.getWatcherConfigurations = () => (watchers);

const registry = require('./index');

beforeEach(() => {
    jest.resetAllMocks();
    prometheusWatcher.init();
    registries = {};
    triggers = {};
    watchers = {};
});

afterEach(async () => {
    try {
        await registry.__get__('deregisterRegistries')();
        await registry.__get__('deregisterTriggers')();
        await registry.__get__('deregisterWatchers')();
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

test('deregisterComponent should throw when component fails to deregister', () => {
    const deregisterComponent = registry.__get__('deregisterComponent');
    const component = new Component();
    component.deregister = () => { throw new Error('Error x'); };
    expect(deregisterComponent(component)).rejects.toThrowError('Error when deregistering component undefined.undefined');
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
    expect(Object.keys(registry.getState().registries)).toEqual(['hub', 'ecr']);
});

test('registerRegistries should register hub by default', async () => {
    await registry.__get__('registerRegistries')();
    expect(Object.keys(registry.getState().registries)).toEqual(['hub']);
});

test('registerRegistries should warn when registration errors occur', async () => {
    const spyLog = jest.spyOn(log, 'warn');
    registries = {
        hub: {
            login: false,
        },
    };
    await registry.__get__('registerRegistries')();
    expect(spyLog).toHaveBeenCalledWith('Some registries failed to register (Error when registering component hub ("login" is not allowed))');
});

test('registerTriggers should register all triggers', async () => {
    triggers = {
        mock: {
            mock1: {},
            mock2: {},
        },
    };
    await registry.__get__('registerTriggers')();
    expect(Object.keys(registry.getState().triggers)).toEqual(['mock.mock1', 'mock.mock2']);
});

test('registerTriggers should warn when registration errors occur', async () => {
    const spyLog = jest.spyOn(log, 'warn');
    triggers = {
        trigger1: {
            fail: true,
        },
    };
    await registry.__get__('registerTriggers')();
    expect(spyLog).toHaveBeenCalledWith('Some triggers failed to register (Error when registering component trigger1 (Cannot find module \'../triggers/providers/trigger1/Trigger1\' from \'registry/index.js\'))');
});

test('registerWatchers should register all watchers', async () => {
    watchers = {
        watcher1: {
            host: 'host1',
        },
        watcher2: {
            host: 'host2',
        },
    };
    await registry.__get__('registerWatchers')();
    expect(Object.keys(registry.getState().watchers)).toEqual(['docker.watcher1', 'docker.watcher2']);
});

test('registerWatchers should register local docker watcher by default', async () => {
    await registry.__get__('registerWatchers')();
    expect(Object.keys(registry.getState().watchers)).toEqual(['docker.local']);
});

test('registerWatchers should warn when registration errors occur', async () => {
    const spyLog = jest.spyOn(log, 'warn');
    watchers = {
        watcher1: {
            fail: true,
        },
    };
    await registry.__get__('registerWatchers')();
    expect(spyLog).toHaveBeenCalledWith('Some watchers failed to register (Error when registering component docker ("fail" is not allowed))');
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
    watchers = {
        watcher1: {
            host: 'host1',
        },
        watcher2: {
            host: 'host2',
        },
    };
    await registry.init();
    expect(Object.keys(registry.getState().registries)).toEqual(['hub', 'ecr']);
    expect(Object.keys(registry.getState().triggers)).toEqual(['mock.mock1', 'mock.mock2']);
    expect(Object.keys(registry.getState().watchers)).toEqual(['docker.watcher1', 'docker.watcher2']);
});

test('deregisterAll should deregister all components', async () => {
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
    watchers = {
        watcher1: {
            host: 'host1',
        },
        watcher2: {
            host: 'host2',
        },
    };
    await registry.init();
    await registry.__get__('deregisterAll')();
    expect(Object.keys(registry.getState().registries).length).toEqual(0);
    expect(Object.keys(registry.getState().triggers).length).toEqual(0);
    expect(Object.keys(registry.getState().watchers).length).toEqual(0);
});

test('deregisterAll should throw an error when any component fails to deregister', () => {
    const component = new Component();
    component.deregister = () => { throw new Error('Fail!!!'); };
    registry.getState().triggers = {
        trigger1: component,
    };
    expect(registry.__get__('deregisterAll')())
        .rejects
        .toThrowError('Error when deregistering component undefined.undefined');
});

test('deregisterRegistries should throw when errors occurred', async () => {
    const component = new Component();
    component.deregister = () => { throw new Error('Fail!!!'); };
    registry.getState().registries = {
        registry1: component,
    };
    expect(registry.__get__('deregisterRegistries')())
        .rejects
        .toThrowError('Error when deregistering component undefined.undefined');
});

test('deregisterTriggers should throw when errors occurred', async () => {
    const component = new Component();
    component.deregister = () => { throw new Error('Fail!!!'); };
    registry.getState().triggers = {
        trigger1: component,
    };
    expect(registry.__get__('deregisterTriggers')())
        .rejects
        .toThrowError('Error when deregistering component undefined.undefined');
});

test('deregisterWatchers should throw when errors occurred', async () => {
    const component = new Component();
    component.deregister = () => { throw new Error('Fail!!!'); };
    registry.getState().watchers = {
        watcher1: component,
    };
    expect(registry.__get__('deregisterWatchers')())
        .rejects
        .toThrowError('Error when deregistering component undefined.undefined');
});
