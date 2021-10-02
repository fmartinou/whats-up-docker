const fs = require('fs/promises');
const yaml = require('yaml');
const Trigger = require('../docker/Docker');
const { getState } = require('../../../registry');

/**
 * Read docker-compose file.
 * @returns {Promise<any>}
 */
async function getComposeFile(file) {
    try {
        const composeFileBuffer = await fs.readFile(file);
        return yaml.parse(composeFileBuffer.toString());
    } catch (e) {
        this.log.error(`File not found (${file})`);
        throw e;
    }
}

/**
 * Update a Docker compose stack with an updated one.
 */
class Dockercompose extends Trigger {
    /**
     * Get the Trigger configuration schema.
     * @returns {*}
     */
    getConfigurationSchema() {
        const schemaDocker = super.getConfigurationSchema();
        return schemaDocker.append({
            file: this.joi.string().required(),
            backup: this.joi.boolean().default(false),
        });
    }

    initTrigger() {
        // Force mode=batch to avoid docker-compose concurrent operations
        this.configuration.mode = 'batch';
    }

    /**
     * Only implement notifyBatch.
     * @param container
     * @returns {Promise<*>}
     */
    // eslint-disable-next-line class-methods-use-this,no-unused-vars
    async trigger(container) {
        throw new Error('This trigger does not support "single" mode');
    }

    /**
     * Update the compose stack.
     * @param containers the containers
     * @returns {Promise<void>}
     */
    async triggerBatch(containers) {
        const compose = await getComposeFile(this.configuration.file);
        let composeUpdated = compose;

        // Filter on containers running on local host
        const containersFiltered = containers.filter((container) => {
            const watcher = this.getWatcher(container);
            if (watcher.dockerApi.modem.socketPath !== '') {
                return true;
            }
            this.log.warn(`Cannot update container ${container.name} because not running on local host`);
            return false;
        });

        containersFiltered.forEach((container) => {
            composeUpdated = this.updateService(compose, container);
        });

        // Backup docker-compose file
        if (this.configuration.backup) {
            const backupFile = `${this.configuration.file}.back`;
            await this.backup(this.configuration.file, backupFile);
        }

        // Write docker-compose.yml file back
        await this.writeComposeFile(this.configuration.file, yaml.stringify(composeUpdated));

        // Update all containers
        await Promise.all(containersFiltered.map((container) => super.notify(container)));
    }

    /**
     * Backup a file.
     * @param file
     * @param backupFile
     * @returns {Promise<void>}
     */
    async backup(file, backupFile) {
        try {
            this.log.debug(`Backup ${file} as ${backupFile}`);
            await fs.copyFile(file, backupFile);
        } catch (e) {
            this.log.warn(`Error when trying to backup file ${file} to ${backupFile}`);
        }
    }

    updateService(compose, container) {
        const composeUpdated = compose;
        // Get registry configuration
        this.log.debug(`Get ${container.image.registry.name} registry manager`);
        const registry = getState().registry[container.image.registry.name];

        // Rebuild image definition string
        const currentImage = registry.getImageFullName(
            container.image,
            container.image.tag.value,
        );

        const serviceKeyToUpdate = Object.keys(composeUpdated.services).find((serviceKey) => {
            const service = composeUpdated.services[serviceKey];
            return service.image.includes(currentImage);
        });

        // Rebuild image definition string
        const newImage = registry.getImageFullName(
            container.image,
            container.updateKind.remoteValue,
        );

        if (serviceKeyToUpdate) {
            composeUpdated.services[serviceKeyToUpdate].image = newImage;
        }
        return composeUpdated;
    }

    /**
     * Write docker-compose file.
     * @param file
     * @param data
     * @returns {Promise<void>}
     */
    async writeComposeFile(file, data) {
        try {
            await fs.writeFile(file, data);
        } catch (e) {
            this.log.error(`Error when writing ${file} (${e.message})`);
            this.log.debug(e);
        }
    }
}

module.exports = Dockercompose;
