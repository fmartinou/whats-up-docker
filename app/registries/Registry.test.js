const Registry = require('./Registry');

test('base64Encode should decode credentials', () => {
    expect(Registry.base64Encode('username', 'password')).toEqual('dXNlcm5hbWU6cGFzc3dvcmQ=');
});
