/**
 * Compare files line by line with options to ignore
 * line endings and white space differences.
 */
import { FileDescriptorQueue } from '../../fs/FileDescriptorQueue'
import closeFiles from '../common/closeFile'
import fsPromise from '../../fs/fsPromise'
import common from './common'
import fs from 'fs'
import { Options } from '../..'
import { BufferPair } from '../../fs/BufferPool'
import { ReadLinesResult } from './ReadLinesResult'

const closeFilesAsync = closeFiles.closeFilesAsync

const fdQueue = new FileDescriptorQueue(common.MAX_CONCURRENT_FILE_COMPARE * 2)

export default async function compareAsync(path1: string, stat1: fs.Stats, path2: string, stat2: fs.Stats, options: Options): Promise<boolean> {
    let fd1: number | undefined
    let fd2: number | undefined
    const bufferSize = Math.min(common.BUF_SIZE, options.lineBasedHandlerBufferSize ?? Number.MAX_VALUE)
    let bufferPair: BufferPair | undefined
    try {
        const fds = await Promise.all([fdQueue.openPromise(path1, 'r'), fdQueue.openPromise(path2, 'r')])
        bufferPair = common.bufferPool.allocateBuffers()
        fd1 = fds[0]
        fd2 = fds[1]
        const buf1 = bufferPair.buf1
        const buf2 = bufferPair.buf2
        let rest1 = ''
        let rest2 = ''
        let restLines1: string[] = []
        let restLines2: string[] = []
        for (; ;) {
            const readResult1 = await readLinesAsync(fd1, buf1, bufferSize, rest1, restLines1)
            const readResult2 = await readLinesAsync(fd2, buf2, bufferSize, rest2, restLines2)
            const lines1 = readResult1.lines
            const lines2 = readResult2.lines
            rest1 = readResult1.rest
            rest2 = readResult2.rest

            const compareResult = common.compareLines(lines1, lines2, options)
            if (!compareResult.isEqual) {
                return false
            }

            const reachedEof = readResult1.reachedEof && readResult2.reachedEof
            if (reachedEof && (compareResult.restLines1.length > 0 || compareResult.restLines2.length > 0)) {
                return false
            }

            if (readResult1.reachedEof && readResult1.reachedEof) {
                // End of file reached
                return true
            }

            restLines1 = compareResult.restLines1
            restLines2 = compareResult.restLines2
        }
    } finally {
        if (bufferPair) {
            common.bufferPool.freeBuffers(bufferPair)
        }
        await closeFilesAsync(fd1, fd2, fdQueue)
    }
}

/**
 * Read lines from file starting with current position.
 * Returns 0 lines if eof is reached, otherwise returns at least one complete line.
 * Incomplete line is returned as 'rest' parameter.
 */
async function readLinesAsync(fd: number, buf: Buffer, bufferSize: number, rest: string, restLines: string[]): Promise<ReadLinesResult> {
    const size = await fsPromise.read(fd, buf, 0, bufferSize, null)
    if (size === 0) {
        // end of file
        if(rest.length===0){
            return { lines: [...restLines], rest: '' , reachedEof: true}
        }
        return { lines: [...restLines, rest], rest: '' , reachedEof: true}
    }
    const isEndOfFile = size < bufferSize
    const fileContent = rest + buf.toString('utf8', 0, size)
    const lines = [...restLines, ...fileContent.match(common.LINE_TOKENIZER_REGEXP) as string[]]
    if (isEndOfFile) {
        return {
            lines, rest: '', reachedEof: true
        }
    }
    return common.removeLastLine(lines)
}

