const { ValidationError } = require('joi');
const event = require('../../../event');
const log = require('../../../log');
const prometheusWatcher = require('../../../prometheus/watcher');

jest.mock('../../../event');
jest.mock('../../../log');
const storeContainer = require('../../../store/container');

const Docker = require('./Docker');
const Hub = require('../../../registries/providers/hub/Hub');
const Ecr = require('../../../registries/providers/ecr/Ecr');
const Gcr = require('../../../registries/providers/gcr/Gcr');
const Acr = require('../../../registries/providers/acr/Acr');

const sampleSemver = require('../../samples/semver.json');
const sampleCoercedSemver = require('../../samples/coercedSemver.json');

let docker;
const hub = new Hub();
const ecr = new Ecr();
const gcr = new Gcr();
const acr = new Acr();

jest.mock('request-promise-native');

beforeEach(() => {
    jest.resetAllMocks();
    prometheusWatcher.init();
    docker = new Docker();
    docker.name = 'test';
});

afterEach(() => {
    docker.deregister();
});

Docker.__set__('getRegistries', () => ({
    acr,
    ecr,
    gcr,
    hub,
}));

Docker.__set__('getWatchContainerGauge', () => ({
    set: () => {
    },
}));

const configurationValid = {
    socket: '/var/run/docker.sock',
    port: 2375,
    watchbydefault: true,
    watchall: false,
    cron: '0 * * * *',
};

test('validatedConfiguration should initialize when configuration is valid', () => {
    const validatedConfiguration = docker.validateConfiguration(configurationValid);
    expect(validatedConfiguration).toStrictEqual(configurationValid);
});

test('validatedConfiguration should initialize with default values when not provided', () => {
    const validatedConfiguration = docker.validateConfiguration({});
    expect(validatedConfiguration).toStrictEqual(configurationValid);
});

test('validatedConfiguration should failed when configuration is invalid', () => {
    expect(() => {
        docker.validateConfiguration({ watchbydefault: 'xxx' });
    }).toThrowError(ValidationError);
});

test('initWatcher should create a configured DockerApi instance', () => {
    docker.configuration = docker.validateConfiguration(configurationValid);
    docker.initWatcher();
    expect(docker.dockerApi.modem.socketPath).toBe(configurationValid.socket);
});

test('getSemverTagsCandidate should match when current version is semver and new tag is found', () => {
    expect(Docker.__get__('getSemverTagsCandidate')(sampleSemver, ['7.8.9'])).toEqual(['7.8.9']);
});

test('getSemverTagsCandidate should match when current version is coerced semver and new tag is found', () => {
    expect(Docker.__get__('getSemverTagsCandidate')(sampleCoercedSemver, ['7.8.9'])).toEqual(['7.8.9']);
});

test('getSemverTagsCandidate should not match when current version is semver and no new tag is found', () => {
    expect(Docker.__get__('getSemverTagsCandidate')(sampleSemver, [])).toEqual([]);
});

test('getSemverTagsCandidate should match when newer version match the include regex', () => {
    expect(Docker.__get__('getSemverTagsCandidate')({
        ...sampleSemver,
        includeTags: '^\\d+\\.\\d+\\.\\d+$',
    }, ['7.8.9'])).toEqual(['7.8.9']);
});

test('getSemverTagsCandidate should not match when newer version but doesnt match the include regex', () => {
    expect(Docker.__get__('getSemverTagsCandidate')({
        ...sampleSemver,
        includeTags: '^v\\d+\\.\\d+\\.\\d+$',
    }, ['7.8.9'])).toEqual([]);
});

test('getSemverTagsCandidate should match when newer version doesnt match the exclude regex', () => {
    expect(Docker.__get__('getSemverTagsCandidate')({
        ...sampleSemver,
        excludeTags: '^v\\d+\\.\\d+\\.\\d+$',
    }, ['7.8.9'])).toEqual(['7.8.9']);
});

test('getSemverTagsCandidate should not match when newer version and match the exclude regex', () => {
    expect(Docker.__get__('getSemverTagsCandidate')({
        ...sampleSemver,
        excludeTags: '\\d+\\.\\d+\\.\\d+$',
    }, ['7.8.9'])).toEqual([]);
});

test('getSemverTagsCandidate should return only greater or equal tags than current', () => {
    expect(Docker.__get__('getSemverTagsCandidate')(sampleSemver, ['7.8.9', '4.5.6', '1.2.3'])).toEqual(['7.8.9', '4.5.6']);
});

