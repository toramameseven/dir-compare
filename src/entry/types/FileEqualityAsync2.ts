import { DifferenceType, DiffSet, Entry, Reason } from "../..";

export type FileEqualityAsync2Success = {
    hasErrors: false
    entry1: Entry;
    entry2: Entry;
    same: boolean;
    diffSet: DiffSet;
    type1: DifferenceType;
    type2: DifferenceType;
    reason: Reason;
}

export type FileEqualityAsync2Error = {
    hasErrors: true
    error: unknown;
}

export type FileEqualityAsync2 = FileEqualityAsync2Success | FileEqualityAsync2Error

