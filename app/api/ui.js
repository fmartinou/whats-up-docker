const express = require('express');
const moment = require('moment');
const imageRouter = require('./image');
const watcherRouter = require('./watcher');
const triggerRouter = require('./trigger');

/**
 * Init the UI router.
 * @returns {*|Router}
 */
function init() {
    const router = express.Router();

    // Mount UI
    router.get('/', (req, res) => res.redirect('/images'));

    router.get('/images', (req, res) => {
        res.render('images', {
            images: imageRouter.getImagesFromStore(req.query),
            moment,
        });
    });

    router.get('/watchers', (req, res) => {
        res.render('watchers', {
            watchers: watcherRouter.getAllWatchers(req.query),
            moment,
        });
    });

    router.get('/triggers', (req, res) => {
        res.render('triggers', {
            triggers: triggerRouter.getAllTriggers(req.query),
            moment,
        });
    });

    // Catch all and redirect to home page
    router.get('*', (req, res) => res.redirect('/'));

    return router;
}

module.exports = {
    init,
};
