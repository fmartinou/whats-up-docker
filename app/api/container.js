const express = require('express');
const nocache = require('nocache');
const storeContainer = require('../store/container');
const registry = require('../registry');

const router = express.Router();

/**
 * Return registered controllers.
 * @returns {{id: string}[]}
 */
function getControllers() {
    return registry.getState().controller;
}

/**
 * Get containers from store.
 * @param query
 * @returns {*}
 */
function getContainersFromStore(query) {
    return storeContainer.getContainers(query);
}

/**
 * Get all (filtered) containers.
 * @param req
 * @param res
 */
function getContainers(req, res) {
    const { query } = req;
    res.status(200).json(getContainersFromStore(query));
}

/**
 * Get a container by id.
 * @param req
 * @param res
 */
function getContainer(req, res) {
    const { id } = req.params;
    const container = storeContainer.getContainer(id);
    if (container) {
        res.status(200).json(container);
    } else {
        res.sendStatus(404);
    }
}

/**
 * Delete a container by id.
 * @param req
 * @param res
 */
function deleteContainer(req, res) {
    const { id } = req.params;
    const container = storeContainer.getContainer(id);
    if (container) {
        storeContainer.deleteContainer(id);
        res.sendStatus(204);
    } else {
        res.sendStatus(404);
    }
}

/**
 * Watch all containers.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function watchContainers(req, res) {
    try {
        await Promise.all(Object.values(getControllers()).map((controller) => controller.watch()));
        getContainers(req, res);
    } catch (e) {
        res.status(500).json({
            error: `Error when watching images (${e.message})`,
        });
    }
}

/**
 * Watch an image.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function watchContainer(req, res) {
    const { id } = req.params;

    const container = storeContainer.getContainer(id);
    if (container) {
        const controller = getControllers()[`controller.docker.${container.controller}`];
        if (!controller) {
            res.status(500).json({
                error: `No provider found for container ${id} and provider ${container.controller}`,
            });
        } else {
            try {
                // Ensure container is still in store
                // (for cases where it has been removed before running an new watchAll)
                const containers = await controller.getContainers();
                const containerFound = containers
                    .find((containerInList) => containerInList.id === container.id);

                if (!containerFound) {
                    res.status(404).send();
                } else {
                    // Run watchContainer from the Provider
                    const containerReport = await controller.watchContainer(container);
                    res.status(200).json(containerReport.container);
                }
            } catch (e) {
                res.status(500).json({
                    error: `Error when watching container ${id} (${e.message})`,
                });
            }
        }
    } else {
        res.sendStatus(404);
    }
}

/**
 * Init Router.
 * @returns {*}
 */
function init() {
    router.use(nocache());
    router.get('/', getContainers);
    router.post('/watch', watchContainers);
    router.get('/:id', getContainer);
    router.delete('/:id', deleteContainer);
    router.post('/:id/watch', watchContainer);
    return router;
}

module.exports = {
    init,
    getContainersFromStore,
};
