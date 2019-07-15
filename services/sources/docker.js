const { Docker } = require('node-docker-api');
const parse = require('docker-parse-image');

const docker = new Docker({
    socketPath: '/var/run/docker.sock',
});

async function getImages() {
    const containers = await docker.container.list();
    const images = containers.map((container) => {
        const parsedImage = parse(container.data.Image);
        return {
            registry: parsedImage.registry || 'https://hub.docker.com',
            organization: parsedImage.namespace || 'library',
            image: parsedImage.repository,
            version: parsedImage.tag || 'latest',
        };
    });
    return images;
}

module.exports = {
    getImages,
};
