const { Docker: DockerApi } = require('node-docker-api');
const joi = require('joi-cron-expression')(require('@hapi/joi'));
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
        return Promise.all(Object.values(images).map((image) => this.processImage(image)));
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
                return Object.keys(labels).find((labelName) => labelName.toLowerCase() === 'wud.watch') !== undefined;
            });
        const imagesPromises = filteredContainers
            .map((container) => {
                const labels = container.data.Labels;
                const includeTags = Object.keys(labels).find((labelName) => labelName.toLowerCase() === 'wud.tag.include') ? labels['wud.tag.include'] : undefined;
                const excludeTags = Object.keys(labels).find((labelName) => labelName.toLowerCase() === 'wud.tag.exclude') ? labels['wud.tag.exclude'] : undefined;
                return this.mapContainerToImage(container, includeTags, excludeTags);
            });
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

                // Filter on arch & os
                const newTag = tags.results
                    .find((tag) => {
                        // Match include tag regex
                        if (image.includeTags) {
                            const includeTagsRegex = new RegExp(image.includeTags);
                            const includeTagsMatch = includeTagsRegex.test(tag.name);
                            if (!includeTagsMatch) {
                                return false;
                            }
                        }

                        // Match exclude tag regex
                        if (image.excludeTags) {
                            const excludeTagsRegex = new RegExp(image.excludeTags);
                            const excludeTagsMatch = excludeTagsRegex.test(tag.name);
                            if (!excludeTagsMatch) {
                                return false;
                            }
                        }

                        let newer = false;

                        // Semver comparison
                        if (image.isSemver) {
                            const foundVersion = semver.coerce(tag.name);
                            newer = semver.valid(foundVersion)
                                && semver.gt(foundVersion, image.version);
                        } else if (tag.name === image.version) {
                            // is tag date after?
                            const tagDate = moment(tag.last_updated);
                            newer = tagDate.isAfter(image.date);
                        }
                        // Available arch&os? Different size?
                        const mathingImage = tag.images
                            .find((tagImage) => image.architecture === tagImage.architecture
                                && image.os === tagImage.os
                                && image.size !== tagImage.size);
                        return newer && mathingImage;
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

    async mapContainerToImage(container, includeTags, excludeTags) {
        // Get container image details
        const containerImage = await this.dockerApi.image
            .get(container.data.Image)
            .status();

        // Get useful properties
        const architecture = containerImage.data.Architecture;
        const os = containerImage.data.Os;
        const size = containerImage.data.Size;
        const creationDate = moment(containerImage.data.Created);

        // Parse image to get registry, organization...
        const parsedImage = parse(container.data.Image);
        return {
            registry: parsedImage.registry || 'https://hub.docker.com',
            organization: parsedImage.namespace || 'library',
            image: parsedImage.repository,
            version: parsedImage.tag || 'latest',
            date: creationDate,
            architecture,
            os,
            size,
            includeTags,
            excludeTags,
        };
    }
}

module.exports = Docker;
