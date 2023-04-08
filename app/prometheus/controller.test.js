const controller = require('./controller');

test('controller counter should be properly configured', () => {
    controller.init();
    const gauge = controller.getControlledContainerGauge();
    expect(gauge.name).toStrictEqual('wud_controller_total');
    expect(gauge.labelNames).toStrictEqual(['type', 'name']);
});
