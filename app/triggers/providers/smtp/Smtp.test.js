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
    threshold: 'all',
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

test('notify should format html mail as expected', async () => {
    smtp.configuration = {
        from: 'from',
        to: 'to',
    };
    smtp.transporter = {
        sendMail: (conf) => (conf),
    };
    const response = await smtp.notify({
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
    });
    expect(response.html)
        .toEqual('<p><strong>Id:</strong>&nbsp;31a61a8305ef1fc9a71fa4f20a68d7ec88b28e32303bbc4a5f192e851165b816</p><p><strong>Name:</strong>&nbsp;homeassistant</p><p><strong>Watcher:</strong>&nbsp;local</p><p><strong>Include_tags:</strong>&nbsp;^\\d+\\.\\d+.\\d+$</p><p><strong>Image_id:</strong>&nbsp;sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6</p><p><strong>Image_registry_url:</strong>&nbsp;123456789.dkr.ecr.eu-west-1.amazonaws.com</p><p><strong>Image_name:</strong>&nbsp;test</p><p><strong>Image_tag_value:</strong>&nbsp;2021.6.4</p><p><strong>Image_tag_semver:</strong>&nbsp;true</p><p><strong>Image_digest_watch:</strong>&nbsp;false</p><p><strong>Image_digest_repo:</strong>&nbsp;sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72</p><p><strong>Image_architecture:</strong>&nbsp;amd64</p><p><strong>Image_os:</strong>&nbsp;linux</p><p><strong>Image_created:</strong>&nbsp;2021-06-12T05:33:38.440Z</p><p><strong>Result_tag:</strong>&nbsp;2021.6.5</p>');
});
