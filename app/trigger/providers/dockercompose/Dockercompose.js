const { Docker: DockerApi } = require('node-docker-api');
const uuid = require('uuid/v4');
const Queue = require('promise-queue');
const Trigger = require('../Trigger');
const log = require('../../../log');

/**
 * Docker Compose Trigger implementation
 */
class Dockercompose extends Trigger {
    /**
     * Get the Trigger configuration schema.
     * @returns {*}
     */
    getConfigurationSchema() {
        return this.joi.object().keys({
            socket: this.joi.string().default('/var/run/docker.sock'),
            host: this.joi.string(),
            port: this.joi.number().port().default(2375),
            composefile: this.joi.string().required(),
        });
    }

    initTrigger() {
        const options = {};
        if (this.configuration.host) {
            options.host = this.configuration.host;
            options.port = this.configuration.port;
        } else {
            options.socketPath = this.configuration.socket;
        }
        this.dockerApi = new DockerApi(options);
        this.queue = new Queue(1, Infinity);
    }

    /**
     * Send an HTTP Request with new image version details.
     *
     * @param image the image
     * @returns {Promise<void>}
     */
    async notify(image) {
        this.queue.add(async () => {
            try {
                const organization = image.organization === 'library' ? '' : `image${image.organization}/`;
                const container = await this.dockerApi.container.create({
                    Image: 'alpine',
                    name: `wud-alpine-${uuid()}`,
                    Cmd: [
                        '/bin/ash',
                        '-c',
                        `cp /tmp/docker-compose.yml /tmp/docker-compose.yml.tmp && sed -i 's|image:[[:blank:]]${organization}${image.image}:${image.version}|image: ${organization}${image.image}:${image.result.newVersion}|g' /tmp/docker-compose.yml.tmp && cat /tmp/docker-compose.yml.tmp > /tmp/docker-compose.yml`,
                    ],
                    HostConfig: {
                        Binds: [`${this.configuration.composefile}:/tmp/docker-compose.yml`],
                    },
                });
                await container.start();
                await container.stop();
                await container.delete({ force: true });
            } catch (e) {
                log.error(`Unable to create container wud-alpine (${e.message})`);
                throw e;
            }
        });
    }
}

module.exports = Dockercompose;
