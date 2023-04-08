const { Gauge, register } = require('prom-client');

let controlledContainerGauge;

function init() {
    // Replace gauge if init is called more than once
    if (controlledContainerGauge) {
        register.removeSingleMetric(controlledContainerGauge.name);
    }
    controlledContainerGauge = new Gauge({
        name: 'wud_controller_total',
        help: 'The number of controlled containers',
        labelNames: ['type', 'name'],
    });
}

function getControlledContainerGauge() {
    return controlledContainerGauge;
}

module.exports = {
    init,
    getControlledContainerGauge,
};
