const { byValues, byString } = require('sort-es');

const express = require('express');
const nocache = require('nocache');

/**
 * Map a Component to a displayable (api/ui) item.
 * @param key
 * @param component
 * @returns {{id: *}}
 */
function mapComponentToItem(key, component) {
    return {
        id: key,
        type: component.type,
        name: component.name,
        configuration: component.maskConfiguration(),
    };
}

/**
 * Return a list instead of a map.
 * @param listFunction
 * @returns {{id: string}[]}
 */
function mapComponentsToList(listFunction) {
    return Object.keys(listFunction())
        .map((key) => mapComponentToItem(key, listFunction()[key]))
        .sort(byValues([
            [(x) => x.type, byString()],
            [(x) => x.name, byString()],
        ]));
}

/**
 * Get all components.
 * @param req
 * @param res
 */
function getAll(req, res, listFunction) {
    res.status(200).json(mapComponentsToList(listFunction));
}

/**
 * Get a component by id.
 * @param req
 * @param res
 * @param listFunction
 */
function getById(req, res, listFunction) {
    const { id } = req.params;
    const component = listFunction()[id];
    if (component) {
        res.status(200).json(mapComponentToItem(id, component));
    } else {
        res.sendStatus(404);
    }
}

/**
 * Init the component router.
 * @param listFunction
 * @returns {*|Router}
 */
function init(listFunction) {
    const router = express.Router();
    router.use(nocache());
    router.get('/', (req, res) => getAll(req, res, listFunction));
    router.get('/:id', (req, res) => getById(req, res, listFunction));
    return router;
}

module.exports = {
    init,
    mapComponentsToList,
};
