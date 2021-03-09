
export interface ReadLinesResult {
    /**
     * Lines available after this read operation.
     */
    lines: string[]
    /**
     * First part of a line that was split due to buffer boundary.
     */
    rest: string
    /**
     * Whether we reached end of file.
     */
    reachedEof: boolean
}
