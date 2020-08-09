const { ValidationError } = require('@hapi/joi');
const rp = require('request-promise-native');

const Docker = require('./Docker');

const sampleSemver = require('./samples/semver.json');
const sampleCoercedSemver = require('./samples/coercedSemver.json');
const sampleNotSemver = require('./samples/notSemver.json');

jest.mock('request-promise-native');

const docker = new Docker();

const configurationValid = {
    socket: '/var/run/docker.sock',
    port: 2375,
    watchbydefault: true,
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

test('isNewerTag should return true when current version is semver and new tag is found', () => {
    expect(Docker.__get__('isNewerTag')(sampleSemver, {
        name: '7.8.9',
        last_updated: '2019-05-25T12:02:06.307Z',
        images: [{
            architecture: 'arch',
            os: 'os',
            size: 10,
        }],
    })).toBeTruthy();
});

test('isNewerTag should return true when current version is coerced semver and new tag is found', () => {
    expect(Docker.__get__('isNewerTag')(sampleCoercedSemver, {
        name: '7.8.9',
        last_updated: '2019-05-25T12:02:06.307Z',
        images: [{
            architecture: 'arch',
            os: 'os',
            size: 10,
        }],
    })).toBeTruthy();
});

test('isNewerTag should return false when current version is semver and no new tag is found', () => {
    expect(Docker.__get__('isNewerTag')(sampleSemver, {
        name: '7.8.9',
        last_updated: '2019-05-25T12:02:06.307Z',
        images: [{
            architecture: 'arch_not_match',
            os: 'os_not_match',
            size: 10,
        }],
    })).toBeFalsy();
});

test('isNewerTag should return false when arch/os dont match', () => {
    expect(Docker.__get__('isNewerTag')(sampleSemver, {
        name: '1.2.3',
        last_updated: '2019-05-25T12:02:06.307Z',
        images: [{
            architecture: 'arch',
            os: 'os',
            size: 10,
        }],
    })).toBeFalsy();
});

test('isNewerTag should return true when current version is not semver but newer version date exists', () => {
    expect(Docker.__get__('isNewerTag')(sampleNotSemver, {
        name: 'notasemver',
        last_updated: '2019-05-25T12:02:06.307Z',
        images: [{
            architecture: 'arch',
            os: 'os',
            size: 10,
        }],
    })).toBeTruthy();
});

test('isNewerTag should return false when current version is not semver and no new version date exists', () => {
    expect(Docker.__get__('isNewerTag')(sampleNotSemver, {
        name: 'notasemver',
        last_updated: '2019-05-15T12:02:06.307Z',
        images: [{
            architecture: 'arch',
            os: 'os',
            size: 10,
        }],
    })).toBeFalsy();
});

test('findNewVersion should return new image when found', () => {
    const foundVersion = {
        name: '7.8.9',
        last_updated: '2019-05-25T12:02:06.307Z',
        images: [{
            architecture: 'arch',
            os: 'os',
            size: 10,
        }],
    };
    rp.mockImplementation(() => ({
        results: [foundVersion],
    }));
    expect(docker.findNewVersion(sampleSemver)).resolves.toMatchObject({
        newVersion: foundVersion.name,
        newVersionDate: foundVersion.last_updated,
    });
});

test('findNewVersion should return undefined when no image found', () => {
    rp.mockImplementation(() => ({
        results: [],
    }));
    expect(docker.findNewVersion(sampleSemver)).resolves.toStrictEqual(undefined);
});

test('mapContainerToImage should map a container definition to an image definition', async () => {
    docker.dockerApi = {
        image: {
            get: () => ({
                status: () => ({
                    data: {
                        Architecture: 'arch',
                        Os: 'os',
                        Size: '10',
                        Created: '2019-05-20T12:02:06.307Z',
                    },
                }),
            }),
        },
    };
    const container = {
        data: {
            Image: 'registry/organization/image:version',
        },
    };

    const image = await docker.mapContainerToImage(container);
    expect(image).toMatchObject({
        registry: 'registry',
        organization: 'organization',
        image: 'image',
        version: 'version',
        versionDate: '2019-05-20T12:02:06.307Z',
        architecture: 'arch',
        os: 'os',
        size: '10',
        includeTags: undefined,
        excludeTags: undefined,
    });
});
