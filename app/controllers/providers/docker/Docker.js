const fs = require('fs');
const Dockerode = require('dockerode');
const joi = require('joi-cron-expression')(require('joi'));
const cron = require('node-cron');
const parse = require('parse-docker-image-name');
const debounce = require('just-debounce');
const { parse: parseSemver, isGreater: isGreaterSemver, transform: transformTag } = require('../../../tag');
const {
    wudWatch,
    wudTagInclude,
    wudTagExclude,
    wudTagTransform,
    wudWatchDigest,
    wudLinkTemplate,
    wudDisplayName,
    wudDisplayIcon,
} = require('./label');
const storeContainer = require('../../../store/container');
const log = require('../../../log');
const Controller = require('../../Controller');
const { validate: validateContainer, fullName } = require('../../../model/container');
const registry = require('../../../registry');
const { getControlledContainerGauge } = require('../../../prometheus/controller');
const { getState } = require('../../../registry');

// The delay before starting the controller when the app is started
const START_CONTROLLER_DELAY_MS = 1000;

// Debounce delay used when performing a watch after a docker event has been received
const DEBOUNCED_CONTROLLER_CRON_MS = 5000;

/**
 * Return all supported registries
 * @returns {*}
 */
function getRegistries() {
    return registry.getState().registry;
}

/**
 * Filter candidate tags (based on tag name).
 * @param container
 * @param tags
 * @returns {*}
 */
function getTagCandidates(container, tags) {
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

    // Semver image -> find higher semver tag
    if (container.image.tag.semver) {
        // Keep semver only
        filteredTags = filteredTags
            .filter((tag) => parseSemver(transformTag(container.transformTags, tag)) !== null);

        // Keep only greater semver
        filteredTags = filteredTags
            .filter((tag) => isGreaterSemver(
                transformTag(container.transformTags, tag),
                transformTag(container.transformTags, container.image.tag.value),
            ));

        // Apply semver sort desc
        filteredTags.sort((t1, t2) => {
            const greater = isGreaterSemver(
                transformTag(container.transformTags, t2),
                transformTag(container.transformTags, t1),
            );
            return greater ? 1 : -1;
        });
    } else {
        // Non semver tag -> do not propose any other registry tag
        filteredTags = [];
    }
    return filteredTags;
}

