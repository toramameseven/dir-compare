import common from './common/common'
import { ReadLinesResult } from './common/ReadLinesResult'

/**
 * Reads lines from given buffer.
 * @param buf Buffer to read lines from.
 * @param size Size of data available in buffer.
 * @param allocatedBufferSize Maximum buffer storage.
 * @param rest Part of a line that was split at buffer boundary in a previous read.
 *             Will be added to result.
 * @param restLines Lines that remain unprocessed from a previous read.
 *             Will be added to result.
 */
export function readBufferedLines(buf: Buffer, size: number, allocatedBufferSize: number, rest: string, restLines: string[]): ReadLinesResult {
    if (size === 0 && rest.length === 0) {
        return { lines: [...restLines], rest: '', reachedEof: true }
    }
    if (size === 0) {
        return { lines: [...restLines, rest], rest: '', reachedEof: true }
    }

    const fileContent = rest + buf.toString('utf8', 0, size)
    const lines = [...restLines, ...fileContent.match(common.LINE_TOKENIZER_REGEXP) as string[]]

    const reachedEof = size < allocatedBufferSize
    if (reachedEof) {
        return {
            lines, rest: '', reachedEof: true
        }
    }

    return common.removeLastLine(lines)
}
