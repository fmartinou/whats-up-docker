const { Docker: DockerApi } = require('node-docker-api');
const joi = require('joi-cron-expression')(require('@hapi/joi'));
const cron = require('node-cron');
const parse = require('parse-docker-image-name');
const semver = require('semver');
const event = require('../../../event');
const store = require('../../../store');
const log = require('../../../log');
const Component = require('../../../registry/Component');
const Image = require('../../../model/Image');
const Result = require('../../../model/Result');
const registry = require('../../../registry');

/**
 * Return all supported registries
 * @returns {*}
 */
function getRegistries() {
    return registry.getState().registries;
}
/**
 * Return true if Image in DB and Image with Result are identical.
 * @param resultInDb
 * @param imageWithResult
 * @returns {boolean}
 */
function isSameResult(resultInDb, imageWithResult) {
    if (!resultInDb.result && !imageWithResult.result) {
        return true;
    }
    if (!resultInDb.result && imageWithResult.result) {
        return true;
    }
    return resultInDb.result.equals(imageWithResult.result);
}

/**
 * Process an Image Result.
 * @param imageWithResult
 */
function processImageResult(imageWithResult) {
    let trigger = false;

    // Find image in db & compare
    const resultInDb = store.findImage(imageWithResult);

    // Not found in DB? => Save it
    if (!resultInDb) {
        log.debug(`Image watched for the first time (${JSON.stringify(imageWithResult)})`);
        store.insertImage(imageWithResult);
        if (imageWithResult.result) {
            trigger = true;
        } else {
            log.debug(`No result found (${JSON.stringify(imageWithResult)})`);
        }

        // Found in DB? => update it
    } else {
        trigger = !isSameResult(resultInDb, imageWithResult);
        store.updateImage(imageWithResult);
    }

    // New version? => Emit event only if new version
    if (trigger) {
        log.debug(`New image version found (${JSON.stringify(imageWithResult)})`);
        event.emitImageNewVersion(imageWithResult);
    } else {
        log.debug(`Result already processed => No need to trigger (${JSON.stringify(imageWithResult)})`);
    }
}

/**
 * Filter candidate tags (based on tag name).
 * @param image
 * @param tags
 * @returns {*}
 */
function getTagsCandidate(image, tags) {
    let filteredTags = tags;

    // Only keep newer tags
    const currentTagIndex = tags.findIndex((tag) => tag === image.version);
    if (currentTagIndex !== -1) {
        filteredTags = tags.slice(0, currentTagIndex);
    }

    // Match include tag regex
    if (image.includeTags) {
        const includeTagsRegex = new RegExp(image.includeTags);
        filteredTags = filteredTags.filter((tag) => includeTagsRegex.test(tag));
    }

    // Match exclude tag regex
    if (image.excludeTags) {
        const excludeTagsRegex = new RegExp(image.excludeTags);
        filteredTags = filteredTags.filter((tag) => !excludeTagsRegex.test(tag));
    }

    // If semver, filter on greater semver versions
    if (image.isSemver) {
        const currentVersion = semver.coerce(image.version);
        filteredTags = filteredTags.filter((tag) => {
            const tagVersion = semver.coerce(tag);
            return semver.valid(tagVersion) && semver.gt(tagVersion, currentVersion);
        });
    }
    return filteredTags;
}

function normalizeImage(image) {
    const registryProvider = Object.values(getRegistries())
        .find((provider) => provider.match(image));
    if (!registryProvider) {
        log.warn(`No Registry Provider found for image ${JSON.stringify(image)}`);
        return {
            ...image,
            registry: 'unknown',
        };
    }
    return registryProvider.normalizeImage(image);
}

/**
 * Get the Docker Registry by name.
 * @param registryName
 */
function getRegistry(registryName) {
    const registryToReturn = getRegistries()[registryName];
    if (!registryToReturn) {
        throw new Error(`Unsupported Registry ${registry}`);
    }
    return registryToReturn;
}

/**
 * Docker Watcher Component.
 */
class Docker extends Component {
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
     * Init the Watcher.
     */
    init() {
        this.initTrigger();
        log.info(`Schedule runner (${this.configuration.cron})`);
        cron.schedule(this.configuration.cron, () => this.watch());

        // Subscribe to image result events
        event.registerImageResult(processImageResult);

        // watch at startup
        this.watch();
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
            const key = `${image.registry}_${image.image}_${image.version}`;
            images[key] = image;
        });
        return Promise.all(Object.values(images).map((image) => this.watchImage(image)));
    }

    /**
     * Watch an Image.
     * @param image
     * @returns {Promise<*>}
     */
    async watchImage(image) {
        const imageWithResult = image;
        log.debug(`Check ${image.registryUrl}/${image.image}:${image.version}`);

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
        const registryProvider = getRegistry(image.registry);
        if (!registryProvider) {
            log.error(`Unsupported registry ${image.registry}`);
            return undefined;
        }
        try {
            const tagsResult = await registryProvider.getTags(image);

            // Sort alpha then reverse to get higher values first
            tagsResult.tags.sort();
            tagsResult.tags.reverse();

            // Get candidates (based on tag name)
            const tagsCandidate = getTagsCandidate(image, tagsResult.tags);

            // Fetch tag manifests (arch, os...)
            if (tagsCandidate && tagsCandidate.length > 0) {
                return new Result({
                    newVersion: tagsCandidate[0],
                });
            }
            return undefined;
        } catch (e) {
            log.debug(e);
            return undefined;
        }
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
        return normalizeImage(new Image({
            watcher: this.getId(),
            registryUrl: parsedImage.domain,
            image: parsedImage.path,
            version,
            versionDate: creationDate,
            isSemver,
            architecture,
            os,
            size,
            includeTags,
            excludeTags,
        }));
    }
}

module.exports = Docker;
