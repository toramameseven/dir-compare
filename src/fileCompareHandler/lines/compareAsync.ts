/**
 * Compare files line by line with options to ignore
 * line endings and white space differences.
 */
import { FileDescriptorQueue } from '../../fs/FileDescriptorQueue'
import closeFiles from '../common/closeFile'
import fsPromise from '../../fs/fsPromise'
import common from './common/common'
import fs from 'fs'
import { Options } from '../..'
import { ReadLinesResult } from './common/ReadLinesResult'
import { LineBasedCompareContext } from './common/LineBasedCompareContext'
import { BufferPool } from '../../fs/BufferPool'
import { readBufferedLines } from './readBufferedLines'
import { compareLineBatches } from './compareLineBatches'

const closeFilesAsync = closeFiles.closeFilesAsync

const MAX_CONCURRENT_FILE_COMPARE = 8


const fdQueue = new FileDescriptorQueue(MAX_CONCURRENT_FILE_COMPARE * 2)
const bufferPool= new BufferPool(common.BUF_SIZE, MAX_CONCURRENT_FILE_COMPARE)  // fdQueue guarantees there will be no more than MAX_CONCURRENT_FILE_COMPARE async processes accessing the buffers concurrently


export default async function compareAsync(path1: string, stat1: fs.Stats, path2: string, stat2: fs.Stats, options: Options): Promise<boolean> {
    const bufferSize = Math.min(common.BUF_SIZE, options.lineBasedHandlerBufferSize ?? Number.MAX_VALUE)
    let context: LineBasedCompareContext | undefined
    try {
        const fds = await Promise.all([fdQueue.openPromise(path1, 'r'), fdQueue.openPromise(path2, 'r')])
        context = new LineBasedCompareContext(fds[0], fds[1], bufferPool.allocateBuffers())
        
        for (; ;) {
            const lineBatch1 = await readLineBatchAsync(context.fd1, context.bufferPair.buf1, bufferSize, context.rest.rest1, context.restLines.restLines1)
            const lineBatch2 = await readLineBatchAsync(context.fd2, context.bufferPair.buf2, bufferSize, context.rest.rest2, context.restLines.restLines2)
            const compareResult = compareLineBatches(lineBatch1, lineBatch2, context, options)
            if (!compareResult.batchIsEqual) {
                return false
            }
            if (compareResult.reachedEof) {
                return compareResult.batchIsEqual
            }
        }
    } finally {
        if (context) {
            bufferPool.freeBuffers(context.bufferPair)
            await closeFilesAsync(context.fd1, context.fd2, fdQueue)
        }
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
async function readLineBatchAsync(fd: number, buf: Buffer, bufferSize: number, rest: string, restLines: string[]): Promise<ReadLinesResult> {
    const size = await fsPromise.read(fd, buf, 0, bufferSize, null)
    return readBufferedLines(buf, size, bufferSize, rest, restLines)
}


