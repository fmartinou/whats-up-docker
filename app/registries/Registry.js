const rp = require('request-promise-native');
const log = require('../log');
const Component = require('../registry/Component');
const { getSummaryTags } = require('../prometheus/registry');

/**
 * Docker Registry Abstract class.
 */
class Registry extends Component {
    /**
     * Encode Bse64(login:password)
     * @param login
     * @param token
     * @returns {string}
     */
    static base64Encode(login, token) {
        return Buffer.from(`${login}:${token}`, 'utf-8').toString('base64');
    }

    /**
     * Override getId to return the name only (hub, ecr...).
     * @returns {string}
     */
    getId() {
        return this.type;
    }

    /**
     * Override to apply custom format to the logger.
     */
    async register(kind, type, name, configuration) {
        this.log = log.child({ component: `${kind}.${type}` });
        this.kind = kind;
        this.type = type;
        this.name = name;

        this.configuration = this.validateConfiguration(configuration);
        this.log.info(`Register ${kind} with configuration ${JSON.stringify(this.maskConfiguration(configuration))}`);
        await this.init();
        return this;
    }

    /**
     * If this registry is responsible for the image (to be overridden).
     * @param image the image
     * @returns {boolean}
     */
    // eslint-disable-next-line no-unused-vars,class-methods-use-this
    match(image) {
        return false;
    }

    /**
     * Normalize image according to Registry Custom characteristics (to be overridden).
     * @param image
     * @returns {*}
     */
    // eslint-disable-next-line class-methods-use-this
    normalizeImage(image) {
        return image;
    }

    /**
     * Authenticate and set authentication value to requestOptions.
     * @param image
     * @param requestOptions
     * @returns {*}
     */
    // eslint-disable-next-line class-methods-use-this
    async authenticate(image, requestOptions) {
        return requestOptions;
    }

    /**
     * Get Tags.
     * @param image
     * @returns {*}
     */
    async getTags(image) {
        this.log.debug(`${this.getId()} - Get ${image.name} tags`);
        const tags = [];
        let page;
        let hasNext = true;
        while (hasNext) {
            const lastItem = page ? page.body.tags[page.body.tags.length - 1] : undefined;
            // eslint-disable-next-line no-await-in-loop
            page = await this.getTagsPage(image, lastItem);
            hasNext = page.headers.link !== undefined;
            tags.push(...page.body.tags);
        }

        // Sort alpha then reverse to get higher values first
        tags.sort();
        tags.reverse();
        return tags;
    }

    /**
     * Get tags page
     * @param image
     * @param lastItem
     * @returns {Promise<*>}
     */
    getTagsPage(image, lastItem = undefined) {
        // Default items per page (not honoured by all registries)
        const itemsPerPage = 1000;
        const last = lastItem ? `&last=${lastItem}` : '';
        return this.callRegistry({
            image,
            url: `${image.registry.url}/${image.name}/tags/list?n=${itemsPerPage}${last}`,
            resolveWithFullResponse: true,
        });
    }

    /**
     * Get image manifest for a remote tag.
     * @param image
     * @param digest (optional)
     * @returns {Promise<undefined|*>}
     */
    async getImageManifestDigest(image, digest) {
        const tagOrDigest = digest || image.tag.value;
        let manifestDigestFound;
        let manifestMediaType;
        this.log.debug(`${this.getId()} - Get ${image.name}:${tagOrDigest} manifest`);
        const responseManifests = await this.callRegistry({
            image,
            url: `${image.registry.url}/${image.name}/manifests/${tagOrDigest}`,
            headers: {
                Accept: 'application/vnd.docker.distribution.manifest.list.v2+json',
            },
        });
        if (responseManifests) {
            if (responseManifests.schemaVersion === 2) {
                if (responseManifests.mediaType === 'application/vnd.docker.distribution.manifest.list.v2+json') {
                    const manifestFound = responseManifests.manifests
                        .find((manifest) => manifest.platform.architecture === image.architecture
                            && manifest.platform.os === image.os
                            && manifest.platform.variant === image.variant);
                    if (manifestFound) {
                        manifestDigestFound = manifestFound.digest;
                        manifestMediaType = manifestFound.mediaType;
                    }
                } else if (responseManifests.mediaType === 'application/vnd.docker.distribution.manifest.v2+json') {
                    manifestDigestFound = responseManifests.config.digest;
                    manifestMediaType = responseManifests.config.mediaType;
                }
            } else if (responseManifests.schemaVersion === 1) {
                const v1Compat = JSON.parse(responseManifests.history[0].v1Compatibility);
                return {
                    digest: v1Compat.config ? v1Compat.config.Image : undefined,
                    created: v1Compat.created,
                    version: 1,
                };
            }
            if (manifestDigestFound && manifestMediaType === 'application/vnd.docker.distribution.manifest.v2+json') {
                const responseManifest = await this.callRegistry({
                    image,
                    method: 'head',
                    url: `${image.registry.url}/${image.name}/manifests/${manifestDigestFound}`,
                    headers: {
                        Accept: manifestMediaType,
                    },
                    resolveWithFullResponse: true,
                });
                return {
                    digest: responseManifest.headers['docker-content-digest'],
                    version: 2,
                };
            }
            if (manifestDigestFound && manifestMediaType === 'application/vnd.docker.container.image.v1+json') {
                return {
                    digest: manifestDigestFound,
                    version: 1,
                };
            }
        }
        // Empty result...
        throw new Error('Unexpected error; no manifest found');
    }

    async callRegistry({
        image,
        url,
        method = 'get',
        headers = {
            Accept: 'application/json',
        },
        resolveWithFullResponse = false,
    }) {
        const start = new Date().getTime();

        // Request options
        const getRequestOptions = {
            uri: url,
            method,
            headers,
            json: true,
            resolveWithFullResponse,
        };

        const getRequestOptionsWithAuth = await this.authenticate(image, getRequestOptions);
        const response = await rp(getRequestOptionsWithAuth);
        const end = new Date().getTime();
        getSummaryTags().observe({ type: this.type, name: this.name }, (end - start) / 1000);
        return response;
    }
}

module.exports = Registry;
