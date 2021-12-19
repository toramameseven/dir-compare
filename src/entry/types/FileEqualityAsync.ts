import { DifferenceType, DiffSet, Entry, Reason } from "../..";

/**
 * Response given when testing identically named files for equality during asynchronous comparison.
 */
export type FileEqualityAsync = FileEqualityAsyncSuccess | FileEqualityAsyncError

/**
 * Successful file equality test result.
 */
type FileEqualityAsyncSuccess = {
    hasErrors: false
    /**
     * True if files are identical.
     */
    same: boolean
    /**
     * Provides reason if files are distinct
     */
    reason: Reason
    /**
     * Provides comparison context during async operations.
     */
    context: FileEqualityAsyncContext
}

/**
 * Failed file equality test result.
 */
type FileEqualityAsyncError = {
    hasErrors: true
    error: unknown
}

type FileEqualityAsyncContext = {
    entry1: Entry
    entry2: Entry
    diffSet: DiffSet
    type1: DifferenceType
    type2: DifferenceType
}
