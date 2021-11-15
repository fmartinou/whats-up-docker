const Trigger = require('../Trigger');
const { getState } = require('../../../registry');
const { fullName } = require('../../../model/container');
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
     * Inspect container.
     * @param container
     * @returns {Promise<*>}
     */
    async inspectContainer(container, logContainer) {
        this.log.debug(`Inspect container ${container.Id}`);
        try {
            return await container.inspect();
        } catch (e) {
            logContainer.warn(`Error when inspecting container ${container.id}`);
            throw e;
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
            await dockerApi.pull(newImage, auth);
            logContainer.debug(`Image ${newImage} pulled with success`);
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
            logContainer.debug(`Container ${containerName} with id ${containerId} stopped with success`);
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
            logContainer.debug(`Container ${containerName} with id ${containerId} removed with success`);
        } catch (e) {
            logContainer.warn(`Error when removing container ${containerName} with id ${containerId}`);
            throw e;
        }
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
            logContainer.debug(`Container ${containerName} recreated on image with success`);
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
            logContainer.debug(`Container ${containerName} started with success`);
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
            logContainer.debug(`Image ${imageToRemove} removed with success`);
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
        return {
            ...currentContainer.Config,
            name: containerName,
            Image: newImage,
            HostConfig: currentContainer.HostConfig,
        };
    }

    /**
     * Update the container.
     * @param container the container
     * @returns {Promise<void>}
     */
    async trigger(container) {
        // Child logger for the container to process
        const logContainer = this.log.child({ container: fullName(container) });

        // Get watcher
        const watcher = this.getWatcher(container);

        // Get dockerApi from watcher
        const { dockerApi } = watcher;

        // Get registry configuration
        logContainer.debug(`Get ${container.image.registry.name} registry manager`);
        const registry = getState().registry[container.image.registry.name];

        logContainer.debug(`Get ${container.image.registry.name} registry credentials`);
        const auth = registry.getAuthPull();

        // Rebuild image definition string
        const newImage = registry.getImageFullName(
            container.image,
            container.updateKind.remoteValue,
        );

        // Get current container
        const currentContainer = await this.getCurrentContainer(dockerApi, container);

        if (currentContainer) {
            const currentContainerSpec = await this.inspectContainer(
                currentContainer,
                logContainer,
            );
            const currentContainerState = currentContainerSpec.State;

            // Pull new image ahead of time
            await this.pullImage(dockerApi, auth, newImage, logContainer);

            // Dry-run?
            if (this.configuration.dryrun) {
                logContainer.info('Do not replace the existing container because dry-run mode is enabled');
            } else {
                // Clone current container spec
                const containerToCreateInspect = this.cloneContainer(
                    currentContainerSpec,
                    newImage,
                    logContainer,
                );

                // Stop current container
                if (currentContainerState.Running) {
                    await this.stopContainer(
                        currentContainer,
                        container.name,
                        container.id,
                        logContainer,
                    );
                }

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
                    containerToCreateInspect,
                    container.name,
                    logContainer,
                );

                // Start container if it was running
                if (currentContainerState.Running) {
                    await this.startContainer(newContainer, container.name, logContainer);
                }

                // Remove previous image
                if (this.configuration.prune) {
                    // Rebuild image definition string
                    const oldImage = registry.getImageFullName(
                        container.image,
                        container.image.tag.value,
                    );
                    await this.removeImage(dockerApi, oldImage);
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
