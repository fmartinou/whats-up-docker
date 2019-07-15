const { Docker: DockerApi } = require('node-docker-api');
const parse = require('docker-parse-image');
const rp = require('request-promise-native');
const semver = require('semver');
const moment = require('moment');
const Source = require('./Source');

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
        const filteredContainers = containers

        // Filter containers on labels
            .filter((container) => {
                if (this.watchByDefault) {
                    return true;
                }
                const labels = container.data.Labels;
                return Object.keys(labels).find(labelName => labelName.toLowerCase() === 'wud-watch') !== undefined;
            });
        const imagesPromises = filteredContainers
            .map(container => this.mapContainerToImage(container));
        return Promise.all(imagesPromises);
    }

    /* eslint-disable-next-line */
    async findNewVersion(image) {
        let next = `${image.registry}/v2/repositories/${image.organization}/${image.image}/tags?page=1`;
        while (next) {
            try {
                /* eslint-disable-next-line */
                const tags = await getTagsPage(next);

                // Store next page
                ({ next } = tags);
                const newTag = tags.results.find((tag) => {
                    // Semver comparison
                    if (image.isSemver) {
                        const foundVersion = semver.coerce(tag.name);
                        return semver.valid(foundVersion)
                            && semver.gt(foundVersion, image.version);
                    }
                    if (tag.name === image.version) {
                        // is tag date after?
                        const tagDate = moment(tag.last_updated);
                        return tagDate.isAfter(image.date);
                    }
                    return false;
                });

                // New tag found? return it
                if (newTag) {
                    return {
                        newVersion: newTag.name,
                        newVersionDate: newTag.last_updated,
                    };
                }
            } catch (e) {
                throw new Error('Unable to find tags on registry');
            }
        }
        throw new Error('Unable to find tags on registry');
    }

    async mapContainerToImage(container) {
        const containerImage = await this.dockerApi.image
            .get(container.data.Image)
            .status();
        const containerImageCreationDate = moment(containerImage.data.Created);

        const parsedImage = parse(container.data.Image);
        return {
            registry: parsedImage.registry || 'https://hub.docker.com',
            organization: parsedImage.namespace || 'library',
            image: parsedImage.repository,
            version: parsedImage.tag || 'latest',
            date: containerImageCreationDate,
        };
    }
}

module.exports = Docker;
