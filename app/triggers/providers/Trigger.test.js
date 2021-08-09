const event = require('../../event');
const log = require('../../log');

jest.mock('../../log');
jest.mock('../../event');
jest.mock('../../prometheus/trigger', () => ({
    getTriggerCounter: () => ({
        inc: () => ({}),
    }),
}));

const Trigger = require('./Trigger');

beforeEach(() => {
    jest.resetAllMocks();
});

test('init should register to container new version event', async () => {
    const trigger = new Trigger();
    const spy = jest.spyOn(event, 'registerContainerNewVersion');
    await trigger.init();
    expect(spy).toHaveBeenCalled();
});

test('trigger should call notify method of the trigger', async () => {
    const trigger = new Trigger();
    trigger.log = log;
    trigger.log.child = () => log;
    await trigger.init();

    const spy = jest.spyOn(trigger, 'notify');
    await trigger.trigger({
        name: 'container1',
    });
    expect(spy).toHaveBeenCalledWith({
        name: 'container1',
    });
});

test('trigger should warn when notify method of the trigger fails', async () => {
    const trigger = new Trigger();
    trigger.log = log;
    trigger.log.child = () => log;
    trigger.notify = () => { throw new Error('Fail!!!'); };
    await trigger.init();
    const spyLog = jest.spyOn(log, 'warn');
    await trigger.trigger({});
    expect(spyLog).toHaveBeenCalledWith('Notify error from undefined.undefined.undefined (Fail!!!)');
});
