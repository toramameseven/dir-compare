import fs from 'fs'
import { Entry } from '..'


export type SymlinkCache = {
	dir1: RootDirSymlinkCache
	dir2: RootDirSymlinkCache
}

type SymlinkPath = string

/**
 * Symlink cache for one of the left or right root directories.
 */
type RootDirSymlinkCache = {
	/**
	 * True if this symlink has already been traversed.
	 */
	[key: SymlinkPath]: boolean
}

/**
 * Provides symlink loop detection to directory traversal algorithm.
 */
export default {
	detectLoop(entry: Entry, symlinkCache: RootDirSymlinkCache): boolean {
		if (entry && entry.isSymlink) {
			const realPath = fs.realpathSync(entry.absolutePath)
			if (symlinkCache[realPath]) {
				return true
			}
		}
		return false
	},

	initSymlinkCache(): SymlinkCache {
		return {
			dir1: {},
			dir2: {}
		}
	},

	updateSymlinkCache(symlinkCache: SymlinkCache, rootEntry1: Entry, rootEntry2: Entry,
		loopDetected1: boolean, loopDetected2: boolean): void {

		let symlinkCachePath1, symlinkCachePath2
		if (rootEntry1 && !loopDetected1) {
			symlinkCachePath1 = rootEntry1.isSymlink ? fs.realpathSync(rootEntry1.absolutePath) : rootEntry1.absolutePath
			symlinkCache.dir1[symlinkCachePath1] = true
		}
		if (rootEntry2 && !loopDetected2) {
			symlinkCachePath2 = rootEntry2.isSymlink ? fs.realpathSync(rootEntry2.absolutePath) : rootEntry2.absolutePath
			symlinkCache.dir2[symlinkCachePath2] = true
		}
	},

	cloneSymlinkCache(symlinkCache: SymlinkCache): SymlinkCache {
		return {
			dir1: shallowClone(symlinkCache.dir1),
			dir2: shallowClone(symlinkCache.dir2)
		}
	},
}

function shallowClone(obj: RootDirSymlinkCache): RootDirSymlinkCache {
	const cloned = {}
	Object.keys(obj).forEach(key => {
		cloned[key] = obj[key]
	})
	return cloned
}

