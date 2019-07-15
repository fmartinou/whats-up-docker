const express = require('express');

const log = require('./util/log');
const dockerSourceService = require('./services/sources/docker');
const dockerVersionService = require('./services/versions/docker');
const configuration = require('./util/configuration');

// In memory results
let images;

async function fetch() {
    log.info('Start fetching');
    const imagesFound = await dockerSourceService.getImages();
    const promises = imagesFound.map(image => dockerVersionService.findNewVersion(image));
    const results = await Promise.all(promises);
    log.info('Stop fetching');
    images = {
        last_fetch: new Date(),
        results,
    };
}

const app = express();

app.get('/api/images', (req, res) => {
    res.json(images);
});

app.post('/api/images', (req, res) => {
    fetch();
    res.status(200).send();
});

app.listen(3000, () => {
    log.info('What\'s up, doc?  is listening on port 3000');
});
