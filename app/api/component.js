const express = require('express');
const nocache = require('nocache');

function mapComponentToItem(key, component) {
    return {
        id: key,
        ...component,
    };
}

/**
 * Return a list instead of a map.
 * @param list
 * @returns {{id: string}[]}
 */
function mapComponentsToList(list) {
    return Object.keys(list).map((key) => mapComponentToItem(key, list[key]));
}

/**
 * Get all components.
 * @param req
 * @param res
 */
function getAll(req, res, list) {
    res.status(200).json(mapComponentsToList(list));
}

function getById(req, res, list) {
    const { id } = req.params;
    const component = list[id];
    if (component) {
        res.status(200).json(mapComponentToItem(id, component));
    } else {
        res.sendStatus(404);
    }
}

function init(list) {
    const router = express.Router();
    router.use(nocache());
    router.get('/', (req, res) => getAll(req, res, list));
    router.get('/:id', (req, res) => getById(req, res, list));
    return router;
}

module.exports = {
    init,
};
