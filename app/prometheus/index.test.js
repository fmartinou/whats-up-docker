const { Counter, Gauge, Summary } = require('prom-client');
const prometheus = require('./index');

test('counter should return a prometheus counter', () => {
    expect(prometheus.counter({ name: 'counter', help: 'help' })).toBeInstanceOf(Counter);
});

test('gauge should return a prometheus gauge', () => {
    expect(prometheus.gauge({ name: 'gauge', help: 'help' })).toBeInstanceOf(Gauge);
});

test('summary should return a prometheus summary', () => {
    expect(prometheus.summary({ name: 'summary', help: 'help' })).toBeInstanceOf(Summary);
});

test('output should return a prometheus metrics string', () => {
    prometheus.counter({ name: 'test', help: 'help' });
    expect(prometheus.output()).toContain('# HELP test help');
});

test('startRegistry should collect default metrics', () => {
    prometheus.startRegistry();
    expect(prometheus.output()).toContain('process_cpu_user_seconds_total');
    expect(prometheus.output()).toContain('nodejs_eventloop_lag_seconds');
});
