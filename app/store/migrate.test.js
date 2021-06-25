const container = require('./container');

jest.mock('./container');

container.getContainers = () => ([{
    name: 'container1',
}, {
    name: 'container2',
}]);

const migrate = require('./migrate');

beforeEach(() => {
    jest.resetAllMocks();
});

test('migrate should create collection app when not exist', () => {
    const spy = jest.spyOn(container, 'deleteContainer');
    migrate.migrate(undefined, '2.0.0');
    expect(spy).toHaveBeenCalledTimes(2);
});
