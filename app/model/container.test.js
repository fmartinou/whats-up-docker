const container = require('./container');

test('model should be validated when compliant', () => {
    const containerValidated = container.validate({
        id: 'container-123456789',
        name: 'test',
        watcher: 'test',
        image: {
            id: 'image-123456789',
            registry: {
                name: 'hub',
                url: 'https://hub',
            },
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
    });

    expect(containerValidated.resultChanged.name).toEqual('resultChangedFunction');
    delete containerValidated.resultChanged;

    expect(containerValidated).toStrictEqual({
        id: 'container-123456789',
        image: {
            architecture: 'arch',
            created: '2021-06-12T05:33:38.440Z',
            digest: {
                watch: false,
                repo: undefined,
            },
            id: 'image-123456789',
            name: 'organization/image',
            os: 'os',
            registry: {
                name: 'hub',
                url: 'https://hub',
            },
            tag: {
                semver: false,
                value: 'version',
            },
        },
        name: 'test',
        updateAvailable: false,
        watcher: 'test',
    });
});

test('model should not be validated when invalid', () => {
    expect((() => {
        container.validate({});
    })).toThrow();
});

test('model should flag updateAvailable when tag is different', () => {
    const containerValidated = container.validate({
        id: 'container-123456789',
        name: 'test',
        watcher: 'test',
        image: {
            id: 'image-123456789',
            registry: {
                name: 'hub',
                url: 'https://hub',
            },
            name: 'organization/image',
            tag: {
                value: 'x',
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
            tag: 'y',
        },
    });
    expect(containerValidated.updateAvailable).toBeTruthy();
});

test('model should not flag updateAvailable when tag is equal', () => {
    const containerValidated = container.validate({
        id: 'container-123456789',
        name: 'test',
        watcher: 'test',
        image: {
            id: 'image-123456789',
            registry: {
                name: 'hub',
                url: 'https://hub',
            },
            name: 'organization/image',
            tag: {
                value: 'x',
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
            tag: 'x',
        },
    });
    expect(containerValidated.updateAvailable).toBeFalsy();
});

test('model should flag updateAvailable when digest is different', () => {
    const containerValidated = container.validate({
        id: 'container-123456789',
        name: 'test',
        watcher: 'test',
        image: {
            id: 'image-123456789',
            registry: {
                name: 'hub',
                url: 'https://hub',
            },
            name: 'organization/image',
            tag: {
                value: 'x',
                semver: false,
            },
            digest: {
                watch: true,
                repo: 'x',
                value: 'x',
            },
            architecture: 'arch',
            os: 'os',
            created: '2021-06-12T05:33:38.440Z',
        },
        result: {
            tag: 'x',
            digest: 'y',
        },
    });
    expect(containerValidated.updateAvailable).toBeTruthy();
});

test('model should flag updateAvailable when created is different', () => {
    const containerValidated = container.validate({
        id: 'container-123456789',
        name: 'test',
        watcher: 'test',
        image: {
            id: 'image-123456789',
            registry: {
                name: 'hub',
                url: 'https://hub',
            },
            name: 'organization/image',
            tag: {
                value: 'x',
                semver: false,
            },
            digest: {
                watch: true,
                repo: 'x',
            },
            architecture: 'arch',
            os: 'os',
            created: '2021-06-12T05:33:38.440Z',
        },
        result: {
            tag: 'x',
            created: '2021-06-15T05:33:38.440Z',
        },
    });
    const containerEquals = container.validate({
        ...containerValidated,
    });
    const containerDifferent = container.validate({
        ...containerValidated,
    });
    containerDifferent.result.tag = 'y';
    expect(containerValidated.resultChanged(containerEquals)).toBeFalsy();
    expect(containerValidated.resultChanged(containerDifferent)).toBeTruthy();
});
