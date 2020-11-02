const { Counter } = require('prom-client');

let triggerCounter;

function init() {
    triggerCounter = new Counter({
        name: 'wud_trigger_count',
        help: 'Total count of trigger events',
        labelNames: ['type', 'name', 'status'],
    });
}

function getTriggerCounter() {
    return triggerCounter;
}

module.exports = {
    init,
    getTriggerCounter,
};
