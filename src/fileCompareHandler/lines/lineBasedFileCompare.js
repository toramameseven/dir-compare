const compareSync = require('./compareSync').default
const compareAsync = require('./compareAsync').default

/**
 * Compare files line by line with options to ignore
 * line endings and white space differences.
 */
module.exports = {
    compareSync: compareSync,
    compareAsync: compareAsync
}
