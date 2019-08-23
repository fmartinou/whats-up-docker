const log = require('./log');
const store = require('./store');
const registry = require('./registry');

log.info('What\'s up, docker? is starting');

async function main() {
    // Init store
    await store.init();

    // Register triggers
    registry.registerTriggers();

    // Register watchers
    registry.registerWatchers();
}
main();


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
log.info(`What's up, doc? is listening on port ${port}`); */
