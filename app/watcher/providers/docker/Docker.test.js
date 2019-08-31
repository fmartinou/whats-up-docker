const { ValidationError } = require('@hapi/joi');
const Docker = require('./Docker');

const docker = new Docker();

const configurationValid = {
    socket: '/var/run/docker.sock',
    port: 2375,
    watchbydefault: true,
    cron: '0 * * * *',
};

test('Docker should initialize when configuration is valid', () => {
    const validatedConfiguration = docker.validateConfiguration(configurationValid);
    expect(validatedConfiguration).toStrictEqual(configurationValid);
});

test('Docker should initialize with default values when not provided', () => {
    const validatedConfiguration = docker.validateConfiguration({});
    expect(validatedConfiguration).toStrictEqual(configurationValid);
});

test('Docker should failed when configuration is invalid', () => {
    expect(() => {
        /* eslint-disable-next-line */
        docker.validateConfiguration({ watchbydefault: 'xxx'})
    }).toThrowError(ValidationError);
});
