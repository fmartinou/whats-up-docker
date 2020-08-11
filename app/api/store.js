const express = require('express');
const nocache = require('nocache');
const store = require('../store');

const router = express.Router();

/**
 * Get store infos.
 * @param req
 * @param res
 */
function getStore(req, res) {
    res.status(200).json({
        configuration: store.getConfiguration(),
    });
}

/**
 * Init Router.
 * @returns {*}
 */
function init() {
    router.use(nocache());
    router.get('/', getStore);
    return router;
}

module.exports = {
    init,
};
