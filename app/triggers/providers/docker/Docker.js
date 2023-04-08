const parse = require('parse-docker-image-name');
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
     * Get controller responsible for the container.
     * @param container
     * @returns {*}
     */
    // eslint-disable-next-line class-methods-use-this
    getController(container) {
        return getState().controller[`controller.docker.${container.controller}`];
    }


    /**
     * Update the container.
     * @param container the container
     * @returns {Promise<void>}
     */
    async trigger(container) {
        // Child logger for the container to process
        const logContainer = this.log.child({ container: fullName(container) });

        // Get controller
        const controller = this.getController(container);

        // Get dockerApi from controller
        const { dockerApi } = controller;

        // Get registry configuration
        logContainer.debug(`Get ${container.image.registry.name} registry manager`);
        const registry = getState().registry[container.image.registry.name];

        logContainer.debug(`Get ${container.image.registry.name} registry credentials`);
        const auth = registry.getAuthPull();

        // Rebuild image definition string
        const newImage = this.getNewImageFullName(registry, container);

        // Get current container
        const currentContainer = await this.getCurrentContainer(dockerApi, container);

        if (currentContainer) {
            const currentContainerSpec = await this.inspectContainer(
                currentContainer,
                logContainer,
            );
            const currentContainerState = currentContainerSpec.State;

            // Try to remove previous pulled images
            if (this.configuration.prune) {
                await this.pruneImages(
                    dockerApi,
                    registry,
                    container,
                    logContainer,
                );
            }

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
