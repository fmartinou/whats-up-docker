const express = require('express');
const nocache = require('nocache');
const healthcheck = require('express-healthcheck');

/**
 * Prometheus Metrics router.
 * @type {Router}
 */
const router = express.Router();

/**
 * Init Router.
 * @returns {*}
 */
function init() {
    router.use(nocache());
    router.get('/', healthcheck());
    return router;
}

module.exports = {
    init,
};
