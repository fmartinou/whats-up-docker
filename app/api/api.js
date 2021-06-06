const express = require('express');
const appRouter = require('./app');
const containerRouter = require('./container');
const watcherRouter = require('./watcher');
const triggerRouter = require('./trigger');
const registryRouter = require('./registry');
const logRouter = require('./log');
const storeRouter = require('./store');

/**
 * Init the API router.
 * @returns {*|Router}
 */
function init() {
    const router = express.Router();

    // Mount app router
    router.use('/app', appRouter.init());

    // Mount log router
    router.use('/log', logRouter.init());

    // Mount store router
    router.use('/store', storeRouter.init());

    // Mount container router
    router.use('/containers', containerRouter.init());

    // Mount trigger router
    router.use('/triggers', triggerRouter.init());

    // Mount watcher router
    router.use('/watchers', watcherRouter.init());

    // Mount registry router
    router.use('/registries', registryRouter.init());

    // All other API routes => 404
    router.get('/*', (req, res) => res.sendStatus(404));

    return router;
}

module.exports = {
    init,
};
