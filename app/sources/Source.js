class Source {
    constructor(sourceConfiguration) {
        this.configuration = sourceConfiguration;
    }

    async fetch() {
        const images = await this.getImages();
        return Promise.all(images.map(this.findNewVersion));
    }

    async getImages() {
        throw new Error('Not implemented');
    }

    async findNewVersion() {
        throw new Error('Not implemented');
    }
}

module.exports = Source;