test('getSemverTagsCandidate should return all greater or equal tags', () => {
    expect(Docker.__get__('getSemverTagsCandidate')(sampleSemver, ['10.11.12', '7.8.9', '4.5.6', '1.2.3'])).toEqual(['10.11.12', '7.8.9', '4.5.6']);
});

test('getSemverTagsCandidate should return greater tags when digit over 9', () => {
    expect(Docker.__get__('getSemverTagsCandidate')({
        image: {
            tag: {
                value: '1.9.0',
                semver: true,
            },
        },
    }, ['1.10.0', '1.2.3'])).toEqual(['1.10.0']);
});

test('normalizeContainer should return hub when applicable', () => {
    expect(Docker.__get__('normalizeContainer')({
        id: '31a61a8305ef1fc9a71fa4f20a68d7ec88b28e32303bbc4a5f192e851165b816',
        name: 'homeassistant',
        watcher: 'local',
        includeTags: '^\\d+\\.\\d+.\\d+$',
        image: {
            id: 'sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6',
            registry: {},
            name: 'test',
            tag: {
                value: '2021.6.4',
                semver: true,
            },
            digest: {
                watch: false,
                repo: 'sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72',
            },
            architecture: 'amd64',
            os: 'linux',
            created: '2021-06-12T05:33:38.440Z',
        },
        result: {
            tag: '2021.6.5',
        },
    }).image).toStrictEqual({
        id: 'sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6',
        registry: {
            name: 'hub',
            url: 'https://registry-1.docker.io/v2',
        },
        name: 'library/test',
        tag: {
            value: '2021.6.4',
            semver: true,
        },
        digest: {
            watch: false,
            repo: 'sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72',
        },
        architecture: 'amd64',
        os: 'linux',
        created: '2021-06-12T05:33:38.440Z',
    });
});

test('normalizeContainer should return ecr when applicable', () => {
    expect(Docker.__get__('normalizeContainer')({
        id: '31a61a8305ef1fc9a71fa4f20a68d7ec88b28e32303bbc4a5f192e851165b816',
        name: 'homeassistant',
        watcher: 'local',
        includeTags: '^\\d+\\.\\d+.\\d+$',
        image: {
            id: 'sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6',
            registry: {
                url: '123456789.dkr.ecr.eu-west-1.amazonaws.com',
            },
            name: 'test',
            tag: {
                value: '2021.6.4',
                semver: true,
            },
            digest: {
                watch: false,
                repo: 'sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72',
            },
            architecture: 'amd64',
            os: 'linux',
            created: '2021-06-12T05:33:38.440Z',
        },
        result: {
            tag: '2021.6.5',
        },
    }).image).toStrictEqual({
        id: 'sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6',
        registry: {
            name: 'ecr',
            url: 'https://123456789.dkr.ecr.eu-west-1.amazonaws.com/v2',
        },
        name: 'test',
        tag: {
            value: '2021.6.4',
            semver: true,
        },
        digest: {
            watch: false,
            repo: 'sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72',
        },
        architecture: 'amd64',
        os: 'linux',
        created: '2021-06-12T05:33:38.440Z',
    });
});

test('normalizeContainer should return gcr when applicable', () => {
    expect(Docker.__get__('normalizeContainer')({
        id: '31a61a8305ef1fc9a71fa4f20a68d7ec88b28e32303bbc4a5f192e851165b816',
        name: 'homeassistant',
        watcher: 'local',
        includeTags: '^\\d+\\.\\d+.\\d+$',
        image: {
            id: 'sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6',
            registry: {
                url: 'us.gcr.io',
            },
            name: 'test',
            tag: {
                value: '2021.6.4',
                semver: true,
            },
            digest: {
                watch: false,
                repo: 'sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72',
            },
            architecture: 'amd64',
            os: 'linux',
            created: '2021-06-12T05:33:38.440Z',
        },
        result: {
            tag: '2021.6.5',
        },
    }).image).toStrictEqual({
        id: 'sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6',
        registry: {
            name: 'gcr',
            url: 'https://us.gcr.io/v2',
        },
        name: 'test',
        tag: {
            value: '2021.6.4',
            semver: true,
        },
        digest: {
            watch: false,
            repo: 'sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72',
        },
        architecture: 'amd64',
        os: 'linux',
        created: '2021-06-12T05:33:38.440Z',
    });
});

