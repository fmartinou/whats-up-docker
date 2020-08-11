const express = require('express');
const nocache = require('nocache');
const { getLogLevel } = require('../configuration');

const router = express.Router();

/**
 * Get log infos.
 * @param req
 * @param res
 */
function getLog(req, res) {
    res.status(200).json({
        level: getLogLevel(),
    });
}

/**
 * Init Router.
 * @returns {*}
 */
function init() {
    router.use(nocache());
    router.get('/', getLog);
    return router;
}

module.exports = {
    init,
};
