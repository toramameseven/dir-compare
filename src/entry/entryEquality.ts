import fs from 'fs'
import { DifferenceType, DiffSet, Entry, Reason } from '..'
import { ExtOptions } from '../types/ExtOptions'
import { FileEquality } from './types/FileEquality'
import { FileEqualityPromise } from './types/FileEqualityPromise'
import { FileEqualityAsync } from './types/FileEqualityAsync'

/**
 * Compares two entries with identical name and type.
 */
export = {
    isEntryEqualSync(entry1: Entry, entry2: Entry, type: DifferenceType, options: ExtOptions): FileEquality {
        if (type === 'file') {
            return isFileEqualSync(entry1, entry2, options)
        }
        if (type === 'directory') {
            return isDirectoryEqual(entry1, entry2, options)
        }
        if (type === 'broken-link') {
            return isBrokenLinkEqual()
        }
        throw new Error('Unexpected type ' + type)
    },

    isEntryEqualAsync(entry1: Entry, entry2: Entry, type: DifferenceType, diffSet: DiffSet, options: ExtOptions): FileEqualityPromise {
        if (type === 'file') {
            return isFileEqualAsync(entry1, entry2, type, diffSet, options)
        }
        if (type === 'directory') {
            return { isSync: true, ...isDirectoryEqual(entry1, entry2, options) }
        }
        if (type === 'broken-link') {
            return { isSync: true, ...isBrokenLinkEqual() }
        }
        throw new Error('Unexpected type ' + type)
    },

}

function isFileEqualSync(entry1: Entry, entry2: Entry, options: ExtOptions): FileEquality {
    if (options.compareSymlink && !isSymlinkEqual(entry1, entry2)) {
        return { same: false, reason: 'different-symlink' }
    }
    if (options.compareSize && entry1.stat.size !== entry2.stat.size) {
        return { same: false, reason: 'different-size' }
    }
    if (options.compareDate && !isDateEqual(entry1.stat.mtime, entry2.stat.mtime, options.dateTolerance)) {
        return { same: false, reason: 'different-date' }
    }
    if (options.compareContent && !options.compareFileSync(entry1.absolutePath, entry1.stat, entry2.absolutePath, entry2.stat, options)) {
        return { same: false, reason: 'different-content' }
    }
    return { same: true }
}

function isFileEqualAsync(entry1: Entry, entry2: Entry, type: DifferenceType, diffSet: DiffSet,
    options: ExtOptions): FileEqualityPromise {

    if (options.compareSymlink && !isSymlinkEqual(entry1, entry2)) {
        return { isSync: true, same: false, reason: 'different-symlink' }
    }
    if (options.compareSize && entry1.stat.size !== entry2.stat.size) {
        return { isSync: true, same: false, reason: 'different-size' }
    }

    if (options.compareDate && !isDateEqual(entry1.stat.mtime, entry2.stat.mtime, options.dateTolerance)) {
        return { isSync: true, same: false, reason: 'different-date' }
    }

    if (options.compareContent) {
        let subDiffSet
        if (!options.noDiffSet) {
            subDiffSet = []
            diffSet.push(subDiffSet)
        }
        const samePromise: Promise<FileEqualityAsync> = options.compareFileAsync(entry1.absolutePath, entry1.stat, entry2.absolutePath, entry2.stat, options)
            .then((comparisonResult) => {
                if (typeof (comparisonResult) !== "boolean") {
                    return {
                        hasErrors: true,
                        error: comparisonResult
                    } as FileEqualityAsync
                }

                const same = comparisonResult
                const reason: Reason = same ? undefined : 'different-content'

                return {
                    hasErrors: false,
                    entry1, entry2, same,
                    type1: type, type2: type,
                    diffSet: subDiffSet,
                    reason
                } as FileEqualityAsync
            })
            .catch((error) => ({
                hasErrors: true,
                error
            }))

        return { isSync: false, fileEqualityAsyncPromise: samePromise }
    }

    return { isSync: true, same: true }
}

function isDirectoryEqual(entry1: Entry, entry2: Entry, options: ExtOptions): FileEquality {
    if (options.compareSymlink && !isSymlinkEqual(entry1, entry2)) {
        return { same: false, reason: 'different-symlink' }
    }
    return { same: true, reason: undefined }
}

function isBrokenLinkEqual(): FileEquality {
    return { same: false, reason: 'broken-link' } // broken links are never considered equal
}

/**
 * Compares two dates and returns true/false depending on tolerance (milliseconds).
 * Two dates are considered equal if the difference in milliseconds between them is less or equal than tolerance.
 */
function isDateEqual(date1: Date, date2: Date, tolerance: number): boolean {
    return Math.abs(date1.getTime() - date2.getTime()) <= tolerance ? true : false
}

/**
 * Compares two entries for symlink equality.
 */
function isSymlinkEqual(entry1: Entry, entry2: Entry): boolean {
    if (!entry1.isSymlink && !entry2.isSymlink) {
        return true
    }
    if (entry1.isSymlink && entry2.isSymlink && hasIdenticalLink(entry1.absolutePath, entry2.absolutePath)) {
        return true
    }
    return false
}

function hasIdenticalLink(path1: string, path2: string): boolean {
    return fs.readlinkSync(path1) === fs.readlinkSync(path2)
}