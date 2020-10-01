const express = require('express');
const nocache = require('nocache');
const { output } = require('../prometheus');

/**
 * Prometheus Metrics router.
 * @type {Router}
 */
const router = express.Router();

/**
 * Return Prometheus Metrics as String.
 * @param req
 * @param res
 */
function outputMetrics(req, res) {
    res.status(200).type('text').send(output());
}

/**
 * Init Router.
 * @returns {*}
 */
function init() {
    router.use(nocache());
    router.get('/', outputMetrics);
    return router;
}

module.exports = {
    init,
};