test('normalizeContainer should return acr when applicable', () => {
    expect(Docker.__get__('normalizeContainer')({
        id: '31a61a8305ef1fc9a71fa4f20a68d7ec88b28e32303bbc4a5f192e851165b816',
        name: 'homeassistant',
        watcher: 'local',
        includeTags: '^\\d+\\.\\d+.\\d+$',
        image: {
            id: 'sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6',
            registry: {
                url: 'test.azurecr.io',
            },
            name: 'test',
            tag: {
                value: '2021.6.4',
                semver: true,
            },
            digest: {
                watch: false,
                repo: 'sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72',
            },
            architecture: 'amd64',
            os: 'linux',
            created: '2021-06-12T05:33:38.440Z',
        },
        result: {
            tag: '2021.6.5',
        },
    }).image).toStrictEqual({
        id: 'sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6',
        registry: {
            name: 'acr',
            url: 'https://test.azurecr.io/v2',
        },
        name: 'test',
        tag: {
            value: '2021.6.4',
            semver: true,
        },
        digest: {
            watch: false,
            repo: 'sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72',
        },
        architecture: 'amd64',
        os: 'linux',
        created: '2021-06-12T05:33:38.440Z',
    });
});

test('normalizeContainer should return original container when no matching provider found', () => {
    expect(Docker.__get__('normalizeContainer')({
        id: '31a61a8305ef1fc9a71fa4f20a68d7ec88b28e32303bbc4a5f192e851165b816',
        name: 'homeassistant',
        watcher: 'local',
        includeTags: '^\\d+\\.\\d+.\\d+$',
        image: {
            id: 'sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6',
            registry: {
                url: 'xxx',
            },
            name: 'test',
            tag: {
                value: '2021.6.4',
                semver: true,
            },
            digest: {
                watch: false,
                repo: 'sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72',
            },
            architecture: 'amd64',
            os: 'linux',
            created: '2021-06-12T05:33:38.440Z',
        },
        result: {
            tag: '2021.6.5',
        },
    }).image).toEqual({
        id: 'sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6',
        registry: {
            name: 'unknown',
            url: 'xxx',
        },
        name: 'test',
        tag: {
            value: '2021.6.4',
            semver: true,
        },
        digest: {
            watch: false,
            repo: 'sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72',
        },
        architecture: 'amd64',
        os: 'linux',
        created: '2021-06-12T05:33:38.440Z',
    });
});

test('findNewVersion should return new image version when found', async () => {
    hub.getTags = () => (['7.8.9']);
    hub.getImageManifestDigest = () => ({ digest: 'sha256:abcdef', version: 2 });
    await expect(docker.findNewVersion(sampleSemver)).resolves.toMatchObject({
        tag: '7.8.9',
        digest: 'sha256:abcdef',
    });
});

test('findNewVersion should return same result as current when no image version found', async () => {
    hub.getTags = () => ([]);
    hub.getImageManifestDigest = () => ({ digest: 'sha256:abcdef', version: 2 });
    await expect(docker.findNewVersion(sampleSemver)).resolves.toMatchObject({
        tag: '4.5.6',
        digest: 'sha256:abcdef',
    });
});

test('addImageDetailsToContainer should add an image definition to the container', async () => {
    storeContainer.getContainer = () => (undefined);
    docker.dockerApi = {
        getImage: () => ({
            inspect: () => ({
                Id: 'image-123456789',
                Architecture: 'arch',
                Os: 'os',
                Size: '10',
                Created: '2021-06-12T05:33:38.440Z',
                Names: ['test'],
                RepoDigests: ['test/test@sha256:2256fd5ac3e1079566f65cc9b34dc2b8a1b0e0e1bb393d603f39d0e22debb6ba'],
                Config: {
                    Image: 'sha256:c724d57be8bfda30b526396da9f53adb6f6ef15f7886df17b0a0bb8349f1ad79',
                },
            }),
        }),
    };
    const container = {
        Id: 'container-123456789',
        Image: 'organization/image:version',
        Names: ['/test'],
        Labels: {},
    };

    const containerWithImage = await docker.addImageDetailsToContainer(container);
    expect(containerWithImage).toMatchObject({
        id: 'container-123456789',
        name: 'test',
        watcher: 'test',
        image: {
            id: 'image-123456789',
            registry: {},
            name: 'organization/image',
            tag: {
                value: 'version',
                semver: false,
            },
            digest: {
                watch: false,
                repo: 'sha256:2256fd5ac3e1079566f65cc9b34dc2b8a1b0e0e1bb393d603f39d0e22debb6ba',
            },
            architecture: 'arch',
            os: 'os',
            created: '2021-06-12T05:33:38.440Z',
        },
        result: {
            tag: 'version',
        },
    });
});

test('watchContainer should return new image version when found', () => {
    docker.configuration = {};
    hub.getTags = () => (['7.8.9']);
    expect(docker.watchContainer(sampleSemver)).resolves.toMatchObject({
        result: {
            tag: '7.8.9',
        },
    });
});

