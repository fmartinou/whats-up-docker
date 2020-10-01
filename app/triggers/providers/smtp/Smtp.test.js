const { ValidationError } = require('joi');
const Smtp = require('./Smtp');

const smtp = new Smtp();

const configurationValid = {
    host: 'smtp.gmail.com',
    port: '465',
    user: 'user',
    pass: 'pass',
    from: 'from@xx.com',
    to: 'to@xx.com',
};

test('validateConfiguration should return validated configuration when valid', () => {
    const validatedConfiguration = smtp.validateConfiguration(configurationValid);
    expect(validatedConfiguration).toStrictEqual({
        ...configurationValid,
        port: 465,
    });
});

test('validateConfiguration should throw error when invalid', () => {
    const configuration = {
        host: 'smtp.gmail..com',
        port: 'xyz',
        from: 'from@@xx.com',
        to: 'to@@xx.com',
    };
    expect(() => {
        smtp.validateConfiguration(configuration);
    }).toThrowError(ValidationError);
});

test('init should create a mailer transporter with expected configuration when called', () => {
    smtp.configuration = configurationValid;
    smtp.init();
    expect(smtp.transporter.options).toEqual(expect.objectContaining({
        host: configurationValid.host,
        port: configurationValid.port,
        auth: {
            user: configurationValid.user,
            pass: configurationValid.pass,
        },
    }));
});

test('maskConfiguration should mask sensitive data', () => {
    smtp.configuration = {
        host: configurationValid.host,
        port: configurationValid.port,
        user: configurationValid.user,
        pass: configurationValid.pass,
    };
    expect(smtp.maskConfiguration()).toEqual({
        host: configurationValid.host,
        port: configurationValid.port,
        user: configurationValid.user,
        pass: 'p**s',
    });
});
