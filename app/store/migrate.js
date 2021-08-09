const log = require('../log').child({ component: 'store' });
const { getContainers, deleteContainer } = require('./container');

/**
 * Migrate from legacy unknown version.
 */
function migrateFromUndefined() {
    getContainers({}).forEach((container) => deleteContainer(container.id));
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
}

module.exports = {
    migrate,
};
