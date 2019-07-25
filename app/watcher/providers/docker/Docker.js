const { Docker: DockerApi } = require('node-docker-api');
const joi = require('joi-cron-expression')(require('joi'));
const parse = require('docker-parse-image');
const rp = require('request-promise-native');
const semver = require('semver');
const moment = require('moment');
const event = require('../../../event');
const log = require('../../../log');
const Watcher = require('../Watcher');

async function getTagsPage(url) {
    return rp({
        uri: url,
        headers: {
            Accept: 'application/json',
        },
        json: true,
    });
}

class Docker extends Watcher {
    getConfigurationSchema() {
        return joi.object().keys({
            socketpath: this.joi.string().default('/var/run/docker.sock'),
            cron: joi.string().cron().default('0 * * * *'),
            watchbydefault: this.joi.boolean().default(true),
        });
    }

    initWatcher() {
        this.dockerApi = new DockerApi({
            socketPath: this.configuration.socketpath,
        });
    }

    async watch() {
        const imagesArray = await this.getImages();
        const images = {};

        // map to K/V map to remove duplicate items
        imagesArray.forEach((image) => {
            const key = `${image.organization}_${image.image}_${image.version}`;
            const parsedVersion = semver.coerce(image.version);
            const isSemver = parsedVersion !== null && parsedVersion !== undefined;
            images[key] = {
                ...image,
                isSemver,

            };
        });
        return Promise.all(Object.values(images).map(image => this.processImage(image)));
    }

    async processImage(image) {
        log.debug(`Check ${image.registry}/${image.organization}/${image.image}:${image.version}`);
        let result;
        let error;
        try {
            result = await this.findNewVersion(image);
        } catch (e) {
            error = e;
        }
        const imageResult = {
            ...image,
            result,
            error,
        };
        event.emitImageResult(imageResult);
        return imageResult;
    }

    async getImages() {
        const containers = await this.dockerApi.container.list();
        const filteredContainers = containers

        // Filter containers on labels
            .filter((container) => {
                if (this.configuration.watchbydefault) {
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
