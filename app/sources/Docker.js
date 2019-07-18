const { Docker: DockerApi } = require('node-docker-api');
const parse = require('docker-parse-image');
const rp = require('request-promise-native');
const semver = require('semver');
const log = require('../log');
const Source = require('./Source');
const eventEmitter = require('../triggerService');

async function getTagsPage(url) {
    return rp({
        uri: url,
        headers: {
            Accept: 'application/json',
        },
        json: true,
    });
}

class Docker extends Source {
    constructor(sourceConfiguration) {
        super(sourceConfiguration);
        this.watchByDefault = this.configuration.watchByDefault !== undefined
            ? this.configuration.watchByDefault : true;
        this.dockerApi = new DockerApi({
            socketPath: this.configuration.socketPath,
        });
    }

    async getImages() {
        const containers = await this.dockerApi.container.list();
        return containers

        // Filter containers on labels
            .filter((container) => {
                if (this.watchByDefault) {
                    return true;
                }
                const labels = container.data.Labels;
                return Object.keys(labels).find(labelName => labelName.toLowerCase() === 'wud-watch') !== undefined;

                // Map container to image
            }).map((container) => {
                const parsedImage = parse(container.data.Image);
                return {
                    registry: parsedImage.registry || 'https://hub.docker.com',
                    organization: parsedImage.namespace || 'library',
                    image: parsedImage.repository,
                    version: parsedImage.tag || 'latest',
                };
            });
    }

    async findNewVersion(image) {
        const currentVersion = semver.coerce(image.version);
        let next = `${image.registry}/v2/repositories/${image.organization}/${image.image}/tags?page=1`;
        const imageResult = {
            organization: image.organization,
            image: image.image,
            currentVersion: image.version,
            lastAnalysis: new Date(),
        };

        if (!currentVersion) {
            log.debug(`Ignore ${image.registry}/${image.organization}/${image.image}:${image.version} (not a semver)`);
            imageResult.error = {
                message: 'Current version is not semver',
                details: image.version,
            };

            // Break
            return imageResult;
        }

        log.debug(`Check ${image.registry}/${image.organization}/${image.image}:${image.version}`);
        while (next) {
            try {
                /* eslint-disable-next-line */
                const tags = await getTagsPage(next);

                ({ next } = tags);
                const newTag = tags.results.find((tag) => {
                    const foundVersion = semver.coerce(tag.name);
                    return semver.valid(foundVersion)
                        && semver.gt(foundVersion, currentVersion);
                });
                if (newTag) {
                    imageResult.newVersion = newTag.name;
                    imageResult.newVersionDate = newTag.last_updated;

                    // Emit new version found
                    eventEmitter.emit(image);

                    // Break
                    return imageResult;
                }
            } catch (e) {
                imageResult.error = {
                    message: 'Unable to find tags on registry',
                    details: e.message,
                };

                // Break
                return imageResult;
            }
        }
        return imageResult;
    }
}

module.exports = Docker;
