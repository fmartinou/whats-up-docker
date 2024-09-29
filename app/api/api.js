const express = require('express');
const passport = require('passport');
const appRouter = require('./app');
const containerRouter = require('./container');
const watcherRouter = require('./watcher');
const triggerRouter = require('./trigger');
const registryRouter = require('./registry');
const authenticationRouter = require('./authentication');
const logRouter = require('./log');
const storeRouter = require('./store');
const serverRouter = require('./server');
const auth = require('./auth');

/**
 * Init the API router.
 * @returns {*|Router}
 */
function init() {
    const router = express.Router();

    // Mount app router
    router.use('/app', appRouter.init());

    // Routes to protect after this line
    router.use(passport.authenticate(auth.getAllIds()));

    // Mount log router
    router.use('/log', logRouter.init());

    // Mount store router
    router.use('/store', storeRouter.init());

    // Mount server router
    router.use('/server', serverRouter.init());

    // Mount container router
    router.use('/containers', containerRouter.init());

    // Mount trigger router
    router.use('/triggers', triggerRouter.init());

    // Mount watcher router
    router.use('/watchers', watcherRouter.init());

    // Mount registry router
    router.use('/registries', registryRouter.init());

    // Mount auth
    router.use('/authentications', authenticationRouter.init());

    // All other API routes => 404
    router.get('/*', (req, res) => res.sendStatus(404));

    return router;
}

module.exports = {
    init,
};