function normalizeContainer(container) {
    const containerWithNormalizedImage = container;
    const registryProvider = Object.values(getRegistries())
        .find((provider) => provider.match(container.image));
    if (!registryProvider) {
        log.warn(`${fullName(container)} - No Registry Provider found`);
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
 * Return true if container must be watched.
 * @param wudWatchLabelValue the value of the wud.watch label
 * @param watchByDefault true if containers must be watched by default
 * @returns {boolean}
 */
function isContainerToWatch(wudWatchLabelValue, watchByDefault) {
    return wudWatchLabelValue !== undefined && wudWatchLabelValue !== '' ? wudWatchLabelValue.toLowerCase() === 'true' : watchByDefault;
}

/**
 * Return true if container digest must be watched.
 * @param wudWatchDigestLabelValue the value of wud.watch.digest label
 * @param isSemver if image is semver
 * @returns {boolean|*}
 */
function isDigestToWatch(wudWatchDigestLabelValue, isSemver) {
    let result = false;
    if (isSemver) {
        if (wudWatchDigestLabelValue !== undefined && wudWatchDigestLabelValue !== '') {
            result = wudWatchDigestLabelValue.toLowerCase() === 'true';
        }
    } else {
        result = true;
        if (wudWatchDigestLabelValue !== undefined && wudWatchDigestLabelValue !== '') {
            result = wudWatchDigestLabelValue.toLowerCase() === 'true';
        }
    }
    return result;
}

/**
 * Docker Controller Component.
 */
class Docker extends Controller {
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
            watchevents: this.joi.boolean().default(true),
        });
    }

    initController() {
        this.log.info(`Cron scheduled (${this.configuration.cron})`);
        this.cron = cron.schedule(this.configuration.cron, () => this.pollFromCron());

        // watch at startup (after all components have been registered)
        this.watchCronTimeout = setTimeout(
            () => this.pollFromCron(),
            START_CONTROLLER_DELAY_MS,
        );

        // listen to docker events
        if (this.configuration.watchevents) {
            this.watchCronDebounced = debounce(
                () => { this.pollFromCron(); },
                DEBOUNCED_CONTROLLER_CRON_MS,
            );
            this.listenDockerEventsTimeout = setTimeout(
                () => this.listenDockerEvents(),
                START_CONTROLLER_DELAY_MS,
            );
        }
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
     * Deregister the component.
     * @returns {Promise<void>}
     */
    async deregisterComponent() {
        if (this.cron) {
            this.cron.stop();
            delete this.cron;
        }
        if (this.watchCronTimeout) {
            clearTimeout(this.watchCronTimeout);
        }
        if (this.listenDockerEventsTimeout) {
            clearTimeout(this.listenDockerEventsTimeout);
            delete this.watchCronDebounced;
        }
    }

    /**
     * Listen and react to docker events.
     * @return {Promise<void>}
     */
    async listenDockerEvents() {
        this.log.info('Listening to docker events');
        const options = {
            filters: {
                type: ['container'],
                event: [
                    'create',
                    'destroy',
                    'start',
                    'stop',
                    'pause',
                    'unpause',
                    'die',
                    'update',
                ],
            },
        };
        this.dockerApi.getEvents(options, (err, stream) => {
            if (err) {
                this.log.warn(`Unable to listen to Docker events [${err.message}]`);
                this.log.debug(err);
            } else {
                stream.on('data', (chunk) => this.onDockerEvent(chunk));
            }
        });
    }

    /**
     * Process a docker event.
     * @param dockerEventChunk
     * @return {Promise<void>}
     */
    async onDockerEvent(dockerEventChunk) {
        const dockerEvent = JSON.parse(dockerEventChunk.toString());
        const action = dockerEvent.Action;
        const containerId = dockerEvent.id;

        // If the container was created or destroyed => perform a watch
        if (action === 'destroy' || action === 'create') {
            await this.watchCronDebounced();
        } else {
            // Update container state in db if so
            try {
                const container = await this.dockerApi.getContainer(containerId);
                const containerInspect = await container.inspect();
                const newStatus = containerInspect.State.Status;
                const containerFound = storeContainer.getContainer(containerId);
                if (containerFound) {
                    // Child logger for the container to process
                    const logContainer = this.log.child({ container: fullName(containerFound) });
                    const oldStatus = containerFound.status;
                    containerFound.status = newStatus;
                    if (oldStatus !== newStatus) {
                        storeContainer.updateContainer(containerFound);
                        logContainer.info(`Status changed from ${oldStatus} to ${newStatus}`);
                    }
                }
            } catch (e) {
                this.log.debug(`Unable to get container details for container id=[${containerId}]`);
            }
        }
    }

    /**
     * Watch containers (called by cron scheduled tasks).
     * @returns {Promise<*[]>}
     */
    async pollFromCron() {
        this.log.info(`Scheduled from cron (${this.configuration.cron})`);

        // Get container reports
        const containerReports = await this.poll();

        // // Count container reports
        // const containerReportsCount = containerReports.length;
        //
        // // Count container available updates
        // const containerUpdatesCount = containerReports
        //     .filter((containerReport) => containerReport.container.updateAvailable).length;
        //
        // // Count container errors
        // const containerErrorsCount = containerReports
        //     .filter((containerReport) => containerReport.container.error !== undefined).length;
        //
        // const stats = `${containerReportsCount} containers found, ${containerErrorsCount} errors, ${containerUpdatesCount} available updates`;
        // this.log.info(`Cron execution finished (${stats})`);
        return containerReports;
    }

    /**
     * Watch main method.
     * @returns {Promise<*[]>}
     */
    async poll() {
        let containers = [];

        this.emitStarted();

        try {
            containers = await this.getContainers();
        } catch (e) {
            this.log.warn(`Error when gathering the containers to handle (${e.message})`);
        } finally {
            this.emitStopped({ containers });
        }
        // try {
        //     const containerReports = await Promise.all(
        //         containers.map((container) => this.watchContainer(container)),
        //     );
        //     event.emitContainerReports(containerReports);
        //     return containerReports;
        // } catch (e) {
        //     this.log.warn(`Error when processing some containers (${e.message})`);
        //     return [];
        // } finally {
        //     // Dispatch event to notify stop watching
        //     this.emitStopped();
        // }
    }

    /**
     * Watch a Container.
     * @param container
     * @returns {Promise<*>}
     */
    async watchContainer(container) {
        // Child logger for the container to process
        const logContainer = this.log.child({ container: fullName(container) });
        const containerWithResult = container;

        // Reset previous results if so
        delete containerWithResult.result;
        delete containerWithResult.error;
        logContainer.debug('Start watching');

        try {
            containerWithResult.result = await this.findNewVersion(container, logContainer);
        } catch (e) {
            logContainer.warn(`Error when processing (${e.message})`);
            logContainer.debug(e);
            containerWithResult.error = {
                message: e.message,
            };
        }

        const containerReport = this.mapContainerToContainerReport(containerWithResult);
        event.emitContainerReport(containerReport);
        return containerReport;
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

        // Filter on containers to watch
        const filteredContainers = containers
            .filter(
                (container) => isContainerToWatch(
                    container.Labels[wudWatch],
                    this.configuration.watchbydefault,
                ),
            );
        const containerPromises = filteredContainers
            .map((container) => this.addImageDetailsToContainer(
                container,
                container.Labels[wudTagInclude],
                container.Labels[wudTagExclude],
                container.Labels[wudTagTransform],
                container.Labels[wudLinkTemplate],
                container.Labels[wudDisplayName],
                container.Labels[wudDisplayIcon],
            ));
        const containersWithImage = await Promise.all(containerPromises);

        // Return containers to process
        const containersToReturn = containersWithImage
            .filter((imagePromise) => imagePromise !== undefined);
        //
        // getControlledContainerGauge().set({
        //     type: this.type,
        //     name: this.name,
        // }, containersToReturn.length);

        return containersToReturn;
    }

    /**
     * Find new version for a Container.
     */

    /* eslint-disable-next-line */
    async findNewVersion(container, logContainer) {
        const registryProvider = getRegistry(container.image.registry.name);
        const result = { tag: container.image.tag.value };
        if (!registryProvider) {
            logContainer.error(`Unsupported registry (${container.image.registry.name})`);
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

            const tags = await registryProvider.getTags(container.image);

            // Get candidates (based on tag name)
            const tagsCandidates = getTagCandidates(container, tags);

            // The first one in the array is the highest
            if (tagsCandidates && tagsCandidates.length > 0) {
                [result.tag] = tagsCandidates;
            }
            return result;
        }
    }

    /**
     * Add image detail to Container.
     * @param container
     * @param includeTags
     * @param excludeTags
     * @param transformTags
     * @param linkTemplate
     * @param displayName
     * @param displayIcon
     * @returns {Promise<Image>}
     */
    async addImageDetailsToContainer(
        container,
        includeTags,
        excludeTags,
        transformTags,
        linkTemplate,
        displayName,
        displayIcon,
    ) {
        const containerId = container.Id;

        // Is container already in store? just return it :)
        const containerInStore = storeContainer.getContainer(containerId);
        if (containerInStore !== undefined && containerInStore.error === undefined) {
            this.log.debug(`Container ${containerInStore.id} already in store`);
            return containerInStore;
        }

        // Get container image details
        const image = await this.dockerApi.getImage(container.Image).inspect();

        // Get useful properties
        const containerName = getContainerName(container);
        const status = container.State;
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
                this.log.warn(`Cannot get a reliable tag for this image [${imageNameToParse}]`);
                return Promise.resolve();
            }
            // Get the first repo tag (better than nothing ;)
            [imageNameToParse] = image.RepoTags;
        }
        const parsedImage = parse(imageNameToParse);
        const tagName = parsedImage.tag || 'latest';
        const parsedTag = parseSemver(transformTag(transformTags, tagName));
        const isSemver = parsedTag !== null && parsedTag !== undefined;
        const watchDigest = isDigestToWatch(
            container.Labels[wudWatchDigest],
            isSemver,
        );
        if (!isSemver && !watchDigest) {
            this.log.warn('Image is not a semver and digest watching is disabled so wud won\'t report any update. Please review the configuration to enable digest watching for this container or exclude this container from being watched');
        }
        return normalizeContainer({
            id: containerId,
            name: containerName,
            status,
            controller: this.getId(),
            includeTags,
            excludeTags,
            transformTags,
            linkTemplate,
            displayName,
            displayIcon,
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

    /**
     * Process a Container with result and map to a containerReport.
     * @param containerWithResult
     * @return {*}
     */
    mapContainerToContainerReport(containerWithResult) {
        const logContainer = this.log.child({ container: fullName(containerWithResult) });
        const containerReport = {
            container: containerWithResult,
            changed: false,
        };

        // Find container in db & compare
        const containerInDb = storeContainer.getContainer(containerWithResult.id);

        // Not found in DB? => Save it
        if (!containerInDb) {
            logContainer.debug('Container watched for the first time');
            containerReport.container = storeContainer.insertContainer(containerWithResult);
            containerReport.changed = true;

        // Found in DB? => update it
        } else {
            containerReport.container = storeContainer.updateContainer(containerWithResult);
            containerReport.changed = containerInDb.resultChanged(containerReport.container)
                && containerWithResult.updateAvailable;
        }
        return containerReport;
    }

    async updateContainer({ container, log: logContainer }) {
        // Get registry configuration
        logContainer.debug(`Get ${container.image.registry.name} registry manager`);
        const containerRegistry = getState().registry[container.image.registry.name];

        logContainer.debug(`Get ${container.image.registry.name} registry credentials`);
        const auth = containerRegistry.getAuthPull();

        // Rebuild image definition string
        const newImage = this.getNewImageFullName(containerRegistry, container);

        // Get current container
        const currentContainer = await this.getCurrentContainer({ container, logContainer });

        if (currentContainer) {
            const currentContainerSpec = await this.inspectContainer({
                container: currentContainer,
                logContainer,
            });
            const currentContainerState = currentContainerSpec.State;

            // TODO
            // Try to remove previous pulled images
            /*
            if (this.configuration.prune) {
                await this.pruneImages(
                    dockerApi,
                    containerRegistry,
                    container,
                    logContainer,
                );
            }
            */

            // Pull new image ahead of time
            await this.pullImage({ auth, newImage, logContainer });

            // Dry-run?
            if (this.configuration.dryrun) {
                // TODO
                // logContainer.info('Do not replace the existing container because dry-run mode is enabled');
            } else {
                // Clone current container spec
                const containerToCreateInspect = this.cloneContainer({
                    currentContainer: currentContainerSpec,
                    newImage,
                });

                // Stop current container
                if (currentContainerState.Running) {
                    await this.stopContainer({
                        container: currentContainer,
                        containerName: container.name,
                        containerId: container.id,
                        logContainer,
                    });
                }

                // Remove current container
                await this.removeContainer({
                    container: currentContainer,
                    containerName: container.name,
                    containerId: container.id,
                    logContainer,
                });

                // Create new container
                const newContainer = await this.createContainer({
                    containerToCreate: containerToCreateInspect,
                    containerName: container.name,
                    logContainer,
                });

                // Start container if it was running
                if (currentContainerState.Running) {
                    await this.startContainer({
                        container: newContainer,
                        containerName: container.name,
                        logContainer,
                    });
                }

                // TODO
                // Remove previous image (only when updateKind is tag)
                /*
                if (this.configuration.prune) {
                    const tagOrDigestToRemove = container.updateKind.kind === 'tag' ? container.image.tag.value : container.image.digest.repo;

                    // Rebuild image definition string
                    const oldImage = containerRegistry.getImageFullName(
                        container.image,
                        tagOrDigestToRemove,
                    );
                    await this.removeImage(dockerApi, oldImage, logContainer);
                }
                */
            }
        } else {
            logContainer.warn('Unable to update the container because it does not exist');
        }
    }

    async getCurrentContainer({ container, logContainer }) {
        logContainer.debug(`Get container (id=${container.id})`);
        try {
            return await this.dockerApi.getContainer(container.id);
        } catch (e) {
            this.log.warn(`Error when getting container ${container.id}`);
            throw e;
        }
    }

    async inspectContainer({ container, logContainer }) {
        this.log.debug(`Inspect container ${container.id}`);
        try {
            return await container.inspect();
        } catch (e) {
            logContainer.warn(`Error when inspecting container ${container.id}`);
            throw e;
        }
    }

    /* eslint-disable class-methods-use-this */
    /**
     * Prune previous image versions.
     * @param dockerApi
     * @param registry
     * @param container
     * @param logContainer
     * @returns {Promise<void>}
     */
    async pruneImages(dockerApi, registry, container, logContainer) {
        logContainer.info('Pruning previous tags');
        try {
            // Get all pulled images
            const images = await dockerApi.listImages();

            // Find all pulled images to remove
            const imagesToRemove = images
                .filter((image) => {
                    // Exclude images without repo tags
                    if (!image.RepoTags || image.RepoTags.length === 0) {
                        return false;
                    }
                    const imageParsed = parse(image.RepoTags[0]);
                    const imageNormalized = registry.normalizeImage({
                        registry: {
                            url: imageParsed.domain ? imageParsed.domain : '',
                        },
                        tag: {
                            value: imageParsed.tag,
                        },
                        name: imageParsed.path,
                    });

                    // Exclude different registries
                    if (imageNormalized.registry.name !== container.image.registry.name) {
                        return false;
                    }

                    // Exclude different names
                    if (imageNormalized.name !== container.image.name) {
                        return false;
                    }

                    // Exclude current container image
                    if (imageNormalized.tag.value === container.updateKind.localValue) {
                        return false;
                    }

                    // Exclude candidate image
                    if (imageNormalized.tag.value === container.updateKind.remoteValue) {
                        return false;
                    }
                    return true;
                })
                .map((imageToRemove) => dockerApi.getImage(imageToRemove.Id));
            await Promise.all(imagesToRemove.map((imageToRemove) => {
                logContainer.info(`Prune image ${imageToRemove.name}`);
                return imageToRemove.remove();
            }));
        } catch (e) {
            logContainer.warn(`Some errors occurred when trying to prune previous tags (${e.message})`);
        }
    }

    async pullImage({ auth, newImage, logContainer }) {
        logContainer.info(`Pull image ${newImage}`);
        try {
            const pullStream = await this.dockerApi.pull(newImage, { authconfig: auth });
            /* eslint-disable-next-line no-promise-executor-return */
            await new Promise((res) => this.dockerApi.modem.followProgress(pullStream, res));
            logContainer.info(`Image ${newImage} pulled with success`);
        } catch (e) {
            logContainer.warn(`Error when pulling image ${newImage} (${e.message})`);
            throw e;
        }
    }

    /**
     * Stop a container.
     * @param container
     * @param containerName
     * @param containerId
     * @param logContainer
     * @returns {Promise<void>}
     */
    /* eslint-disable class-methods-use-this */
    async stopContainer({
        container, containerName, containerId, logContainer,
    }) {
        logContainer.info(`Stop container ${containerName} with id ${containerId}`);
        try {
            await container.stop();
            logContainer.info(`Container ${containerName} with id ${containerId} stopped with success`);
        } catch (e) {
            logContainer.warn(`Error when stopping container ${containerName} with id ${containerId}`);
            throw e;
        }
    }

    async removeContainer({
        container, containerName, containerId, logContainer,
    }) {
        logContainer.info(`Remove container ${containerName} with id ${containerId}`);
        try {
            await container.remove();
            logContainer.info(`Container ${containerName} with id ${containerId} removed with success`);
        } catch (e) {
            logContainer.warn(`Error when removing container ${containerName} with id ${containerId}`);
            throw e;
        }
    }

    /**
     * Create a new container.
     * @param containerToCreate
     * @param containerName
     * @param logContainer
     * @returns {Promise<*>}
     */
    async createContainer({ containerToCreate, containerName, logContainer }) {
        logContainer.info(`Create container ${containerName}`);
        try {
            const newContainer = await this.dockerApi.createContainer(containerToCreate);
            logContainer.info(`Container ${containerName} recreated on new image with success`);
            return newContainer;
        } catch (e) {
            logContainer.warn(`Error when creating container ${containerName} (${e.message})`);
            throw e;
        }
    }

    /**
     * Start container.
     * @param container
     * @param containerName
     * @param logContainer
     * @returns {Promise<void>}
     */
    async startContainer({ container, containerName, logContainer }) {
        logContainer.info(`Start container ${containerName}`);
        try {
            await container.start();
            logContainer.info(`Container ${containerName} started with success`);
        } catch (e) {
            logContainer.warn(`Error when starting container ${containerName}`);
            throw e;
        }
    }

    /**
     * Remove an image.
     * @param dockerApi
     * @param imageToRemove
     * @param logContainer
     * @returns {Promise<void>}
     */
    async removeImage(dockerApi, imageToRemove, logContainer) {
        logContainer.info(`Remove image ${imageToRemove}`);
        try {
            const image = await dockerApi.getImage(imageToRemove);
            await image.remove();
            logContainer.info(`Image ${imageToRemove} removed with success`);
        } catch (e) {
            logContainer.warn(`Error when removing image ${imageToRemove}`);
            throw e;
        }
    }

    cloneContainer({ currentContainer, newImage }) {
        const containerName = currentContainer.Name.replace('/', '');
        const containerClone = {
            ...currentContainer.Config,
            name: containerName,
            Image: newImage,
            HostConfig: currentContainer.HostConfig,
            NetworkingConfig: {
                EndpointsConfig: currentContainer.NetworkSettings.Networks,
            },
        };

        if (containerClone.NetworkingConfig.EndpointsConfig) {
            Object
                .values(containerClone.NetworkingConfig.EndpointsConfig)
                .forEach((endpointConfig) => {
                    if (endpointConfig.Aliases && endpointConfig.Aliases.length > 0) {
                        // eslint-disable-next-line
                        endpointConfig.Aliases = endpointConfig.Aliases
                            .filter((alias) => !currentContainer.Id.startsWith(alias));
                    }
                });
        }
        // Handle situation when container is using network_mode: service:other_service
        if (
            containerClone.HostConfig
            && containerClone.HostConfig.NetworkMode
            && containerClone.HostConfig.NetworkMode.startsWith('container:')
        ) {
            delete containerClone.Hostname;
            delete containerClone.ExposedPorts;
        }

        return containerClone;
    }

    /**
     * Get image full name.
     * @param containerRegistry the registry
     * @param container the container
     */
    getNewImageFullName(containerRegistry, container) {
        // Tag to pull/run is
        // either the same (when updateKind is digest)
        // or the new one (when updateKind is tag)
        const tagOrDigest = container.updateKind.kind === 'digest' ? container.image.tag.value : container.updateKind.remoteValue;

        // Rebuild image definition string
        return containerRegistry.getImageFullName(
            container.image,
            tagOrDigest,
        );
    }
}

module.exports = Docker;
