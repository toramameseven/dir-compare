const fs = require('fs')
const pathUtils = require('path')
const entryBuilder = require('./entry/entryBuilder')
const entryEquality = require('./entry/entryEquality')
const stats = require('./statistics/statisticsUpdate')
const loopDetector = require('./symlink/loopDetector')
const entryComparator = require('./entry/entryComparator')
const entryType = require('./entry/entryType')

/**
 * Returns the sorted list of entries in a directory.
 */
function getEntries(rootEntry, relativePath, loopDetected, options) {
    if (!rootEntry || loopDetected) {
        return []
    }
    if (rootEntry.isDirectory) {
        try {
            const entries = fs.readdirSync(rootEntry.absolutePath)
            return {
                entries: entryBuilder.buildDirEntries(rootEntry, entries, relativePath, options),
                permissionDenied: false
            }
        } catch (error) {
            if (error.code === 'EACCES') {
                return { entries: [], permissionDenied: true }
            }

        }
    }
    return { entries: [rootEntry], permissionDenied: false }
}

/**
 * Compares two directories synchronously.
 */
function compare(rootEntry1, rootEntry2, level, relativePath, options, statistics, diffSet, symlinkCache) {
    const loopDetected1 = loopDetector.detectLoop(rootEntry1, symlinkCache.dir1)
    const loopDetected2 = loopDetector.detectLoop(rootEntry2, symlinkCache.dir2)
    loopDetector.updateSymlinkCache(symlinkCache, rootEntry1, rootEntry2, loopDetected1, loopDetected2)

    const entriesResult1 = getEntries(rootEntry1, relativePath, loopDetected1, options)
    const entriesResult2 = getEntries(rootEntry2, relativePath, loopDetected2, options)

    const entries1 = entriesResult1.entries
    const entries2 = entriesResult2.entries
    compareInternal(entries1, entries2, level, relativePath, options, statistics, diffSet, symlinkCache)
    // todo 453: handle permission denied 
}

function compareInternal(entries1, entries2, level, relativePath, options, statistics, diffSet, symlinkCache) {
    let i1 = 0, i2 = 0
    while (i1 < entries1.length || i2 < entries2.length) {
        const entry1 = entries1[i1]
        const entry2 = entries2[i2]
        let type1, type2

        // compare entry name (-1, 0, 1)
        let cmp
        if (i1 < entries1.length && i2 < entries2.length) {
            cmp = entryComparator.compareEntry(entry1, entry2, options)
            type1 = entryType.getType(entry1)
            type2 = entryType.getType(entry2)
        } else if (i1 < entries1.length) {
            type1 = entryType.getType(entry1)
            type2 = entryType.getType(undefined)
            cmp = -1
        } else {
            type1 = entryType.getType(undefined)
            type2 = entryType.getType(entry2)
            cmp = 1
        }

        // process entry
        if (cmp === 0) {
            // Both left/right exist and have the same name and type
            let compareEntryRes = entryEquality.isEntryEqualSync(entry1, entry2, type1, options)
            i1++
            i2++

            let entriesResult1, entriesResult2, clonedSymlinkCache
            if (!options.skipSubdirs && type1 === 'directory') {
                const { loopDetected1, loopDetected2, symlinkCache } = detectLoops(symlinkCache, entry1, entry2)
                entriesResult1 = getEntries(entry1, pathUtils.join(relativePath, entry1.name), loopDetected1, options)
                entriesResult2 = getEntries(entry2, pathUtils.join(relativePath, entry2.name), loopDetected2, options)
                clonedSymlinkCache = symlinkCache
            }

            if (entriesResult1.permissionDenied || entriesResult2.permissionDenied) {
                options.resultBuilder(entry1, entry2, 'distinct',
                    level, relativePath, options, statistics, diffSet, 'permission-denied')
                continue
            }
            options.resultBuilder(entry1, entry2,
                compareEntryRes.same ? 'equal' : 'distinct',
                level, relativePath, options, statistics, diffSet,
                compareEntryRes.reason)
            stats.updateStatisticsBoth(entry1, entry2, compareEntryRes.same, compareEntryRes.reason, type1, statistics, options)


            if (!options.skipSubdirs && type1 === 'directory') {
                const { loopDetected1, loopDetected2, clonedSymlinkCache } = detectLoops(symlinkCache, entry1, entry2)
                const entriesResult1 = getEntries(entry1, pathUtils.join(relativePath, entry1.name), loopDetected1, options)
                const entriesResult2 = getEntries(entry2, pathUtils.join(relativePath, entry2.name), loopDetected2, options)

                if (entriesResult1.permissionDenied || entriesResult2.permissionDenied) {
                    options.resultBuilder(entry1, entry2, 'distinct',
                        level, relativePath, options, statistics, diffSet, 'permission-denied')
                    continue
                }
                compareInternal(entriesResult1.entries, entriesResult2.entries, level + 1, pathUtils.join(relativePath, entry1.name), options, statistics, diffSet, clonedSymlinkCache)
            }
        } else if (cmp < 0) {
            // Right missing
            options.resultBuilder(entry1, undefined, 'left', level, relativePath, options, statistics, diffSet)
            stats.updateStatisticsLeft(entry1, type1, statistics, options)
            i1++
            if (type1 === 'directory' && !options.skipSubdirs) {
                const { loopDetected1, clonedSymlinkCache } = detectLoops(symlinkCache, entry1, entry2)
                const entriesResult1 = getEntries(entry1, pathUtils.join(relativePath, entry1.name), loopDetected1, options)
                if (entriesResult1.permissionDenied) {
                    options.resultBuilder(entry1, entry2, 'distinct',
                        level, relativePath, options, statistics, diffSet, 'permission-denied')
                    continue
                }
                compareInternal(entriesResult1.entries, [], level + 1, pathUtils.join(relativePath, entry1.name), options, statistics, diffSet, clonedSymlinkCache)
            }
        } else {
            // Left missing
            options.resultBuilder(undefined, entry2, 'right', level, relativePath, options, statistics, diffSet)
            stats.updateStatisticsRight(entry2, type2, statistics, options)
            i2++
            if (type2 === 'directory' && !options.skipSubdirs) {
                const { loopDetected2, clonedSymlinkCache } = detectLoops(symlinkCache, entry1, entry2)
                const entriesResult2 = getEntries(entry2, pathUtils.join(relativePath, entry2.name), loopDetected2, options)
                compareInternal([], entriesResult2.entries, level + 1, pathUtils.join(relativePath, entry2.name), options, statistics, diffSet, clonedSymlinkCache)
            }
        }
    }
}

function detectLoops(symlinkCache, entry1, entry2) {
    const clonedSymlinkCache = loopDetector.cloneSymlinkCache(symlinkCache)
    const loopDetected1 = loopDetector.detectLoop(entry1, clonedSymlinkCache.dir1)
    const loopDetected2 = loopDetector.detectLoop(entry2, clonedSymlinkCache.dir2)
    loopDetector.updateSymlinkCache(clonedSymlinkCache, entry1, entry2, loopDetected1, loopDetected2)
    return { loopDetected1, loopDetected2, clonedSymlinkCache }
}

module.exports = compare
