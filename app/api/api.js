const express = require('express');
const imageRouter = require('./image');
const watcherRouter = require('./watcher');
const triggerRouter = require('./trigger');
const logRouter = require('./log');
const storeRouter = require('./store');

/**
 * Init the API router.
 * @returns {*|Router}
 */
function init() {
    const router = express.Router();

    // Mount log router
    router.use('/log', logRouter.init());

    // Mount store router
    router.use('/store', storeRouter.init());

    // Mount images router
    router.use('/images', imageRouter.init());

    // Mount trigger router
    router.use('/triggers', triggerRouter.init());

    // Mount watcher router
    router.use('/watchers', watcherRouter.init());

    // All other API routes => 404
    router.get('/*', (req, res) => res.sendStatus(404));

    return router;
}

module.exports = {
    init,
};
