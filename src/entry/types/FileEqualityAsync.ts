import { DifferenceType, DiffSet, Entry, Reason } from "../..";

export type FileEqualityAsyncSuccess = {
    hasErrors: false
    entry1: Entry;
    entry2: Entry;
    same: boolean;
    diffSet: DiffSet;
    type1: DifferenceType;
    type2: DifferenceType;
    reason: Reason;
}

export type FileEqualityAsyncError = {
    hasErrors: true
    error: unknown;
}

export type FileEqualityAsync = FileEqualityAsyncSuccess | FileEqualityAsyncError

