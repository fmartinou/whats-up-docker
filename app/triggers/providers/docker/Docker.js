const Trigger = require('../Trigger');
const { getState } = require('../../../registry');

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
    async inspectContainer(container) {
        this.log.debug(`Inspect container ${container.Id}`);
        try {
            return await container.inspect();
        } catch (e) {
            this.log.warn(`Error when inspecting container ${container.id}`);
            throw e;
        }
    }

    /**
     * Pull new image.
     * @param dockerApi
     * @param auth
     * @param newImage
     * @returns {Promise<void>}
     */
    async pullImage(dockerApi, auth, newImage) {
        this.log.info(`Pull image ${newImage}`);
        try {
            await dockerApi.pull(newImage, auth);
            this.log.debug(`Image ${newImage} pulled with success`);
        } catch (e) {
            this.log.warn(`Error when pulling image ${newImage} (${e.message})`);
            throw e;
        }
    }

    /**
     * Stop a container.
     * @param container
     * @param containerName
     * @param containerId
     * @returns {Promise<void>}
     */
    async stopContainer(container, containerName, containerId) {
        this.log.info(`Stop container ${containerName} with id ${containerId}`);
        try {
            await container.stop();
            this.log.debug(`Container ${containerName} with id ${containerId} stopped with success`);
        } catch (e) {
            this.log.warn(`Error when stopping container ${containerName} with id ${containerId}`);
            throw e;
        }
    }

    /**
     * Remove a container.
     * @param container
     * @param containerName
     * @param containerId
     * @returns {Promise<void>}
     */
    async removeContainer(container, containerName, containerId) {
        this.log.info(`Remove container ${containerName} with id ${containerId}`);
        try {
            await container.remove();
            this.log.debug(`Container ${containerName} with id ${containerId} removed with success`);
        } catch (e) {
            this.log.warn(`Error when removing container ${containerName} with id ${containerId}`);
            throw e;
        }
    }

    /**
     * Create a new container.
     * @param dockerApi
     * @param containerToCreate
     * @param containerName
     * @returns {Promise<*>}
     */
    async createContainer(dockerApi, containerToCreate, containerName) {
        this.log.info(`Create container ${containerName}`);
        try {
            const newContainer = await dockerApi.createContainer(containerToCreate);
            this.log.debug(`Container ${containerName} recreated on image with success`);
            return newContainer;
        } catch (e) {
            this.log.warn(`Error when creating container ${containerName} (${e.message})`);
            throw e;
        }
    }

    /**
     * Start container.
     * @param container
     * @param containerName
     * @returns {Promise<void>}
     */
    async startContainer(container, containerName) {
        this.log.info(`Start container ${containerName}`);
        try {
            await container.start();
            this.log.debug(`Container ${containerName} started with success`);
        } catch (e) {
            this.log.warn(`Error when starting container ${containerName}`);
            throw e;
        }
    }

    /**
     * Remove an image.
     * @param dockerApi
     * @param imageToRemove
     * @returns {Promise<void>}
     */
    async removeImage(dockerApi, imageToRemove) {
        this.log.info(`Remove image ${imageToRemove}`);
        try {
            const image = await dockerApi.getImage(imageToRemove);
            await image.remove();
            this.log.debug(`Image ${imageToRemove} removed with success`);
        } catch (e) {
            this.log.warn(`Error when removing image ${imageToRemove}`);
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
        // Get watcher
        const watcher = this.getWatcher(container);

        // Get dockerApi from watcher
        const { dockerApi } = watcher;

        // Get registry configuration
        this.log.debug(`Get ${container.image.registry.name} registry manager`);
        const registry = getState().registry[container.image.registry.name];

        this.log.debug(`Get ${container.image.registry.name} registry credentials`);
        const auth = registry.getAuthPull();

        // Rebuild image definition string
        const newImage = registry.getImageFullName(
            container.image,
            container.updateKind.remoteValue,
        );

        // Get current container
        const currentContainer = await this.getCurrentContainer(dockerApi, container);

        if (currentContainer) {
            const currentContainerSpec = await this.inspectContainer(currentContainer);
            const currentContainerState = currentContainerSpec.State;

            // Pull new image ahead of time
            await this.pullImage(dockerApi, auth, newImage);

            // Clone current container spec
            const containerToCreateInspect = this.cloneContainer(currentContainerSpec, newImage);

            // Stop current container
            if (currentContainerState.Running) {
                await this.stopContainer(currentContainer, container.name, container.id);
            }

            // Remove current container
            await this.removeContainer(currentContainer, container.name, container.id);

            // Create new container
            const newContainer = await this.createContainer(
                dockerApi,
                containerToCreateInspect,
                container.name,
            );

            // Start container if it was running
            if (currentContainerState.Running) {
                await this.startContainer(newContainer, container.name);
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
        } else {
            this.log.warn(`Unable to update container ${container.name} with id ${container.id} because does not exist`);
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
