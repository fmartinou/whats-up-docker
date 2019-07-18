const express = require('express');
const log = require('./log');
const { getPort } = require('../configuration');
const sourceService = require('./sourceService');
const triggerService = require('./triggerService');
const fetchService = require('./fetchService');

log.info('What\'s up, doc? is starting');

// Register sources
const sources = sourceService.registerSources();

// Register triggers
triggerService.registerTriggers();

const app = express();

app.get('/api/images', (req, res) => {
    res.json([]);
});

app.post('/api/images', (req, res) => {
    fetchService.fetch(sources);
    res.status(200).send();
});

const port = getPort();

app.listen(port, () => {
    log.info(`What's up, doc? is listening on port ${port}`);

    // Fetch at startup
    fetchService.fetch(sources);
});
