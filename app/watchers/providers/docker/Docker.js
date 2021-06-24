const fs = require('fs');
const Dockerode = require('dockerode');
const joi = require('joi-cron-expression')(require('joi'));
const cron = require('node-cron');
const parse = require('parse-docker-image-name');
const semver = require('semver');
const event = require('../../../event');
const storeContainer = require('../../../store/container');
const log = require('../../../log');
const Component = require('../../../registry/Component');
const { validate: validateContainer } = require('../../../model/container');
const registry = require('../../../registry');
const { getWatchContainerGauge } = require('../../../prometheus/watcher');

/**
 * Return all supported registries
 * @returns {*}
 */
function getRegistries() {
    return registry.getState().registries;
}

/**
 * Process a Container Result.
 * @param containerWithResult
 */
function processContainerResult(containerWithResult) {
    let containerToTrigger;
    let trigger = false;

    // Find container in db & compare
    const containerInDb = storeContainer.getContainer(containerWithResult.id);

    // Not found in DB? => Save it
    if (!containerInDb) {
        log.debug(`${containerWithResult.id} - Container watched for the first time`);
        containerToTrigger = storeContainer.insertContainer(containerWithResult);
        if (containerWithResult.updateAvailable) {
            trigger = true;
        } else {
            log.debug(`${containerWithResult.id} - No update available`);
        }

        // Found in DB? => update it
    } else {
        containerToTrigger = storeContainer.updateContainer(containerWithResult);
        trigger = containerInDb.resultChanged(containerToTrigger)
            && containerWithResult.updateAvailable;
    }

    // Emit event only if new version not already emitted
    if (trigger) {
        log.info(`${containerWithResult.id} - Update available`);
        event.emitContainerNewVersion(containerToTrigger);
    } else {
        log.debug(`${containerWithResult.id} - Result already processed => No need to trigger`);
    }
}

/**
 * Filter candidate tags (based on tag name).
 * @param container
 * @param tags
 * @returns {*}
 */
function getSemverTagsCandidate(container, tags) {
    let filteredTags = tags;

    // Match include tag regex
    if (container.includeTags) {
        const includeTagsRegex = new RegExp(container.includeTags);
        filteredTags = filteredTags.filter((tag) => includeTagsRegex.test(tag));
    }

    // Match exclude tag regex
    if (container.excludeTags) {
        const excludeTagsRegex = new RegExp(container.excludeTags);
        filteredTags = filteredTags.filter((tag) => !excludeTagsRegex.test(tag));
    }
    const currentTag = semver.coerce(container.image.tag.value);

    // Keep semver only
    filteredTags = filteredTags.filter((tag) => semver.valid(semver.coerce(tag)));

    // Apply semver sort desc
    filteredTags.sort((t1, t2) => {
        const greater = semver.gte(semver.coerce(t2), semver.coerce(t1));
        return greater ? 1 : -1;
    });

    // Keep only greater semver
    filteredTags = filteredTags.filter((tag) => semver.gte(semver.coerce(tag), currentTag));
    return filteredTags;
}

function normalizeContainer(container) {
    const containerWithNormalizedImage = container;
    const registryProvider = Object.values(getRegistries())
        .find((provider) => provider.match(container.image));
    if (!registryProvider) {
        log.warn(`${container.id} - No Registry Provider found`);
        containerWithNormalizedImage.image.registry.name = 'unknown';
    } else {
        containerWithNormalizedImage.image = registryProvider.normalizeImage(container.image);
    }
    return validateContainer(containerWithNormalizedImage);
}

/**
 * Get the Docker Registry by name.
 * @param registryName
 */
function getRegistry(registryName) {
    const registryToReturn = getRegistries()[registryName];
    if (!registryToReturn) {
        throw new Error(`Unsupported Registry ${registryName}`);
    }
    return registryToReturn;
}

/**
 * Get old containers to prune.
 * @param newContainers
 * @param containersFromTheStore
 * @returns {*[]|*}
 */
function getOldContainers(newContainers, containersFromTheStore) {
    if (!containersFromTheStore || !newContainers) {
        return [];
    }
    return containersFromTheStore.filter((containerFromStore) => {
        const isContainerStillToWatch = newContainers
            .find((newContainer) => newContainer.id === containerFromStore.id);
        return isContainerStillToWatch === undefined;
    });
}

/**
 * Prune old containers from the store.
 * @param newContainers
 * @param containersFromTheStore
 */
