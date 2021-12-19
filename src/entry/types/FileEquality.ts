import { Reason } from "../..";

/**
 * Response given when testing identically named files for equality during synchronous comparison.
 */
export type FileEquality = {
    /**
     * True if files are identical.
     */
    same: boolean
    /**
     * Provides reason if files are distinct
     */
    reason?: Reason
}

