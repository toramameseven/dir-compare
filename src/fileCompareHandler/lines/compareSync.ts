import fs from 'fs'
import { Options } from '../..'
import closeFiles from '../common/closeFile'
import common from './common'
import { ReadLinesResult } from './ReadLinesResult'

const closeFilesSync = closeFiles.closeFilesSync

const buf1 = Buffer.alloc(common.BUF_SIZE)
const buf2 = Buffer.alloc(common.BUF_SIZE)

export default function compareSync(path1: string, stat1: fs.Stats, path2: string, stat2: fs.Stats, options: Options): boolean {
    let fd1: number | undefined
    let fd2: number | undefined
    const bufferSize = Math.min(common.BUF_SIZE, options.lineBasedHandlerBufferSize ?? Number.MAX_VALUE)
    try {
        fd1 = fs.openSync(path1, 'r')
        fd2 = fs.openSync(path2, 'r')
        let rest1 = ''
        let rest2 = ''
        let restLines1: string[] = []
        let restLines2: string[] = []
        for (; ;) {
            const readResult1 = readLinesSync(fd1, buf1, bufferSize, rest1, restLines1)
            const readResult2 = readLinesSync(fd2, buf2, bufferSize, rest2, restLines2)
            const lines1 = readResult1.lines
            const lines2 = readResult2.lines
            rest1 = readResult1.rest
            rest2 = readResult2.rest

            if (lines1.length === 0 && lines2.length === 0) {
                // End of file reached
                return true
            }
            const compareResult = common.compareLines(lines1, lines2, options)
            if (!compareResult.isEqual) {
                return false
            }
            restLines1 = compareResult.restLines1
            restLines2 = compareResult.restLines2
        }
    } finally {
        closeFilesSync(fd1, fd2)
    }
}


/**
 * Read lines from file starting with current position.
 * Returns 0 lines if eof is reached, otherwise returns at least one complete line.
 * Incomplete line is returned as 'rest' parameter.
 */
function readLinesSync(fd: number, buf: Buffer, bufferSize: number, rest: string, restLines: string[]): ReadLinesResult {
    const size = fs.readSync(fd, buf, 0, bufferSize, null)
    if (size === 0) {
        // end of file
        if(rest.length===0){
            return { lines: [...restLines], rest: '' }
        }
        return { lines: [...restLines, rest], rest: '' }
    }
    const isEndOfFile = size < bufferSize
    const fileContent = rest + buf.toString('utf8', 0, size)
    const lines = [...restLines, ...fileContent.match(common.LINE_TOKENIZER_REGEXP) as string[]]
    if (isEndOfFile) {
        return {
            lines, rest: ''
        }
    }
    return common.removeLastLine(lines)
}