function pruneOldContainers(newContainers, containersFromTheStore) {
    const containersToRemove = getOldContainers(newContainers, containersFromTheStore);
    containersToRemove.forEach((containerToRemove) => {
        storeContainer.deleteContainer(containerToRemove.id);
    });
}

function getContainerName(container) {
    let containerName;
    const names = container.Names;
    if (names && names.length > 0) {
        [containerName] = names;
    }
    // Strip ugly forward slash
    containerName = containerName.replace(/\//, '');
    return containerName;
}

/**
 * Get image repo digest.
 * @param containerImage
 * @returns {*} digest
 */
function getRepoDigest(containerImage) {
    if (!containerImage.RepoDigests || containerImage.RepoDigests.length === 0) {
        return undefined;
    }
    const fullDigest = containerImage.RepoDigests[0];
    const digestSplit = fullDigest.split('@');
    return digestSplit[1];
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
            cafile: this.joi.string(),
            certfile: this.joi.string(),
            keyfile: this.joi.string(),
            cron: joi.string().cron().default('0 * * * *'),
            watchbydefault: this.joi.boolean().default(true),
            watchall: this.joi.boolean().default(false),
        });
    }

    /**
     * Init the Watcher.
     */
    init() {
        this.initWatcher();
        log.info(`Schedule runner (${this.configuration.cron})`);
        cron.schedule(this.configuration.cron, () => this.watch());

        // Subscribe to image result events
        event.registerContainerResult(processContainerResult);

        // watch at startup (after all components have been registered)
        setTimeout(() => this.watch(), 1000);
    }

    initWatcher() {
        const options = {};
        if (this.configuration.host) {
            options.host = this.configuration.host;
            options.port = this.configuration.port;
            if (this.configuration.cafile) {
                options.ca = fs.readFileSync(this.configuration.cafile);
            }
            if (this.configuration.certfile) {
                options.cert = fs.readFileSync(this.configuration.certfile);
            }
            if (this.configuration.keyfile) {
                options.key = fs.readFileSync(this.configuration.keyfile);
            }
        } else {
            options.socketPath = this.configuration.socket;
        }
        this.dockerApi = new Dockerode(options);
    }

    /**
     * Watch main method.
     * @returns {Promise<*[]>}
     */
    async watch() {
        let containers = [];

        // List images to watch
        try {
            containers = await this.getContainers();
        } catch (e) {
            log.error(`Error when trying to get the containers list to watch (${e.message})`);
        }

        // Prune old containers from the store
        try {
            const containersFromTheStore = storeContainer.getContainers({ watcher: this.name });
            pruneOldContainers(containers, containersFromTheStore);
        } catch (e) {
            log.error(`Error when trying to prune the old containers (${e.message})`);
        }
        getWatchContainerGauge().set({
            type: this.type,
            name: this.name,
        }, containers.length);

        try {
            return Promise.all(containers.map((container) => this.watchContainer(container)));
        } catch (e) {
            log.error(`Error when processing images (${e.message})`);
            return [];
        }
    }

    /**
     * Watch a Container.
     * @param container
     * @returns {Promise<*>}
     */
    async watchContainer(container) {
        const containerWithResult = container;

        // Reset previous results
        delete containerWithResult.result;
        delete containerWithResult.error;
        log.debug(`${container.id} - Watch container`);

        try {
            containerWithResult.result = await this.findNewVersion(container);
        } catch (e) {
            log.warn(`${container.id} - Error when trying to find new version (${e.message})`);
            log.debug(e);
            containerWithResult.error = {
                message: e.message,
            };
        }
        event.emitContainerResult(containerWithResult);
        return containerWithResult;
    }

    /**
     * Get all containers to watch.
     * @returns {Promise<unknown[]>}
     */
    async getContainers() {
        const listContainersOptions = {};
        if (this.configuration.watchall) {
            listContainersOptions.all = true;
        }
        const containers = await this.dockerApi.listContainers(listContainersOptions);
        const filteredContainers = containers

            // Filter containers on labels
            .filter((container) => {
                if (this.configuration.watchbydefault) {
                    return true;
                }
                const wudWatchValue = container.Labels['wud.watch'];
                return wudWatchValue && wudWatchValue.toLowerCase() === 'true';
            });
        const containerPromises = filteredContainers
            .map((container) => {
                const labels = container.Labels;
                const includeTags = labels['wud.tag.include'] !== undefined ? labels['wud.tag.include'] : undefined;
                const excludeTags = labels['wud.tag.exclude'] !== undefined ? labels['wud.tag.exclude'] : undefined;
                return this.addImageDetailsToContainer(container, includeTags, excludeTags);
            });
        const containersWithImage = await Promise.all(containerPromises);

        // Return containers to process
        return containersWithImage.filter((imagePromise) => imagePromise !== undefined);
    }

    /**
     * Find new version for a Container.
     */

    /* eslint-disable-next-line */
    async findNewVersion(container) {
        const registryProvider = getRegistry(container.image.registry.name);
        const result = { tag: container.image.tag.value };
        if (!registryProvider) {
            log.error(`${container.id} - Unsupported registry (${container.image.registry.name})`);
        } else {
            // Must watch digest? => Find local/remote digests on registry
            if (container.image.digest.watch && container.image.digest.repo) {
                const remoteDigest = await registryProvider.getImageManifestDigest(container.image);
                result.digest = remoteDigest.digest;
                result.created = remoteDigest.created;

                if (remoteDigest.version === 2) {
                    // Regular v2 manifest => Get manifest digest
                    /*  eslint-disable no-param-reassign */
                    const digestV2 = await registryProvider.getImageManifestDigest(
                        container.image,
                        container.image.digest.repo,
                    );
                    container.image.digest.value = digestV2.digest;
                } else {
                    // Legacy v1 image => take Image digest as reference for comparison
                    const image = await this.dockerApi.getImage(container.image.id).inspect();
                    container.image.digest.value = image.Config.Image === '' ? undefined : image.Config.Image;
                }
            }

            // Semver image -> find higher semver tag
            if (container.image.tag.semver) {
                const tags = await registryProvider.getTags(container.image);

                // Get candidates (based on tag name)
                const semverTagsCandidate = getSemverTagsCandidate(container, tags);

                // The first one in the array is the highest
                if (semverTagsCandidate && semverTagsCandidate.length > 0) {
                    [result.tag] = semverTagsCandidate;
                }
            }
            return result;
        }
    }

    /**
     * Add image detail to Container.
     * @param container
     * @param includeTags
     * @param excludeTags
     * @returns {Promise<Image>}
     */
    async addImageDetailsToContainer(container, includeTags, excludeTags) {
        const containerId = container.Id;

        // Is container already in store? just return it :)
        const containerInStore = storeContainer.getContainer(containerId);
        if (containerInStore !== undefined && containerInStore.error === undefined) {
            log.debug(`${containerInStore.id} - Container already in store`);
            return containerInStore;
        }

        // Get container image details
        const image = await this.dockerApi.getImage(container.Image).inspect();

        // Get useful properties
        const containerName = getContainerName(container);
        const architecture = image.Architecture;
        const os = image.Os;
        const variant = image.Variant;
        const created = image.Created;
        const repoDigest = getRepoDigest(image);
        const imageId = image.Id;

        // Parse image to get registry, organization...
        let imageNameToParse = container.Image;
        if (imageNameToParse.includes('sha256:')) {
            if (!image.RepoTags || image.RepoTags.length === 0) {
                log.warn(`${containerId} - Cannot get a reliable tag for this image [${imageNameToParse}]`);
                return Promise.resolve();
            }
            // Get the first repo tag (better than nothing ;)
            [imageNameToParse] = image.RepoTags;
        }
        const parsedImage = parse(imageNameToParse);
        const tagName = parsedImage.tag || 'latest';
        const parsedTag = semver.coerce(tagName);
        const isSemver = parsedTag !== null && parsedTag !== undefined;

        const watchDigestLabelValue = container.Labels['wud.watch.digest'] !== undefined ? container.Labels['wud.watch.digest'] : undefined;
        const watchDigest = watchDigestLabelValue && watchDigestLabelValue.toLowerCase() === 'true';
        return normalizeContainer({
            id: containerId,
            name: containerName,
            watcher: this.name,
            includeTags,
            excludeTags,
            image: {
                id: imageId,
                registry: {
                    url: parsedImage.domain,
                },
                name: parsedImage.path,
                tag: {
                    value: tagName,
                    semver: isSemver,
                },
                digest: {
                    watch: watchDigest,
                    repo: repoDigest,
                },
                architecture,
                os,
                variant,
                created,
            },
            result: {
                tag: tagName,
            },
        });
    }
}

module.exports = Docker;
