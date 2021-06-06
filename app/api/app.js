const express = require('express');
const nocache = require('nocache');
const storeApp = require('../store/app');

/**
 * App infos router.
 * @type {Router}
 */
const router = express.Router();

/**
 * Get app infos.
 * @param req the request
 * @param res the response
 */
function getAppInfos(req, res) {
    res.status(200).json(storeApp.getAppInfos());
}
/**
 * Init Router.
 * @returns {*}
 */
function init() {
    router.use(nocache());
    router.get('/', getAppInfos);
    return router;
}

module.exports = {
    init,
};
