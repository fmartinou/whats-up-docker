const BasicStrategyWithSession = require('./BasicStrategyWithSession');

const basicStrategyWithSession = new BasicStrategyWithSession({}, () => {});

beforeEach(() => {
    basicStrategyWithSession.success = jest.fn();
    basicStrategyWithSession.fail = jest.fn();
});

test('_challenge should return appropriate Auth header', () => {
    // eslint-disable-next-line no-underscore-dangle
    expect(basicStrategyWithSession._challenge()).toEqual(401);
});

test('authenticate should return user from session if so', () => {
    basicStrategyWithSession.authenticate({ isAuthenticated: () => true });
    expect(basicStrategyWithSession.success).toHaveBeenCalled();
});

test('authenticate should call super.authenticate when no existing session', () => {
    const fail = jest.spyOn(basicStrategyWithSession, 'fail');
    basicStrategyWithSession.authenticate({ isAuthenticated: () => false, headers: {} });
    expect(fail).toHaveBeenCalled();
});
