const {
    collectDefaultMetrics, register, Gauge, Counter, Summary,
} = require('prom-client');

/**
 * Start the Prometheus registry.
 */
function startRegistry() {
    collectDefaultMetrics();
}

/**
 * Return all metrics as string for Prometheus scrapping.
 * @returns {string}
 */
function output() {
    return register.metrics();
}

/**
 * Return a Prometheus Gauge.
 * @param configuration
 * @returns {Gauge<string>}
 */
function gauge(configuration) {
    return new Gauge(configuration);
}

/**
 * Return a Prometheus Counter.
 * @param configuration
 * @returns {Counter<string>}
 */
function counter(configuration) {
    return new Counter(configuration);
}

/**
 * Return a Prometheus Summary.
 * @param configuration
 * @returns {Summary<string>}
 */
function summary(configuration) {
    return new Summary(configuration);
}
module.exports = {
    startRegistry,
    output,
    gauge,
    counter,
    summary,
};
