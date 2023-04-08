const configuration = require('./index');

test('getVersion should return wud version', () => {
    configuration.wudEnvVars.WUD_VERSION = 'x.y.z';
    expect(configuration.getVersion()).toStrictEqual('x.y.z');
});

test('getLogLevel should return info by default', () => {
    delete configuration.wudEnvVars.WUD_LOG_LEVEL;
    expect(configuration.getLogLevel()).toStrictEqual('info');
});

test('getLogLevel should return debug when overridden', () => {
    configuration.wudEnvVars.WUD_LOG_LEVEL = 'debug';
    expect(configuration.getLogLevel()).toStrictEqual('debug');
});

test('getControllerConfiguration should return empty object by default', () => {
    delete configuration.wudEnvVars.WUD_CONTROLLER_CONTROLLER1_X;
    delete configuration.wudEnvVars.WUD_CONTROLLER_CONTROLLER1_Y;
    delete configuration.wudEnvVars.WUD_CONTROLLER_CONTROLLER2_X;
    delete configuration.wudEnvVars.WUD_CONTROLLER_CONTROLLER2_Y;
    expect(configuration.getControllerConfigurations()).toStrictEqual({});
});

test('getControllerConfiguration should return configured controllers when overridden', () => {
    configuration.wudEnvVars.WUD_CONTROLLER_CONTROLLER1_X = 'x';
    configuration.wudEnvVars.WUD_CONTROLLER_CONTROLLER1_Y = 'y';
    configuration.wudEnvVars.WUD_CONTROLLER_CONTROLLER2_X = 'x';
    configuration.wudEnvVars.WUD_CONTROLLER_CONTROLLER2_Y = 'y';
    expect(configuration.getControllerConfigurations()).toStrictEqual({
        controller1: { x: 'x', y: 'y' },
        controller2: { x: 'x', y: 'y' },
    });
});

test('getTriggerConfigurations should return empty object by default', () => {
    delete configuration.wudEnvVars.WUD_TRIGGER_TRIGGER1_X;
    delete configuration.wudEnvVars.WUD_TRIGGER_TRIGGER1_Y;
    delete configuration.wudEnvVars.WUD_TRIGGER_TRIGGER2_X;
    delete configuration.wudEnvVars.WUD_TRIGGER_TRIGGER2_Y;
    expect(configuration.getTriggerConfigurations()).toStrictEqual({});
});

test('getTriggerConfigurations should return configured triggers when overridden', () => {
    configuration.wudEnvVars.WUD_TRIGGER_TRIGGER1_X = 'x';
    configuration.wudEnvVars.WUD_TRIGGER_TRIGGER1_Y = 'y';
    configuration.wudEnvVars.WUD_TRIGGER_TRIGGER2_X = 'x';
    configuration.wudEnvVars.WUD_TRIGGER_TRIGGER2_Y = 'y';
    expect(configuration.getTriggerConfigurations()).toStrictEqual({
        trigger1: { x: 'x', y: 'y' },
        trigger2: { x: 'x', y: 'y' },
    });
});

test('getRegistryConfigurations should return empty object by default', () => {
    delete configuration.wudEnvVars.WUD_REGISTRY_REGISTRY1_X;
    delete configuration.wudEnvVars.WUD_REGISTRY_REGISTRY1_Y;
    delete configuration.wudEnvVars.WUD_REGISTRY_REGISTRY1_X;
    delete configuration.wudEnvVars.WUD_REGISTRY_REGISTRY1_Y;
    expect(configuration.getRegistryConfigurations()).toStrictEqual({});
});

test('getRegistryConfigurations should return configured registries when overridden', () => {
    configuration.wudEnvVars.WUD_REGISTRY_REGISTRY1_X = 'x';
    configuration.wudEnvVars.WUD_REGISTRY_REGISTRY1_Y = 'y';
    configuration.wudEnvVars.WUD_REGISTRY_REGISTRY2_X = 'x';
    configuration.wudEnvVars.WUD_REGISTRY_REGISTRY2_Y = 'y';
    expect(configuration.getRegistryConfigurations()).toStrictEqual({
        registry1: { x: 'x', y: 'y' },
        registry2: { x: 'x', y: 'y' },
    });
});

test('getStoreConfiguration should return configured store', () => {
    configuration.wudEnvVars.WUD_STORE_X = 'x';
    configuration.wudEnvVars.WUD_STORE_Y = 'y';
    expect(configuration.getStoreConfiguration()).toStrictEqual({ x: 'x', y: 'y' });
});

test('getServerConfiguration should return configured api (deprecated vars)', () => {
    configuration.wudEnvVars.WUD_API_X = 'x';
    configuration.wudEnvVars.WUD_API_Y = 'y';
    expect(configuration.getServerConfiguration()).toStrictEqual({ x: 'x', y: 'y' });
});

test('getServerConfiguration should return configured api (new vars)', () => {
    configuration.wudEnvVars.WUD_API_W = 'w';
    configuration.wudEnvVars.WUD_API_X = 'x';
    configuration.wudEnvVars.WUD_API_Y = 'y';
    configuration.wudEnvVars.WUD_SERVER_X = 'x2';
    configuration.wudEnvVars.WUD_SERVER_Y = 'y2';
    expect(configuration.getServerConfiguration()).toStrictEqual({ w: 'w', x: 'x2', y: 'y2' });
});

test('replaceSecrets must read secret in file', () => {
    const vars = {
        WUD_API_X__FILE: `${__dirname}/secret.txt`,
    };
    configuration.replaceSecrets(vars);
    expect(vars).toStrictEqual({
        WUD_API_X: 'super_secret',
    });
});
