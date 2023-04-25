/**
 * Container store.
 */
const { byString, byValue } = require('sort-es');
const log = require('../log').child({ component: 'store' });
const { validate: validateContainer } = require('../model/container');
const {
    emit,
    EVENT_CONTAINER_ADDED,
    EVENT_CONTAINER_UPDATED,
    EVENT_CONTAINER_REMOVED,
} = require('./event');

let containers;

/**
 * Create container collections.
 * @param db
 */
function createCollections(db) {
    containers = db.getCollection('containers');
    if (containers === null) {
        log.info('Create Collection containers');
        containers = db.addCollection('containers');
    }
}

/**
 * Get all (filtered) containers.
 * @param query
 * @returns {*}
 */
function getContainers(query = {}) {
    const filter = {};
    Object.keys(query).forEach((key) => {
        filter[`data.${key}`] = query[key];
    });
    if (!containers) {
        return [];
    }
    const containerList = containers.find(filter).map((item) => validateContainer(item.data));
    return containerList.sort(
        byValue((container) => container.name, byString()),
    );
}

/**
 * Get container by id.
 * @param id
 * @returns {null|Image}
 */
function getContainer(id) {
    const container = containers.findOne({
        'data.id': id,
    });

    if (container !== null) {
        return validateContainer(container.data);
    }
    return undefined;
}

/**
 * Update existing container.
 * @param container
 */
function updateContainer(container) {
    const containerToReturn = validateContainer(container);
    const doesExist = getContainer(container.id) !== undefined;
    let event = EVENT_CONTAINER_ADDED;
    if (doesExist) {
        containers.chain().find({
            'data.id': container.id,
        }).remove();
        event = EVENT_CONTAINER_UPDATED;
    }
    containers.insert({
        data: containerToReturn,
    });
    emit({ event, data: containerToReturn });
    return containerToReturn;
}

/**
 * Delete container by id.
 * @param id
 */
function deleteContainer(id) {
    const container = getContainer(id);
    if (container) {
        containers.chain().find({
            'data.id': id,
        }).remove();
        emit({ event: EVENT_CONTAINER_REMOVED, data: container });
    }
}

module.exports = {
    createCollections,
    updateContainer,
    getContainers,
    getContainer,
    deleteContainer,
};
