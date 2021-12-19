import { DifferenceType, DiffSet, Entry, Reason } from "../..";

/**
 * Response given when testing identically named files for equality during asynchronous comparison.
 */
export type FileEqualityAsync = FileEqualityAsyncSuccess | FileEqualityAsyncError

/**
 * Successful file equality test result.
 */
// TODO: extract additional information (entry1, diffset, ...) into Context structure.
type FileEqualityAsyncSuccess = {
    hasErrors: false
    entry1: Entry;
    entry2: Entry;
    /**
     * True if files are identical.
     */
    same: boolean;
    diffSet: DiffSet;
    type1: DifferenceType;
    type2: DifferenceType;
    /**
     * Provides reason if files are distinct
     */
    reason: Reason;
}

/**
 * Failed file equality test result.
 */
type FileEqualityAsyncError = {
    hasErrors: true
    error: unknown;
}

