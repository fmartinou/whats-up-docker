const event = require('./index');

test('an event should be emitted when a container is added', () => {
    expect.assertions(1);
    event.registerContainerAdded((container) => {
        expect(container).toStrictEqual({ x: 'x' });
    });
    event.emitContainerAdded({ x: 'x' });
});

test('an event should be emitted when a container is updated', () => {
    expect.assertions(1);
    event.registerContainerUpdated((container) => {
        expect(container).toStrictEqual({ x: 'x' });
    });
    event.emitContainerUpdated({ x: 'x' });
});

test('an event should be emitted when a container is removed', () => {
    expect.assertions(1);
    event.registerContainerRemoved((container) => {
        expect(container).toStrictEqual({ x: 'x' });
    });
    event.emitContainerRemoved({ x: 'x' });
});

test('an event should be emitted when there is a new version', () => {
    expect.assertions(1);
    event.registerContainerReport((container) => {
        expect(container).toStrictEqual({ x: 'x' });
    });
    event.emitContainerReport({ x: 'x' });
});
