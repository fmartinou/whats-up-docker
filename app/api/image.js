const express = require('express');
const nocache = require('nocache');
const store = require('../store');

const router = express.Router();

/**
 * Get all (filtered) images.
 * @param req
 * @param res
 */
function getImages(req, res) {
    const { query } = req;
    res.status(200).json(store.getImages(query));
}

/**
 * Get image by id.
 * @param req
 * @param res
 */
function getImage(req, res) {
    const { id } = req.params;
    const image = store.getImage(id);
    if (image) {
        res.status(200).json(image);
    } else {
        res.sendStatus(404);
    }
}

/**
 * Delete an image by id.
 * @param req
 * @param res
 */
function deleteImage(req, res) {
    const { id } = req.params;
    const image = store.getImage(id);
    if (image) {
        store.deleteImage(id);
        res.sendStatus(204);
    } else {
        res.sendStatus(404);
    }
}

function refreshImage(req, res) {
    const { id } = req.params;
    const image = store.getImage(id);
    if (image) {
        res.sendStatus(202);
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
    router.get('/', getImages);
    router.get('/:id', getImage);
    router.post('/:id/refresh', refreshImage);
    router.delete('/:id', deleteImage);
    return router;
}

module.exports = {
    init,
};
