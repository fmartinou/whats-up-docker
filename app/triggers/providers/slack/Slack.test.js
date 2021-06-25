const { ValidationError } = require('joi');
const SlackClient = require('slack');

jest.mock('slack');
const Slack = require('./Slack');

const slack = new Slack();

const configurationValid = {
    token: 'token',
    channel: 'channel',
};

test('validateConfiguration should return validated configuration when valid', () => {
    const validatedConfiguration = slack.validateConfiguration(configurationValid);
    expect(validatedConfiguration).toStrictEqual(configurationValid);
});

test('validateConfiguration should throw error when invalid', () => {
    expect(() => {
        slack.validateConfiguration({});
    }).toThrowError(ValidationError);
});

test('maskConfiguration should mask sensitive data', () => {
    slack.configuration = {
        token: 'token',
        channel: 'channel',
    };
    expect(slack.maskConfiguration()).toEqual({
        token: 't***n',
        channel: 'channel',
    });
});

test('initTrigger should init Slack client', async () => {
    slack.configuration = configurationValid;
    await slack.initTrigger();
    expect(SlackClient).toHaveBeenCalledWith({
        token: 'token',
    });
});

test('notify should format text as expected', async () => {
    slack.configuration = {
        channel: 'channel',
    };
    slack.client = {
        chat: {
            postMessage: (conf) => (conf),
        },
    };
    const response = await slack.notify({
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
    expect(response.text)
        .toEqual('*Id:* 31a61a8305ef1fc9a71fa4f20a68d7ec88b28e32303bbc4a5f192e851165b816\n'
            + '*Name:* homeassistant\n'
            + '*Watcher:* local\n'
            + '*Include_tags:* ^\\d+\\.\\d+.\\d+$\n'
            + '*Image_id:* sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6\n'
            + '*Image_registry_url:* 123456789.dkr.ecr.eu-west-1.amazonaws.com\n'
            + '*Image_name:* test\n'
            + '*Image_tag_value:* 2021.6.4\n'
            + '*Image_tag_semver:* true\n'
            + '*Image_digest_watch:* false\n'
            + '*Image_digest_repo:* sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72\n'
            + '*Image_architecture:* amd64\n'
            + '*Image_os:* linux\n'
            + '*Image_created:* 2021-06-12T05:33:38.440Z\n'
            + '*Result_tag:* 2021.6.5');
});
