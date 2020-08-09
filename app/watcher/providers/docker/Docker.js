const { Docker: DockerApi } = require('node-docker-api');
const joi = require('joi-cron-expression')(require('@hapi/joi'));
const parse = require('docker-parse-image');
const rp = require('request-promise-native');
const semver = require('semver');
const moment = require('moment');
const event = require('../../../event');
const log = require('../../../log');
const Watcher = require('../Watcher');
const Image = require('../../../model/Image');
const Result = require('../../../model/Result');

/**
 * Get all tags for an API page.
 * @param url
 * @returns {Promise<*>}
 */
async function getTagsPage(url) {
    return rp({
        uri: url,
        headers: {
            Accept: 'application/json',
        },
        json: true,
    });
}

/**
 * Return if a tag is newer or older.
 * @param image
 * @param tag
 * @returns {boolean}
 */
function isNewerTag(image, tag) {
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
        const currentVersion = semver.coerce(image.version);
        const foundVersion = semver.coerce(tag.name);
        newer = semver.valid(foundVersion)
            && semver.gt(foundVersion, currentVersion);
    } else if (tag.name === image.version) {
        // is tag date after?
        const tagDate = moment(tag.last_updated);
        newer = tagDate.isAfter(moment(image.versionDate));
    }

    // Available arch&os? Different size?
    const matchingImage = tag.images
        .find((tagImage) => image.architecture === tagImage.architecture
            && image.os === tagImage.os
            && image.size !== tagImage.size);
    return newer && matchingImage;
}

/**
 * Docker Watcher Component.
 */
class Docker extends Watcher {
    getConfigurationSchema() {
        return joi.object().keys({
            socket: this.joi.string().default('/var/run/docker.sock'),
            host: this.joi.string(),
            port: this.joi.number().port().default(2375),
            cron: joi.string().cron().default('0 * * * *'),
            watchbydefault: this.joi.boolean().default(true),
        });
    }

    /**
     * Init watcher.
     */
    initWatcher() {
        const options = {};
        if (this.configuration.host) {
            options.host = this.configuration.host;
            options.port = this.configuration.port;
        } else {
            options.socketPath = this.configuration.socket;
        }
        this.dockerApi = new DockerApi(options);
    }

    /**
     * Watch main method.
     * @returns {Promise<*[]>}
     */
    async watch() {
        const imagesArray = await this.getImages();
        const images = {};

        // map to K/V map to remove duplicate items
        imagesArray.forEach((image) => {
            const key = `${image.organization}_${image.image}_${image.version}`;
            images[key] = image;
        });
        return Promise.all(Object.values(images).map((image) => this.processImage(image)));
    }

    /**
     * Process an Image.
     * @param image
     * @returns {Promise<*>}
     */
    async processImage(image) {
        const imageWithResult = image;
        log.debug(`Check ${image.registry}/${image.organization}/${image.image}:${image.version}`);
        try {
            imageWithResult.result = await this.findNewVersion(image);
        } catch (e) {
            imageWithResult.result = {
                error: e.message,
            };
        }
        event.emitImageResult(imageWithResult);
        return imageWithResult;
    }

    /**
     * Get all images to watch.
     * @returns {Promise<unknown[]>}
     */
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

    /**
     * Find new version for an Image.
     */
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
                const newTag = tags.results.find((tag) => isNewerTag(image, tag));

                // New tag found? return it
                if (newTag) {
                    return new Result({
                        newVersion: newTag.name,
                        newVersionDate: newTag.last_updated,
                    });
                }
                // continue with next tags...
            } catch (e) {
                log.debug(e);
                return undefined;
            }
        }
        return undefined;
    }

    /**
     * Map a Container Spec to an Image Model Object.
     * @param container
     * @param includeTags
     * @param excludeTags
     * @returns {Promise<Image>}
     */
    async mapContainerToImage(container, includeTags, excludeTags) {
        // Get container image details
        const containerImage = await this.dockerApi.image
            .get(container.data.Image)
            .status();

        // Get useful properties
        const architecture = containerImage.data.Architecture;
        const os = containerImage.data.Os;
        const size = containerImage.data.Size;
        const creationDate = containerImage.data.Created;

        // Parse image to get registry, organization...
        const parsedImage = parse(container.data.Image);
        const version = parsedImage.tag || 'latest';
        const parsedVersion = semver.coerce(version);
        const isSemver = parsedVersion !== null && parsedVersion !== undefined;
        return new Image({
            registry: parsedImage.registry || 'https://hub.docker.com',
            organization: parsedImage.namespace || 'library',
            image: parsedImage.repository,
            version,
            versionDate: creationDate,
            isSemver,
            architecture,
            os,
            size,
            includeTags,
            excludeTags,
        });
    }
}

module.exports = Docker;
