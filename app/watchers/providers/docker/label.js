/**
 * WUD supported Docker labels.
 */
module.exports = {

    /**
     * Should the container be tracked? (true | false).
     */
    wudWatch: 'wud.watch',

    /**
     * Optional regex indicating what tags to consider.
     */
    wudTagInclude: 'wud.tag.include',

    /**
     * Optional regex indicating what tags to not consider.
     */
    wudTagExclude: 'wud.tag.exclude',

    /**
     * Optional transform function to apply to the tag.
     */
    wudTagTransform: 'wud.tag.transform',

    /**
     * Should container digest be tracked? (true | false).
     */
    wudWatchDigest: 'wud.watch.digest',

    /**
     * Optional templated string pointing to a browsable link.
     */
    wudLinkTemplate: 'wud.link.template',

    /**
     * Optional friendly name to display.
     */
    wudDisplayName: 'wud.display.name',

    /**
     * Optional friendly icon to display.
     */
    wudDisplayIcon: 'wud.display.icon',

    /**
     * Optional Lookup registry url (can be useful when pulling containers from a registry cache)
     */
    wudRegistryLookupUrl: 'wud.registry.lookup.url',

};
