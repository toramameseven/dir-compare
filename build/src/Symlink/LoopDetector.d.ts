import { OptionalEntry } from '../Entry/EntryType';
export declare type SymlinkCache = {
    dir1: RootDirSymlinkCache;
    dir2: RootDirSymlinkCache;
};
/**
 * Symlink cache for one of the left or right root directories.
 */
declare type RootDirSymlinkCache = {
    /**
     * True if this symlink has already been traversed.
     */
    [key: SymlinkPath]: boolean;
};
declare type SymlinkPath = string;
/**
 * Provides symlink loop detection to directory traversal algorithm.
 */
export declare const LoopDetector: {
    detectLoop(entry: OptionalEntry, symlinkCache: RootDirSymlinkCache): boolean;
    initSymlinkCache(): SymlinkCache;
    updateSymlinkCache(symlinkCache: SymlinkCache, rootEntry1: OptionalEntry, rootEntry2: OptionalEntry, loopDetected1: boolean, loopDetected2: boolean): void;
    cloneSymlinkCache(symlinkCache: SymlinkCache): SymlinkCache;
};
export {};
//# sourceMappingURL=LoopDetector.d.ts.map