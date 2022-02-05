const log = require('../log').child({ component: 'store' });
const { getContainers, deleteContainer, updateContainer } = require('./container');

/**
 * Migrate from legacy unknown version.
 */
function migrateFromUndefined() {
    getContainers({}).forEach((container) => deleteContainer(container.id));
}

/**
 * Add displayName & displayIcon if missing.
 */
function addDisplayNameAndIcon() {
    getContainers({}).forEach((container) => {
        const containerMigrated = {
            ...container,
        };
        if (container.displayName === undefined) {
            containerMigrated.displayName = container.name;
        }
        if (container.displayIcon === undefined) {
            containerMigrated.displayIcon = 'mdi-docker';
        }
        updateContainer(containerMigrated);
    });
}

/**
 * Data migration function.
 * @param from version
 * @param to version
 */
function migrate(from, to) {
    log.info(`Migrate data from version ${from} to version ${to}`);
    if (from === undefined) {
        migrateFromUndefined();
    }

    addDisplayNameAndIcon();
}

module.exports = {
    migrate,
};