test('watchContainer should return same result as current when no image version found', async () => {
    docker.configuration = {};
    hub.getTags = () => ([]);
    hub.getImageManifestDigest = () => ({ digest: 'sha256:abcdef', version: 2 });
    await expect(docker.watchContainer(sampleSemver)).resolves.toMatchObject({
        result: {
            tag: '4.5.6',
            digest: 'sha256:abcdef',
        },
    });
});

test('watchContainer should return error result when something bad happens', async () => {
    docker.findNewVersion = () => { throw new Error('Failure!!!'); };
    await expect(docker.watchContainer(sampleSemver)).resolves.toMatchObject({
        error: {
            message: 'Failure!!!',
        },
    });
});

test('watch should return a list of containers found by the docker socket', async () => {
    storeContainer.getContainer = () => (undefined);
    const container1 = {
        Id: 'container-123456789',
        Image: 'organization/image:version',
        Names: ['/test'],
        Architecture: 'arch',
        Os: 'os',
        Size: '10',
        Created: '2019-05-20T12:02:06.307Z',
        Labels: {},
        RepoDigests: ['test/test@sha256:2256fd5ac3e1079566f65cc9b34dc2b8a1b0e0e1bb393d603f39d0e22debb6ba'],
        Config: {
            Image: 'sha256:c724d57be8bfda30b526396da9f53adb6f6ef15f7886df17b0a0bb8349f1ad79',
        },
    };
    docker.dockerApi = {
        listContainers: () => ([container1]),
        getImage: () => ({
            inspect: () => ({
                Architecture: 'arch',
                Os: 'os',
                Created: '2021-06-12T05:33:38.440Z',
                Id: 'image-123456789',
            }),
        }),
    };

    // Fake conf
    docker.configuration = {
        watchbydefault: true,
    };

    await expect(docker.watch()).resolves.toMatchObject([{
        id: 'container-123456789',
        name: 'test',
        watcher: 'test',
        image: {
            id: 'image-123456789',
            registry: {},
            name: 'organization/image',
            tag: {
                value: 'version',
                semver: false,
            },
            digest: {
                watch: false,
                repo: undefined,
            },
            architecture: 'arch',
            os: 'os',
            created: '2021-06-12T05:33:38.440Z',
        },
        result: {
            tag: 'version',
        },
    }]);
});

test('watch should log error when watching a container fails', async () => {
    storeContainer.getContainer = () => undefined;
    const container1 = {
        Id: 'container-123456789',
        Image: 'organization/image:version',
        Names: ['/test'],
        Architecture: 'arch',
        Os: 'os',
        Size: '10',
        Created: '2019-05-20T12:02:06.307Z',
        Labels: {},
        RepoDigests: ['test/test@sha256:2256fd5ac3e1079566f65cc9b34dc2b8a1b0e0e1bb393d603f39d0e22debb6ba'],
        Config: {
            Image: 'sha256:c724d57be8bfda30b526396da9f53adb6f6ef15f7886df17b0a0bb8349f1ad79',
        },
    };
    docker.dockerApi = {
        listContainers: () => ([container1]),
        getImage: () => ({
            inspect: () => ({
                Architecture: 'arch',
                Os: 'os',
                Created: '2021-06-12T05:33:38.440Z',
                Id: 'image-123456789',
            }),
        }),
    };

    // Fake conf
    docker.configuration = {
        watchbydefault: true,
    };
    const spylog = jest.spyOn(log, 'warn');
    docker.watchContainer = () => { throw new Error('Failure!!!'); };
    expect(await docker.watch()).toEqual([]);
    expect(spylog).toHaveBeenCalledWith('Error when processing images (Failure!!!)');
});

test('watch should log error when an error occurs when listing containers fails', async () => {
    docker.getContainers = () => { throw new Error('Failure!!!'); };
    const spylog = jest.spyOn(log, 'warn');
    expect(await docker.watch()).toEqual([]);
    expect(spylog).toHaveBeenCalledWith('Error when trying to get the containers list to watch (Failure!!!)');
});

test('pruneOldContainers should prune old containers', () => {
    const oldContainers = [{ id: 1 }, { id: 2 }];
    const newContainers = [{ id: 1 }];
    expect(Docker.__get__('getOldContainers')(newContainers, oldContainers)).toEqual([{ id: 2 }]);
});

test('pruneOldContainers should operate when lists are empty or undefined', () => {
    expect(Docker.__get__('getOldContainers')([], [])).toEqual([]);
    expect(Docker.__get__('getOldContainers')(undefined, undefined)).toEqual([]);
});

