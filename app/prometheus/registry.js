const { Summary, register } = require('prom-client');

let summaryGetTags;

function init() {
    // Replace summary if init is called more than once
    if (summaryGetTags) {
        register.removeSingleMetric(summaryGetTags.name);
    }
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
