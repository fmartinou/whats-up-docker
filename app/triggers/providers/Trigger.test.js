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
    trigger.configuration = {
        threshold: 'all',
    };
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
    trigger.configuration = {
        threshold: 'all',
    };
    trigger.notify = () => { throw new Error('Fail!!!'); };
    await trigger.init();
    const spyLog = jest.spyOn(log, 'warn');
    await trigger.trigger({});
    expect(spyLog).toHaveBeenCalledWith('Error (Fail!!!)');
});

test('isThresholdReached should return true when threshold is all', async () => {
    const trigger = new Trigger();
    trigger.configuration = {
        threshold: 'all',
    };
    expect(trigger.isThresholdReached({})).toBeTruthy();
});

test('isThresholdReached should return true when threshold is major and change is a major or a minor or a patch', async () => {
    const trigger = new Trigger();
    trigger.configuration = {
        threshold: 'major',
    };
    expect(trigger.isThresholdReached({
        updateKind: {
            kind: 'tag',
            semverDiff: 'major',
        },
    })).toBeTruthy();
    expect(trigger.isThresholdReached({
        updateKind: {
            kind: 'tag',
            semverDiff: 'minor',
        },
    })).toBeTruthy();
    expect(trigger.isThresholdReached({
        updateKind: {
            kind: 'tag',
            semverDiff: 'patch',
        },
    })).toBeTruthy();
});

test('isThresholdReached should return true when threshold is minor and change is a minor or a patch', async () => {
    const trigger = new Trigger();
    trigger.configuration = {
        threshold: 'minor',
    };
    expect(trigger.isThresholdReached({
        updateKind: {
            kind: 'tag',
            semverDiff: 'major',
        },
    })).toBeFalsy();
    expect(trigger.isThresholdReached({
        updateKind: {
            kind: 'tag',
            semverDiff: 'minor',
        },
    })).toBeTruthy();
    expect(trigger.isThresholdReached({
        updateKind: {
            kind: 'tag',
            semverDiff: 'patch',
        },
    })).toBeTruthy();
});

test('isThresholdReached should return true when threshold is patch and change is a patch', async () => {
    const trigger = new Trigger();
    trigger.configuration = {
        threshold: 'patch',
    };
    expect(trigger.isThresholdReached({
        updateKind: {
            kind: 'tag',
            semverDiff: 'major',
        },
    })).toBeFalsy();
    expect(trigger.isThresholdReached({
        updateKind: {
            kind: 'tag',
            semverDiff: 'minor',
        },
    })).toBeFalsy();
    expect(trigger.isThresholdReached({
        updateKind: {
            kind: 'tag',
            semverDiff: 'patch',
        },
    })).toBeTruthy();
});

test('isThresholdReached should return true when there is no semverDiff regardless of the threshold', async () => {
    const trigger = new Trigger();
    trigger.configuration = {
        threshold: 'all',
    };
    expect(trigger.isThresholdReached({
        updateKind: { kind: 'digest' },
    })).toBeTruthy();
});