test('getRegistries should return all registered registries when called', () => {
    expect(Object.keys(Docker.__get__('getRegistries')())).toEqual(['acr', 'ecr', 'gcr', 'hub']);
});

test('getRegistry should return all registered registries when called', () => {
    expect(Docker.__get__('getRegistry')('acr')).toBeDefined();
});

test('getRegistry should return all registered registries when called', () => {
    expect(() => Docker.__get__('getRegistry')('registry_fail')).toThrowError('Unsupported Registry registry_fail');
});

test('processContainerResult should emit event when update available and not already triggered', () => {
    const processContainerResult = Docker.__get__('processContainerResult');
    const containerWithResult = {
        id: 'container-123456789',
        updateAvailable: true,
    };

    storeContainer.getContainer = () => (undefined);
    storeContainer.insertContainer = () => (containerWithResult);
    const spyEvent = jest.spyOn(event, 'emitContainerNewVersion');
    processContainerResult(containerWithResult);
    expect(spyEvent).toHaveBeenCalled();
});

test('processContainerResult should not emit event when no update available', () => {
    const processContainerResult = Docker.__get__('processContainerResult');
    const containerWithResult = {
        id: 'container-123456789',
        updateAvailable: false,
    };

    storeContainer.getContainer = () => (undefined);
    storeContainer.insertContainer = () => (containerWithResult);
    const spyEvent = jest.spyOn(event, 'emitContainerNewVersion');
    processContainerResult(containerWithResult);
    expect(spyEvent).not.toHaveBeenCalled();
});

test('processContainerResult should not emit event when update available but already processed', () => {
    const processContainerResult = Docker.__get__('processContainerResult');
    const containerWithResult = {
        id: 'container-123456789',
        updateAvailable: true,
        resultChanged: () => false,
    };

    storeContainer.getContainer = () => (containerWithResult);
    storeContainer.updateContainer = () => (containerWithResult);
    const spyEvent = jest.spyOn(event, 'emitContainerNewVersion');
    processContainerResult(containerWithResult);
    expect(spyEvent).not.toHaveBeenCalled();
});

test('processContainerResult should emit event when update available but not already processed', () => {
    const processContainerResult = Docker.__get__('processContainerResult');
    const containerWithResult = {
        id: 'container-123456789',
        updateAvailable: true,
        resultChanged: () => true,
    };

    storeContainer.getContainer = () => (containerWithResult);
    storeContainer.updateContainer = () => (containerWithResult);
    const spyEvent = jest.spyOn(event, 'emitContainerNewVersion');
    processContainerResult(containerWithResult);
    expect(spyEvent).toHaveBeenCalled();
});

test('isContainerToWatch should return true when watch by default is true and no wud.watch label', () => {
    const isContainerToWatch = Docker.__get__('isContainerToWatch');
    expect(isContainerToWatch(undefined, true)).toBeTruthy();
});

test('isContainerToWatch should return true when watch by default is true and wud.watch label is empty string', () => {
    const isContainerToWatch = Docker.__get__('isContainerToWatch');
    expect(isContainerToWatch('', true)).toBeTruthy();
});

test('isContainerToWatch should return true when watch by default is true and wud.watch label is true', () => {
    const isContainerToWatch = Docker.__get__('isContainerToWatch');
    expect(isContainerToWatch('true', true)).toBeTruthy();
});

test('isContainerToWatch should return false when watch by default is true and wud.watch label is false', () => {
    const isContainerToWatch = Docker.__get__('isContainerToWatch');
    expect(isContainerToWatch('false', true)).toBeFalsy();
});

test('isContainerToWatch should return false when watch by default is false and no wud.watch label', () => {
    const isContainerToWatch = Docker.__get__('isContainerToWatch');
    expect(isContainerToWatch(undefined, false)).toBeFalsy();
});

test('isContainerToWatch should return false when watch by default is false and wud.watch label is empty string', () => {
    const isContainerToWatch = Docker.__get__('isContainerToWatch');
    expect(isContainerToWatch('', false)).toBeFalsy();
});

test('isContainerToWatch should return true when watch by default is false and wud.watch label is true', () => {
    const isContainerToWatch = Docker.__get__('isContainerToWatch');
    expect(isContainerToWatch('true', false)).toBeTruthy();
});

test('isContainerToWatch should return false when watch by default is false and wud.watch label is false', () => {
    const isContainerToWatch = Docker.__get__('isContainerToWatch');
    expect(isContainerToWatch('false', false)).toBeFalsy();
});
