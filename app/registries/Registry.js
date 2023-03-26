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
        this.log.info(`Register with configuration ${JSON.stringify(this.maskConfiguration(configuration))}`);
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
        let link;
        while (hasNext) {
            const lastItem = page ? page.body.tags[page.body.tags.length - 1] : undefined;
            // eslint-disable-next-line no-await-in-loop
            page = await this.getTagsPage(image, lastItem, link);
            const pageTags = page.body.tags ? page.body.tags : [];
            link = page.headers.link;
            hasNext = page.headers.link !== undefined;
            tags.push(...pageTags);
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
                Accept: 'application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.index.v1+json',
            },
        });
        if (responseManifests) {
            log.debug(`Found manifests [${JSON.stringify(responseManifests)}]`);
            if (responseManifests.schemaVersion === 2) {
                log.debug('Manifests found with schemaVersion = 2');
                log.debug(`Manifests media type detected [${responseManifests.mediaType}]`);
                if (responseManifests.mediaType === 'application/vnd.docker.distribution.manifest.list.v2+json' || responseManifests.mediaType === 'application/vnd.oci.image.index.v1+json') {
                    log.debug(`Filter manifest for [arch=${image.architecture}, os=${image.os}, variant=${image.variant}]`);
                    let manifestFound;
                    const manifestFounds = responseManifests.manifests
                        .filter((manifest) => manifest.platform.architecture === image.architecture
                            && manifest.platform.os === image.os);

                    // 1 manifest matching al least? Get the first one (better than nothing)
                    if (manifestFounds.length > 0) {
                        [manifestFound] = manifestFounds;
                    }

                    // Multiple matching manifests? Try to refine using variant filtering
                    if (manifestFounds.length > 1) {
                        const manifestFoundFilteredOnVariant = manifestFounds
                            .find((manifest) => manifest.platform.variant === image.variant);

                        // Manifest exactly matching with variant? Select it
                        if (manifestFoundFilteredOnVariant) {
                            manifestFound = manifestFoundFilteredOnVariant;
                        }
                    }

                    if (manifestFound) {
                        log.debug(`Manifest found with [digest=${manifestFound.digest}, mediaType=${manifestFound.mediaType}]`);
                        manifestDigestFound = manifestFound.digest;
                        manifestMediaType = manifestFound.mediaType;
                    }
                } else if (responseManifests.mediaType === 'application/vnd.docker.distribution.manifest.v2+json' || responseManifests.mediaType === 'application/vnd.oci.image.manifest.v1+json') {
                    log.debug(`Manifest found with [digest=${responseManifests.config.digest}, mediaType=${responseManifests.config.mediaType}]`);
                    manifestDigestFound = responseManifests.config.digest;
                    manifestMediaType = responseManifests.config.mediaType;
                }
            } else if (responseManifests.schemaVersion === 1) {
                log.debug('Manifests found with schemaVersion = 1');
                const v1Compat = JSON.parse(responseManifests.history[0].v1Compatibility);
                const manifestFound = {
                    digest: v1Compat.config ? v1Compat.config.Image : undefined,
                    created: v1Compat.created,
                    version: 1,
                };
                log.debug(`Manifest found with [digest=${manifestFound.digest}, created=${manifestFound.created}, version=${manifestFound.version}]`);
                return manifestFound;
            }
            if ((manifestDigestFound && manifestMediaType === 'application/vnd.docker.distribution.manifest.v2+json') || (manifestDigestFound && manifestMediaType === 'application/vnd.oci.image.manifest.v1+json')) {
                log.debug('Calling registry to get docker-content-digest header');
                const responseManifest = await this.callRegistry({
                    image,
                    method: 'head',
                    url: `${image.registry.url}/${image.name}/manifests/${manifestDigestFound}`,
                    headers: {
                        Accept: manifestMediaType,
                    },
                    resolveWithFullResponse: true,
                });
                const manifestFound = {
                    digest: responseManifest.headers['docker-content-digest'],
                    version: 2,
                };
                log.debug(`Manifest found with [digest=${manifestFound.digest}, version=${manifestFound.version}]`);
                return manifestFound;
            }
            if ((manifestDigestFound && manifestMediaType === 'application/vnd.docker.container.image.v1+json') || (manifestDigestFound && manifestMediaType === 'application/vnd.oci.image.config.v1+json')) {
                const manifestFound = {
                    digest: manifestDigestFound,
                    version: 1,
                };
                log.debug(`Manifest found with [digest=${manifestFound.digest}, version=${manifestFound.version}]`);
                return manifestFound;
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

    // eslint-disable-next-line class-methods-use-this
    getImageFullName(image, tagOrDigest) {
        // digests are separated with @ whereas tags are separated with :
        const tagOrDigestWithSeparator = tagOrDigest.indexOf(':') !== -1 ? `@${tagOrDigest}` : `:${tagOrDigest}`;
        let fullName = `${image.registry.url}/${image.name}${tagOrDigestWithSeparator}`;

        fullName = fullName.replace(/https?:\/\//, '');
        fullName = fullName.replace(/\/v2/, '');
        return fullName;
    }

    /**
     * Return {username, pass } or undefined.
     * @returns {}
     */
    // eslint-disable-next-line class-methods-use-this
    getAuthPull() {
        return undefined;
    }
}

module.exports = Registry;
