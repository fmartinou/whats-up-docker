const parse = require('parse-docker-image-name');
const Trigger = require('../Trigger');
const { getState } = require('../../../registry');
const { fullName } = require('../../../model/container');
const { flatten, unflatten } = require('flat');

/**
 * Replace a Docker container with an updated one.
 */
class Docker extends Trigger {
    /**
     * Get the Trigger configuration schema.
     * @returns {*}
     */
    getConfigurationSchema() {
        return this.joi.object().keys({
            prune: this.joi.boolean().default(false),
            dryrun: this.joi.boolean().default(false),
        });
    }

    /**
     * Get watcher responsible for the container.
     * @param container
     * @returns {*}
     */
    // eslint-disable-next-line class-methods-use-this
    getWatcher(container) {
        return getState().watcher[`watcher.docker.${container.watcher}`];
    }

    /**
     * Get current container.
     * @param dockerApi
     * @param container
     * @returns {Promise<*>}
     */
    async getCurrentContainer(dockerApi, container) {
        this.log.debug(`Get container ${container.id}`);
        try {
            return await dockerApi.getContainer(container.id);
        } catch (e) {
            this.log.warn(`Error when getting container ${container.id}`);
            throw e;
        }
    }

    /**
     * Get other containers dependent on current container.
     * @param dockerApi
     * @param container
     * @param logContainer
     * @returns {Promise<*>}
     */
    async getDependentContainers(dockerApi, container, serviceName, logContainer) {
        this.log.debug(`Get container dependent containers for ${container.id} : ${container.name}`);
        try {
            let checks = [
                this.getAllContainersWithLabel(dockerApi, 'fmartinou.whatsupdocker.container.depends_on', container.name)
            ];

            if (serviceName) {
                checks = checks.concat([
                    this.getAllContainersWithLabel(dockerApi, 'com.docker.compose.depends_on', `${serviceName}:service_started:true`, logContainer),
                    this.getAllContainersWithLabel(dockerApi, 'com.docker.compose.depends_on', `${serviceName}:service_started:false`, logContainer),
                    this.getAllContainersWithLabel(dockerApi, 'com.docker.compose.depends_on', `${serviceName}:service_healthy:true`, logContainer),
                    this.getAllContainersWithLabel(dockerApi, 'com.docker.compose.depends_on', `${serviceName}:service_healthy:false`, logContainer),
                    this.getAllContainersWithLabel(dockerApi, 'com.docker.compose.depends_on', `${serviceName}:service_completed_successfully:true`, logContainer),
                    this.getAllContainersWithLabel(dockerApi, 'com.docker.compose.depends_on', `${serviceName}:service_completed_successfully:false`, logContainer),
                    this.getAllContainersWithLabel(dockerApi, 'fmartinou.whatsupdocker.container.depends_on', serviceName, logContainer)
                ]);
            }

            const containers = await Promise.all(checks)
                .then(containers => containers.flat())
                .then(containers => Array.from(new Map(containers.map(container => [container.Id, container])).values()))
                .then(
                    containers => Promise.all(
                        containers.map(
                            container => this.getCurrentContainer(dockerApi, { id: container.Id })
                                .then(
                                    containerInstance => this.inspectContainer(containerInstance, logContainer)
                                        .then(inspectedContainer => ({ container: containerInstance, inspected: inspectedContainer }))
                                )
                        )
                    )
                );

            this.log.debug(`Gotten ${containers.length} dependent containers for ${container.id} : ${container.name}`);

            return containers;
        } catch (e) {
            logContainer.warn(`Error when getting dependent containers for container ${container.id}`);
            throw e;
        }
    }

    /**
     * Get all containers which have the specified label
     * @param dockerApi
     * @param key
     * @param value
     * @param logContainer
     * @returns {Promise<*>}
     */
    async getAllContainersWithLabel(dockerApi, key, value = null, logContainer) {
        this.log.debug(`Get all containers with label "${key}=${value ?? '<not_set>'}"`);
        try {
            const containers = await dockerApi.listContainers({
                filters: JSON.stringify({
                    label: [
                        value ? `${key}=${value}` : `${key}`
                    ]
                })
            });

            this.log.debug(`Gotten ${containers.length} container(s) with label "${key}=${value ?? '<not_set>'}"`);

            return containers;
        } catch (e) {
            logContainer.warn(`Error when getting all containers with label "${key}=${value ?? '<not_set>'}"`);
            throw e;
        }
    }

    /**
     * Get other containers dependent on current container by `network_mode: container:*`.
     * @param dockerApi
     * @param container
     * @param logContainer
     * @returns {Promise<*>}
     */
    async getDependentContainersByNetworkMode(dockerApi, container, logContainer) {
        this.log.debug(`Get container ${container.id}`);
        try {
            return []; //TODO: Currently there's no way to filter on `network_mode` through the API, so this function is an empty shell
        } catch (e) {
            logContainer.warn(`Error when getting container ${container.id}`);
            throw e;
        }
    }

