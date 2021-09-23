/**
 * Semver utils.
 */
const semver = require('semver');

/**
 * Parse a string to a semver (return null is it cannot be parsed as a valid semver).
 * @param rawVersion
 * @returns {*|SemVer}
 */
function parse(rawVersion) {
    const rawVersionCleaned = semver.clean(rawVersion);
    const rawVersionSemver = semver.parse(rawVersionCleaned);
    // Hurrah!
    if (rawVersionSemver !== null) {
        return rawVersionSemver;
    }
    // Last chance; try to coerce (all data behind patch digit will be lost).
    return semver.coerce(rawVersion);
}

/**
 * Return true if version1 is semver greater than version2.
 * @param version1
 * @param version2
 */
function isGreater(version1, version2) {
    const version1Semver = parse(version1);
    const version2Semver = parse(version2);

    // No comparison possible
    if (version1Semver === null || version2Semver === null) {
        return false;
    }
    return semver.gte(version1Semver, version2Semver);
}

/**
 * Diff between 2 semver versions.
 * @param version1
 * @param version2
 * @returns {*|string|null}
 */
function diff(version1, version2) {
    const version1Semver = parse(version1);
    const version2Semver = parse(version2);

    // No diff possible
    if (version1Semver === null || version2Semver === null) {
        return null;
    }
    return semver.diff(version1Semver, version2Semver);
}

module.exports = {
    parse,
    isGreater,
    diff,
};
