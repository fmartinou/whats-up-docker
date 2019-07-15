const envProp = require('env-dot-prop');

function getSourceConfigurations() {
    return envProp.get('wut.sources', {
        docker_sock: {
            type: 'docker',
            socketPath: '/var/run/docker.sock',
            watchByDefault: true,
        },
    }, {
        parse: true,
    });
}

function getTriggerConfigurations() {
    return envProp.get('wut.triggers', {
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
    getSourceConfigurations,
    getTriggerConfigurations,
};