    /**
     * Inspect container.
     * @param container
     * @returns {Promise<*>}
     */
    async inspectContainer(container, logContainer) {
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

    /**
     * Pull new image.
     * @param dockerApi
     * @param auth
     * @param newImage
     * @param logContainer
     * @returns {Promise<void>}
     */
    /* eslint-disable class-methods-use-this */
    async pullImage(dockerApi, auth, newImage, logContainer) {
        logContainer.info(`Pull image ${newImage}`);
        try {
            const pullStream = await dockerApi.pull(newImage, { authconfig: auth });
            /* eslint-disable-next-line no-promise-executor-return */
            await new Promise((res) => dockerApi.modem.followProgress(pullStream, res));
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
    async stopContainer(container, containerName, containerId, logContainer) {
        logContainer.info(`Stop container ${containerName} with id ${containerId}`);
        try {
            await container.stop();
            logContainer.info(`Container ${containerName} with id ${containerId} stopped with success`);
        } catch (e) {
            logContainer.warn(`Error when stopping container ${containerName} with id ${containerId}`);
            throw e;
        }
    }

    /**
     * Remove a container.
     * @param container
     * @param containerName
     * @param containerId
     * @param logContainer
     * @returns {Promise<void>}
     */
    async removeContainer(container, containerName, containerId, logContainer) {
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
     * Recreate a container.
     * @param dockerApi
     * @param container
     * @param newImage
     * @param currentContainer
     * @param logContainer
     * @param containerSpecPatch
     * @param forceStart
     * @returns {Promise<*>}
     */
    async recreateContainer(dockerApi, container, newImage, currentContainer, logContainer, containerSpecPatch = null, forceStart = false) {
        logContainer.info(`Recreate container ${container.name} with image ${newImage}`, {container, currentContainer});
        try {
            const currentContainerSpec = await this.inspectContainer(
                currentContainer,
                logContainer,
            );
            const currentContainerState = currentContainerSpec.State;

            logContainer.debug('Inspected container: ', currentContainerSpec);

            const dependentContainers = [
                // Check for dependent containers
                ...(await this.getDependentContainers(dockerApi, container, currentContainerSpec?.Config?.Labels?.['com.docker.compose.service'] ?? null, logContainer)),
                // Check for containers with `network_mode: container:{CONTAINER_NAME}` or `network_mode: service:*` (as this is equal to `network_mode: container:{CONTAINER_ID}`)
                ...(await this.getDependentContainersByNetworkMode(dockerApi, container, logContainer))
            ];

            logContainer.debug(`All dependent containers for ${container.name} are: \r\n\t` + dependentContainers.map(c => c.inspected.Name.replace(/\//, '')).join('\r\n\t'));

            const containersToRestart = dependentContainers.filter(c => !c?.inspected?.HostConfig?.NetworkMode || !c.inspected.HostConfig.NetworkMode.startsWith(`container:${container.id}`));
            const containersToRecreate = dependentContainers.filter(c => c?.inspected?.HostConfig?.NetworkMode && c.inspected.HostConfig.NetworkMode.startsWith(`container:${container.id}`));

            logContainer.debug(`Of which\r\n\t${containersToRestart.length} container(s) need to be restarted\r\n\t${containersToRecreate.length} container(s) need to be recreated`);

            // Stop current container
            if (currentContainerState.Running) {
                // Need to stop dependent containers before the current one
                logContainer.debug(`Containers to stop: \r\n\t` + dependentContainers.filter(c => c.inspected.State.Running).map(c => c.inspected.Name.replace(/\//, '')).join('\r\n\t'));
                await Promise.all(
                    dependentContainers.filter(c => c.inspected.State.Running).map(c => this.stopContainer(c.container, `${container.name} => ${c.inspected.Name.replace(/\//, '')}`, `${container.id} => ${c.inspected.Id}`, logContainer))
                );

                await this.stopContainer(
                    currentContainer,
                    container.name,
                    container.id,
                    logContainer,
                );
            }

            // Clone current container spec
            const containerToCreateInspect = this.cloneContainer(
                currentContainerSpec,
                newImage,
                logContainer,
            );

            // Remove current container
            await this.removeContainer(
                currentContainer,
                container.name,
                container.id,
                logContainer,
            );

            // Create new container
            const newContainer = await this.createContainer(
                dockerApi,
                containerSpecPatch ? this.patchContainerSpec(containerToCreateInspect, containerSpecPatch, logContainer) : containerToCreateInspect,
                container.name,
                logContainer,
            );

            // Start container if it was running
            if (currentContainerState.Running || forceStart) {
                await this.startContainer(newContainer, container.name, logContainer);

                // Need to restart dependent containers after the current one
                logContainer.debug(`Containers to start again: \r\n\t` + containersToRestart.filter(c => c.State.Running).map(c => c.inspected.Name.replace(/\//, '')).join('\r\n\t'));
                await Promise.all(
                    containersToRestart.filter(c => c.inspected.State.Running).map(c => this.startContainer(c.container, `${container.name} => ${c.inspected.Name.replace(/\//, '')}`, logContainer))
                );
            }

            // Need to recreate all dependent containers with the correct id
            logContainer.debug(`Containers to recreate: \r\n\t` + containersToRecreate.map(c => c.inspected.Name.replace(/\//, '')).join('\r\n\t'));
            await Promise.all(
                containersToRecreate.map(
                    c => this.recreateContainer(
                        dockerApi,
                        { id: c.inspected.Id, name: c.inspected.Name.replace(/\//, '') },
                        c.inspected.Config.Image,
                        c.container,
                        logContainer,
                        { HostConfig: { NetworkMode: `container:${newContainer.id}` } },
                        true
                    )
                )
            );
        } catch (e) {
            logContainer.warn(`Error when recreating container ${container.name} (${e.message})`);
            throw e;
        }
    }

    /**
     * Combine spec with patch
     * @param spec
     * @param patch
     * @param logContainer
     */
    patchContainerSpec(spec, patch, logContainer) {
        logContainer.debug('Going to patch spec with patch: ', { spec, patch });

        const flattenPatch = flatten(patch);

        for (const [key, value] of Object.entries(flattenPatch)) {
            let current = spec;
            const paths = key.split('.');
            const keyToBeSet = paths.pop();
            for (const path of paths) {
                if (!current[path]) current[path] = {};
                current = current[path];
            }
            current[keyToBeSet] = value;
        }

        logContainer.debug('Patched spec with patch: ', spec);

        return spec;
    }

    /**
     * Create a new container.
     * @param dockerApi
     * @param containerToCreate
     * @param containerName
     * @param logContainer
     * @returns {Promise<*>}
     */
    async createContainer(dockerApi, containerToCreate, containerName, logContainer) {
        logContainer.info(`Create container ${containerName}`);
        try {
            const newContainer = await dockerApi.createContainer(containerToCreate);
            logContainer.info(`Container ${containerName} recreated on new image with success`, newContainer);
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
    async startContainer(container, containerName, logContainer) {
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

    /**
     * Clone container specs.
     * @param currentContainer
     * @param newImage
     * @returns {*}
     */
    // eslint-disable-next-line class-methods-use-this
    cloneContainer(currentContainer, newImage) {
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
     * @param registry the registry
     * @param container the container
     */
    getNewImageFullName(registry, container) {
        // Tag to pull/run is
        // either the same (when updateKind is digest)
        // or the new one (when updateKind is tag)
        const tagOrDigest = container.updateKind.kind === 'digest' ? container.image.tag.value : container.updateKind.remoteValue;

        // Rebuild image definition string
        return registry.getImageFullName(
            container.image,
            tagOrDigest,
        );
    }

    /**
     * Update the container.
     * @param container the container
     * @returns {Promise<void>}
     */
    async trigger(container) {
        // Child logger for the container to process
        const logContainer = this.log.child({ container: fullName(container) });

        logContainer.debug("Received container: ", container);

        // Get watcher
        const watcher = this.getWatcher(container);

        // Get dockerApi from watcher
        const { dockerApi } = watcher;

        // Get registry configuration
        logContainer.debug(`Get ${container.image.registry.name} registry manager`);
        const registry = getState().registry[container.image.registry.name];

        logContainer.debug(`Get ${container.image.registry.name} registry credentials`);
        const auth = registry.getAuthPull();

        // Get current container
        const currentContainer = await this.getCurrentContainer(dockerApi, container);

        if (currentContainer) {
            // Try to remove previous pulled images
            if (this.configuration.prune) {
                await this.pruneImages(
                    dockerApi,
                    registry,
                    container,
                    logContainer,
                );
            }

            // Rebuild image definition string
            const newImage = this.getNewImageFullName(registry, container);

            // Pull new image ahead of time
            await this.pullImage(dockerApi, auth, newImage, logContainer);

            // Dry-run?
            if (this.configuration.dryrun) {
                logContainer.info('Do not replace the existing container because dry-run mode is enabled');
            } else {
                // Handle recreation of container
                await this.recreateContainer(dockerApi, container, newImage, currentContainer, logContainer);

                // Remove previous image (only when updateKind is tag)
                if (this.configuration.prune) {
                    const tagOrDigestToRemove = container.updateKind.kind === 'tag' ? container.image.tag.value : container.image.digest.repo;

                    // Rebuild image definition string
                    const oldImage = registry.getImageFullName(
                        container.image,
                        tagOrDigestToRemove,
                    );
                    await this.removeImage(dockerApi, oldImage, logContainer);
                }
            }
        } else {
            logContainer.warn('Unable to update the container because it does not exist');
        }
    }

    /**
     * Update the containers.
     * @param containers
     * @returns {Promise<unknown[]>}
     */
    async triggerBatch(containers) {
        return Promise.all(containers.map((container) => this.trigger(container)));
    }
}

module.exports = Docker;
