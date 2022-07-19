const container = require('./container');

test('model should be validated when compliant', () => {
    const containerValidated = container.validate({
        id: 'container-123456789',
        name: 'test',
        watcher: 'test',
        // eslint-disable-next-line no-template-curly-in-string
        linkTemplate: 'https://release-${major}.${minor}.${patch}.acme.com',
        image: {
            id: 'image-123456789',
            registry: {
                name: 'hub',
                url: 'https://hub',
            },
            name: 'organization/image',
            tag: {
                value: '1.0.0',
                semver: true,
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
            tag: '2.0.0',
        },
    });

    expect(containerValidated.resultChanged.name).toEqual('resultChangedFunction');
    delete containerValidated.resultChanged;

    expect(containerValidated).toStrictEqual({
        id: 'container-123456789',
        status: 'unknown',
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
                semver: true,
                value: '1.0.0',
            },
        },
        name: 'test',
        displayName: 'test',
        displayIcon: 'mdi:docker',
        // eslint-disable-next-line no-template-curly-in-string
        linkTemplate: 'https://release-${major}.${minor}.${patch}.acme.com',
        link: 'https://release-1.0.0.acme.com',
        updateAvailable: true,
        updateKind: {
            kind: 'tag',
            localValue: '1.0.0',
            remoteValue: '2.0.0',
            semverDiff: 'major',
        },
        result: {
            link: 'https://release-2.0.0.acme.com',
            tag: '2.0.0',
        },
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

test('flatten should be flatten the nested properties with underscores when called', () => {
    const containerValidated = container.validate({
        id: 'container-123456789',
        name: 'test',
        watcher: 'test',
        // eslint-disable-next-line no-template-curly-in-string
        linkTemplate: 'https://release-${major}.${minor}.${patch}.acme.com',
        image: {
            id: 'image-123456789',
            registry: {
                name: 'hub',
                url: 'https://hub',
            },
            name: 'organization/image',
            tag: {
                value: '1.0.0',
                semver: true,
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
            tag: '2.0.0',
        },
    });

    expect(container.flatten(containerValidated)).toEqual({
        id: 'container-123456789',
        status: 'unknown',
        image_architecture: 'arch',
        image_created: '2021-06-12T05:33:38.440Z',
        image_digest_watch: false,
        image_id: 'image-123456789',
        image_name: 'organization/image',
        image_os: 'os',
        image_registry_name: 'hub',
        image_registry_url: 'https://hub',
        image_tag_semver: true,
        image_tag_value: '1.0.0',
        link: 'https://release-1.0.0.acme.com',
        // eslint-disable-next-line no-template-curly-in-string
        link_template: 'https://release-${major}.${minor}.${patch}.acme.com',
        name: 'test',
        display_name: 'test',
        display_icon: 'mdi:docker',
        result_link: 'https://release-2.0.0.acme.com',
        result_tag: '2.0.0',
        update_available: true,
        update_kind_kind: 'tag',
        update_kind_local_value: '1.0.0',
        update_kind_remote_value: '2.0.0',
        update_kind_semver_diff: 'major',
        watcher: 'test',
    });
});

test('fullName should build an id with watcher name & container name when called', () => {
    expect(container.fullName({
        watcher: 'watcher',
        name: 'container_name',
    })).toEqual('watcher_container_name');
});

test('getLink should render link templates when called', () => {
    const getLink = container.__get__('getLink');
    expect(getLink(
        // eslint-disable-next-line no-template-curly-in-string
        'https://test-${major}.${minor}.${patch}.acme.com',
        '10.5.2',
        true,
    )).toEqual('https://test-10.5.2.acme.com');
});

test('getLink should render undefined when template is missing', () => {
    const getLink = container.__get__('getLink');
    expect(getLink(undefined)).toBeUndefined();
});

test('addUpdateKindProperty should detect major update', () => {
    const addUpdateKindProperty = container.__get__('addUpdateKindProperty');
    const containerObject = {
        updateAvailable: true,
        image: {
            tag: {
                value: '1.0.0',
                semver: true,
            },
        },
        result: {
            tag: '2.0.0',
        },
    };
    addUpdateKindProperty(containerObject);
    expect(containerObject.updateKind).toEqual({
        kind: 'tag',
        localValue: '1.0.0',
        remoteValue: '2.0.0',
        semverDiff: 'major',
    });
});

test('addUpdateKindProperty should detect minor update', () => {
    const addUpdateKindProperty = container.__get__('addUpdateKindProperty');
    const containerObject = {
        updateAvailable: true,
        image: {
            tag: {
                value: '1.0.0',
                semver: true,
            },
        },
        result: {
            tag: '1.1.0',
        },
    };
    addUpdateKindProperty(containerObject);
    expect(containerObject.updateKind).toEqual({
        kind: 'tag',
        localValue: '1.0.0',
        remoteValue: '1.1.0',
        semverDiff: 'minor',
    });
});

test('addUpdateKindProperty should detect patch update', () => {
    const addUpdateKindProperty = container.__get__('addUpdateKindProperty');
    const containerObject = {
        updateAvailable: true,
        image: {
            tag: {
                value: '1.0.0',
                semver: true,
            },
        },
        result: {
            tag: '1.0.1',
        },
    };
    addUpdateKindProperty(containerObject);
    expect(containerObject.updateKind).toEqual({
        kind: 'tag',
        localValue: '1.0.0',
        remoteValue: '1.0.1',
        semverDiff: 'patch',
    });
});

test('addUpdateKindProperty should support transforms', () => {
    const addUpdateKindProperty = container.__get__('addUpdateKindProperty');
    const containerObject = {
        transformTags: '^(\\d+\\.\\d+)-.*-(\\d+) => $1.$2',
        updateAvailable: true,
        image: {
            tag: {
                value: '1.2-foo-3',
                semver: true,
            },
        },
        result: {
            tag: '1.2-bar-4',
        },
    };
    addUpdateKindProperty(containerObject);
    expect(containerObject.updateKind).toEqual({
        kind: 'tag',
        localValue: '1.2-foo-3',
        remoteValue: '1.2-bar-4',
        semverDiff: 'patch',
    });
});

test('addUpdateKindProperty should detect prerelease semver update', () => {
    const addUpdateKindProperty = container.__get__('addUpdateKindProperty');
    const containerObject = {
        updateAvailable: true,
        image: {
            tag: {
                value: '1.0.0-test1',
                semver: true,
            },
        },
        result: {
            tag: '1.0.0-test2',
        },
    };
    addUpdateKindProperty(containerObject);
    expect(containerObject.updateKind).toEqual({
        kind: 'tag',
        localValue: '1.0.0-test1',
        remoteValue: '1.0.0-test2',
        semverDiff: 'prerelease',
    });
});

test('addUpdateKindProperty should detect digest update', () => {
    const addUpdateKindProperty = container.__get__('addUpdateKindProperty');
    const containerObject = {
        updateAvailable: true,
        image: {
            tag: {
                value: 'latest',
                semver: false,
            },
            digest: {
                value: 'sha256:123465789',
            },
        },
        result: {
            tag: 'latest',
            digest: 'sha256:987654321',
        },
    };
    addUpdateKindProperty(containerObject);
    expect(containerObject.updateKind).toEqual({
        kind: 'digest',
        localValue: 'sha256:123465789',
        remoteValue: 'sha256:987654321',
    });
});

test('addUpdateKindProperty should return unknown when no image or result', () => {
    const addUpdateKindProperty = container.__get__('addUpdateKindProperty');
    const containerObject = {};
    addUpdateKindProperty(containerObject);
    expect(containerObject.updateKind).toEqual({
        kind: 'unknown',
    });
});

test('addUpdateKindProperty should return unknown when no update available', () => {
    const addUpdateKindProperty = container.__get__('addUpdateKindProperty');
    const containerObject = {
        image: 'image',
        result: {},
        updateAvailable: false,
    };
    addUpdateKindProperty(containerObject);
    expect(containerObject.updateKind).toEqual({
        kind: 'unknown',
    });
});
