import { Reason } from "../..";
import { FileEqualityAsync } from "./FileEqualityAsync";

/**
 * Response given when testing identically named files for equality during asynchronous comparison.
 */
export type FileEqualityPromise = FileEqualityPromiseSync | FileEqualityPromiseAsync

/**
* File equality response that represents a promise resolved synchronously (ie. no i/o calls involved).
*/
type FileEqualityPromiseSync = {
    isSync: true
    /**
     * True if files are identical.
     */
    same: boolean
    /**
     * Provides reason if files are distinct.
     */
    reason?: Reason
}

/**
 * File equality response that represents a promise resolved asynchronously.
 */
type FileEqualityPromiseAsync = {
    isSync: false
    fileEqualityAsyncPromise: Promise<FileEqualityAsync>
}
