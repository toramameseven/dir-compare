"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryBuilder = void 0;
const fs_1 = __importDefault(require("fs"));
const minimatch_1 = __importDefault(require("minimatch"));
const path_1 = __importDefault(require("path"));
const EntryComparator_1 = require("./EntryComparator");
const PATH_SEP = path_1.default.sep;
exports.EntryBuilder = {
    /**
     * Returns the sorted list of entries in a directory.
     */
    buildDirEntries(rootEntry, dirEntries, relativePath, options) {
        const res = [];
        for (let i = 0; i < dirEntries.length; i++) {
            const entryName = dirEntries[i];
            const entryAbsolutePath = rootEntry.absolutePath + PATH_SEP + entryName;
            const entryPath = rootEntry.path + PATH_SEP + entryName;
            const entry = this.buildEntry(entryAbsolutePath, entryPath, entryName, options);
            if (options.skipSymlinks && entry.isSymlink) {
                entry.stat = undefined;
            }
            if (filterEntry(entry, relativePath, options)) {
                res.push(entry);
            }
        }
        return res.sort((a, b) => EntryComparator_1.EntryComparator.compareEntry(a, b, options));
    },
    buildEntry(absolutePath, path, name, options) {
        const stats = getStatIgnoreBrokenLink(absolutePath);
        const isDirectory = stats.stat.isDirectory();
        let isPermissionDenied = false;
        if (options.handlePermissionDenied) {
            const isFile = !isDirectory;
            isPermissionDenied = hasPermissionDenied(absolutePath, isFile, options);
        }
        return {
            name: name,
            absolutePath: absolutePath,
            path: path,
            stat: stats.stat,
            lstat: stats.lstat,
            isSymlink: stats.lstat.isSymbolicLink(),
            isBrokenLink: stats.isBrokenLink,
            isDirectory,
            isPermissionDenied
        };
    },
};
function hasPermissionDenied(absolutePath, isFile, options) {
    if (isFile && !options.compareContent) {
        return false;
    }
    try {
        fs_1.default.accessSync(absolutePath, fs_1.default.constants.R_OK);
        return false;
    }
    catch (_a) {
        return true;
    }
}
function getStatIgnoreBrokenLink(absolutePath) {
    const lstat = fs_1.default.lstatSync(absolutePath);
    try {
        return {
            stat: fs_1.default.statSync(absolutePath),
            lstat: lstat,
            isBrokenLink: false
        };
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            return {
                stat: lstat,
                lstat: lstat,
                isBrokenLink: true
            };
        }
        throw error;
    }
}
/**
 * Filter entries by file name. Returns true if the file is to be processed.
 */
function filterEntry(entry, relativePath, options) {
    if (entry.isSymlink && options.skipSymlinks) {
        return false;
    }
    const path = path_1.default.join(relativePath, entry.name);
    if (options.skipEmptyDirs && entry.stat.isDirectory() && isEmptyDir(entry.absolutePath)) {
        return false;
    }
    if ((entry.stat.isFile() && options.includeFilter) && (!match(path, options.includeFilter))) {
        return false;
    }
    if ((options.excludeFilter) && (match(path, options.excludeFilter))) {
        return false;
    }
    return true;
}
function isEmptyDir(path) {
    return fs_1.default.readdirSync(path).length === 0;
}
/**
 * Matches path by pattern.
 */
function match(path, pattern) {
    const patternArray = pattern.split(',');
    for (let i = 0; i < patternArray.length; i++) {
        const pat = patternArray[i];
        if ((0, minimatch_1.default)(path, pat, { dot: true, matchBase: true })) { //nocase
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=EntryBuilder.js.map