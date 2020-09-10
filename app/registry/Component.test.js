const Component = require('./Component');

test('mask should mask with * when called with defaults', () => {
    expect(Component.mask('abcdefgh')).toStrictEqual('a******h');
});

test('mask should mask with § when called with § masking char', () => {
    expect(Component.mask('abcdefgh', 1, '§')).toStrictEqual('a§§§§§§h');
});

test('mask should mask with § and keep 3 chars when called with § masking char and a number of 3', () => {
    expect(Component.mask('abcdefgh', 3, '§')).toStrictEqual('abc§§fgh');
});

test('mask should return undefined when value is undefined', () => {
    expect(Component.mask(undefined)).toStrictEqual(undefined);
});

test('mask should not fail when mask is longer than original string', () => {
    expect(Component.mask('abc', 5)).toStrictEqual('***');
});
