const envProp = require('env-dot-prop');

function getInputConfigurations() {
    return envProp.get('wut.inputs', {
        docker_sock: {
            type: 'docker',
            socketPath: '/var/run/docker.sock',
            watchByDefault: true,
        },
    }, {
        parse: true,
    });
}

function getOutputConfigurations() {
    return envProp.get('wut.outputs', {
        log: {
            type: 'log',
        },
    }, {
        parse: true,
    });
}

function getPort() {
    return envProp.get('wut.port', 3000);
}

module.exports = {
    getPort,
    getInputConfigurations,
    getOutputConfigurations,
};
