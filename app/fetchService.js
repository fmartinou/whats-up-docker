const log = require('./log');
const triggerService = require('./triggerService');

async function fetch(sources) {
    log.info('Start fetching');

    // Fetch all images on on all sources
    const sourceResults = await Promise.all(sources.map(source => source.fetch()));

    // Flatten results
    const results = [].concat(...sourceResults);

    results.forEach((result) => {
        triggerService.emit(result);
    });

    log.info('Stop fetching');

    return results;
}

module.exports = {
    fetch,
};
