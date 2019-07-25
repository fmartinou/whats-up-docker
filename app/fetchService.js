const log = require('./log');
const triggerService = require('./outputService');

async function fetch(inputs) {
    log.info('Start fetching');

    // Fetch all images on on all sources
    const inputResults = await Promise.all(inputs.map(input => input.fetch()));

    // Flatten results
    const results = [].concat(...inputResults);

    results.forEach((result) => {
        triggerService.emit(result);
    });

    log.info('Stop fetching');

    return results;
}

module.exports = {
    fetch,
};
