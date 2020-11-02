const { Summary } = require('prom-client');

let summaryGetTags;

function init() {
    summaryGetTags = new Summary({
        name: 'wud_registry_response',
        help: 'The Registry response time (in second)',
        labelNames: ['type', 'name'],
    });
}

function getSummaryTags() {
    return summaryGetTags;
}

module.exports = {
    init,
    getSummaryTags,
};
