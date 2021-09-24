const semver = require('./index');

const parseTestCases = [{
    raw: '1.2.3',
    parsed: {
        major: 1, minor: 2, patch: 3, prerelease: [],
    },
}, {
    raw: 'v1.2.3',
    parsed: {
        major: 1, minor: 2, patch: 3, prerelease: [],
    },
}, {
    raw: 'v1.2.3-alpha1',
    parsed: {
        major: 1, minor: 2, patch: 3, prerelease: ['alpha1'],
    },
}, {
    raw: 'version-zobi-1.2.3-alpha1',
    parsed: {
        major: 1, minor: 2, patch: 3, prerelease: [],
    },
}, {
    raw: 'latest',
    parsed: null,
}];

test.each(parseTestCases)(
    'parse $raw should return $parsed',
    (item) => {
        expect(semver.parse(item.raw)).toEqual(expect.objectContaining(item.parsed));
    },
);

const isGreaterTestCases = [{
    version1: '1.2.3',
    version2: '1.2.3',
    greater: true,
}, {
    version1: '4.5.6',
    version2: '1.2.3',
    greater: true,
}, {
    version1: '1.2.3',
    version2: '4.5.6',
    greater: false,
}, {
    version1: '1.2.3-alpha1',
    version2: '1.2.3',
    greater: false,
}, {
    version1: '1.2.3-beta1',
    version2: '1.2.3-alpha1',
    greater: true,
}, {
    version1: '4.5.6-alpha1',
    version2: '1.2.3-alpha1',
    greater: true,
}, {
    version1: 'latest',
    version2: '1.2.3',
    greater: false,
}, {
    version1: '1.2.3',
    version2: 'latest',
    greater: false,
}];

test.each(isGreaterTestCases)(
    '$version1 isGreater $version2 should return $greater',
    (item) => {
        expect(semver.isGreater(item.version1, item.version2)).toEqual(item.greater);
    },
);

const diffTestCases = [{
    version1: '1.2.3',
    version2: '4.5.6',
    diff: 'major',
}, {
    version1: '1.2.3',
    version2: '1.2.3',
    diff: null,
}, {
    version1: '1.2.3',
    version2: '1.3.3',
    diff: 'minor',
}, {
    version1: '1.2.3',
    version2: '1.2.4',
    diff: 'patch',
}, {
    version1: '1.2.3',
    version2: '1.2.3-alpha1',
    diff: 'prerelease',
}, {
    version1: '1.2.3',
    version2: 'latest',
    diff: null,
}, {
    version1: 'latest',
    version2: '1.2.3',
    diff: null,
}];

test.each(diffTestCases)(
    'diff $version1 $version2 should return $result',
    (item) => {
        expect(semver.diff(item.version1, item.version2)).toEqual(item.diff);
    },
);
