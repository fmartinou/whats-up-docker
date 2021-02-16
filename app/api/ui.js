const path = require('path');
const express = require('express');
const moment = require('moment');
const imageRouter = require('./image');
const watcherRouter = require('./watcher');
const triggerRouter = require('./trigger');
const registryRouter = require('./registry');

/**
 * Init the UI router.
 * @returns {*|Router}
 */
function init() {
    const router = express.Router();

    router.get('/', (req, res) => res.redirect('/images'));

    router.get('/images', (req, res) => {
        res.render('images', {
            images: imageRouter.getImagesFromStore(req.query),
            moment,
        });
    });

    router.get('/watchers', (req, res) => {
        res.render('watchers', {
            watchers: watcherRouter.getAllWatchers(),
            moment,
        });
    });

    router.get('/triggers', (req, res) => {
        res.render('triggers', {
            triggers: triggerRouter.getAllTriggers(),
            moment,
        });
    });

    router.get('/registries', (req, res) => {
        res.render('registries', {
            registries: registryRouter.getAllRegistries(),
            moment,
        });
    });

    // Serve static assets
    router.use('/static', express.static(path.join(__dirname, '..', 'views', 'static')));

    // Catch all and redirect to home page
    router.get('*', (req, res) => res.redirect('/'));

    return router;
}

module.exports = {
    init,
};
