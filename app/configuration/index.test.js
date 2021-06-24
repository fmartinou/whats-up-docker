const configuration = require('./index');

test('getVersion should return wud version', () => {
    process.env.WUD_VERSION = 'x.y.z';
    expect(configuration.getVersion()).toStrictEqual('x.y.z');
});

test('getLogLevel should return info by default', () => {
    delete process.env.WUD_LOG_LEVEL;
    expect(configuration.getLogLevel()).toStrictEqual('info');
});

test('getLogLevel should return debug when overridden', () => {
    process.env.WUD_LOG_LEVEL = 'debug';
    expect(configuration.getLogLevel()).toStrictEqual('debug');
});

test('getWatcherConfiguration should return empty object by default', () => {
    delete process.env.WUD_WATCHER_WATCHER1_X;
    delete process.env.WUD_WATCHER_WATCHER1_Y;
    delete process.env.WUD_WATCHER_WATCHER2_X;
    delete process.env.WUD_WATCHER_WATCHER2_Y;
    expect(configuration.getWatcherConfigurations()).toStrictEqual({});
});

test('getWatcherConfiguration should return configured watchers when overridden', () => {
    process.env.WUD_WATCHER_WATCHER1_X = 'x';
    process.env.WUD_WATCHER_WATCHER1_Y = 'y';
    process.env.WUD_WATCHER_WATCHER2_X = 'x';
    process.env.WUD_WATCHER_WATCHER2_Y = 'y';
    expect(configuration.getWatcherConfigurations()).toStrictEqual({
        watcher1: { x: 'x', y: 'y' },
        watcher2: { x: 'x', y: 'y' },
    });
});

test('getTriggerConfigurations should return empty object by default', () => {
    delete process.env.WUD_TRIGGER_TRIGGER1_X;
    delete process.env.WUD_TRIGGER_TRIGGER1_Y;
    delete process.env.WUD_TRIGGER_TRIGGER2_X;
    delete process.env.WUD_TRIGGER_TRIGGER2_Y;
    expect(configuration.getTriggerConfigurations()).toStrictEqual({});
});

test('getTriggerConfigurations should return configured triggers when overridden', () => {
    process.env.WUD_TRIGGER_TRIGGER1_X = 'x';
    process.env.WUD_TRIGGER_TRIGGER1_Y = 'y';
    process.env.WUD_TRIGGER_TRIGGER2_X = 'x';
    process.env.WUD_TRIGGER_TRIGGER2_Y = 'y';
    expect(configuration.getTriggerConfigurations()).toStrictEqual({
        trigger1: { x: 'x', y: 'y' },
        trigger2: { x: 'x', y: 'y' },
    });
});

test('getRegistryConfigurations should return empty object by default', () => {
    delete process.env.WUD_REGISTRY_REGISTRY1_X;
    delete process.env.WUD_REGISTRY_REGISTRY1_Y;
    delete process.env.WUD_REGISTRY_REGISTRY1_X;
    delete process.env.WUD_REGISTRY_REGISTRY1_Y;
    expect(configuration.getRegistryConfigurations()).toStrictEqual({});
});

test('getRegistryConfigurations should return configured registries when overridden', () => {
    process.env.WUD_REGISTRY_REGISTRY1_X = 'x';
    process.env.WUD_REGISTRY_REGISTRY1_Y = 'y';
    process.env.WUD_REGISTRY_REGISTRY2_X = 'x';
    process.env.WUD_REGISTRY_REGISTRY2_Y = 'y';
    expect(configuration.getRegistryConfigurations()).toStrictEqual({
        registry1: { x: 'x', y: 'y' },
        registry2: { x: 'x', y: 'y' },
    });
});

test('getStoreConfiguration should return configured store', () => {
    process.env.WUD_STORE_X = 'x';
    process.env.WUD_STORE_Y = 'y';
    expect(configuration.getStoreConfiguration()).toStrictEqual({ x: 'x', y: 'y' });
});

test('getApiConfiguration should return configured api', () => {
    process.env.WUD_API_X = 'x';
    process.env.WUD_API_Y = 'y';
    expect(configuration.getApiConfiguration()).toStrictEqual({ x: 'x', y: 'y' });
});
