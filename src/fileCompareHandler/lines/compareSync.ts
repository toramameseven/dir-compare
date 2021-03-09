import fs from 'fs'
import { Options } from '../..'
import closeFiles from '../common/closeFile'
import common from './common/common'
import { LineBasedCompareContext } from './common/LineBasedCompareContext'
import { ReadLinesResult as LineBatch } from './common/ReadLinesResult'
import { compareLineBatches } from './compareLineBatches'
import { readBufferedLines } from './readBufferedLines'

const closeFilesSync = closeFiles.closeFilesSync

const buf1 = Buffer.alloc(common.BUF_SIZE)
const buf2 = Buffer.alloc(common.BUF_SIZE)

export default function compareSync(path1: string, stat1: fs.Stats, path2: string, stat2: fs.Stats, options: Options): boolean {
    const bufferSize = Math.min(common.BUF_SIZE, options.lineBasedHandlerBufferSize ?? Number.MAX_VALUE)
    let context: LineBasedCompareContext | undefined
    try {
        context = new LineBasedCompareContext(
            fs.openSync(path1, 'r'),
            fs.openSync(path2, 'r'),
            { buf1, buf2, busy: true }
        )
        for (; ;) {
            const lineBatch1 = readLineBatchSync(context.fd1, context.bufferPair.buf1, bufferSize, context.rest.rest1, context.restLines.restLines1)
            const lineBatch2 = readLineBatchSync(context.fd2, context.bufferPair.buf2, bufferSize, context.rest.rest2, context.restLines.restLines2)
            const compareResult = compareLineBatches(lineBatch1, lineBatch2, context, options)
            if (!compareResult.batchIsEqual) {
                return false
            }
            if (compareResult.reachedEof) {
                return compareResult.batchIsEqual
            }
        }
    } finally {
        closeFilesSync(context?.fd1, context?.fd2)
    }
}

/**
 * Reads a batch of lines from file starting with current position.
 * 
 * @param fd File to read lines from.
 * @param buf Buffer used as temporary line storage.
 * @param bufferSize Allocated buffer size. The number of lines in the batch is limited by this size.
 * @param rest Part of a line that was split at buffer boundary in a previous read.
 *             Will be added to result.
 * @param restLines Lines that remain unprocessed from a previous read.
 *             Will be added to result.
 */
function readLineBatchSync(fd: number, buf: Buffer, bufferSize: number, rest: string, restLines: string[]): LineBatch {
    const size = fs.readSync(fd, buf, 0, bufferSize, null)
    return readBufferedLines(buf, size, bufferSize, rest, restLines)
}

