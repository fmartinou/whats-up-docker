const express = require('express');
const log = require('./log');
const { getPort } = require('./configuration');
const inputService = require('./inputService');
const outputService = require('./outputService');
const fetchService = require('./fetchService');

log.info('What\'s up, doc? is starting');

// Register inputs
const inputs = inputService.registerSources();

// Register outputs
outputService.registerOutputs();
/*
const app = express();

app.get('/api/images', (req, res) => {
    res.json([]);
});

app.post('/api/images', (req, res) => {
    fetchService.fetch(inputs);
    res.status(200).send();
});

const port = getPort();

app.listen(port, () => {
});
log.info(`What's up, doc? is listening on port ${port}`);*/

// Fetch at startup
fetchService.fetch(inputs);
