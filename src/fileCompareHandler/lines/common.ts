import { Options } from '../..'
import { BufferPool } from '../../fs/BufferPool'
import { CompareLinesResult } from './CompareLinesResult'
import { ReadLinesResult } from './ReadLinesResult'

const BUF_SIZE = 100000
const MAX_CONCURRENT_FILE_COMPARE = 8

const SPLIT_CONTENT_AND_LINE_ENDING_REGEXP = /([^\r\n]*)([\r\n]*)/
const TRIM_WHITE_SPACES_REGEXP = /^[ \f\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+|[ \f\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+$/g
const TRIM_LINE_ENDING_REGEXP = /\r\n|\n$/g
const REMOVE_WHITE_SPACES_REGEXP = /[ \f\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/g

export default {
    BUF_SIZE,
    MAX_CONCURRENT_FILE_COMPARE,
    bufferPool: new BufferPool(BUF_SIZE, MAX_CONCURRENT_FILE_COMPARE),  // fdQueue guarantees there will be no more than MAX_CONCURRENT_FILE_COMPARE async processes accessing the buffers concurrently

    LINE_TOKENIZER_REGEXP: /[^\n]+\n?|\n/g,

    compareLines(lines1: string[], lines2: string[], options: Options): CompareLinesResult {
        if (options.ignoreEmptyLines) {
            lines1 = removeEmptyLines(lines1)
            lines2 = removeEmptyLines(lines2)
        }
        const len = Math.min(lines1.length, lines2.length)
        let i = 0
        for (; i < len; i++) {
            const isEqual = compareLine(options, lines1[i], lines2[i])
            if (!isEqual) {
                return { isEqual: false, restLines1: [], restLines2: [] }
            }
        }
        return {
            isEqual: true,
            restLines1: lines1.slice(i),
            restLines2: lines2.slice(i)
        }
    },

    /**
     * @deprecated
     * @param lines 
     * @param numberOfLines 
     */
    calculateSize(lines: string[], numberOfLines: number): number {
        let size = 0
        for (let i = 0; i < numberOfLines; i++) {
            const line = lines[i]
            size += line.length
        }
        return size
    },

    /**
     * @deprecated
     */
    removeLastIncompleteLine(lines: string[]): string[] {
        const lastLine = lines[lines.length - 1]
        if (!lastLine.endsWith('\n')) {
            return lines.slice(0, lines.length - 1)
        }
        return lines
    },

    removeLastLine(lines: string[]): ReadLinesResult {
        const lastLine = lines[lines.length - 1]
        return {
            lines: lines.slice(0, lines.length - 1),
            rest: lastLine,
            reachedEof: false
        }
    },

    /**
     * @deprecated
     */
    normalizeLastFileLine(lines: string[]): void {
        if (lines.length === 0) {
            return
        }
        const lastLine = lines[lines.length - 1]
        if (!lastLine.endsWith('\n')) {
            lines[lines.length - 1] = lastLine + '\n'
        }
    },

}

function compareLine(options: Options, line1: string, line2: string): boolean {
    if (options.ignoreLineEnding) {
        line1 = trimLineEnding(line1)
        line2 = trimLineEnding(line2)
    }
    if (options.ignoreWhiteSpaces) {
        line1 = trimSpaces(line1)
        line2 = trimSpaces(line2)
    }
    if (options.ignoreAllWhiteSpaces) {
        line1 = removeSpaces(line1)
        line2 = removeSpaces(line2)
    }
    return line1 === line2
}

// Trims string like '   abc   \n' into 'abc\n'
function trimSpaces(s: string): string {
    const matchResult = s.match(SPLIT_CONTENT_AND_LINE_ENDING_REGEXP) as string[]
    const content = matchResult[1]
    const lineEnding = matchResult[2]
    const trimmed = content.replace(TRIM_WHITE_SPACES_REGEXP, '')
    return trimmed + lineEnding
}

function trimLineEnding(s: string): string {
    return s.replace(TRIM_LINE_ENDING_REGEXP, '')
}

function removeSpaces(s: string): string {
    return s.replace(REMOVE_WHITE_SPACES_REGEXP, '')
}

function removeEmptyLines(lines: string[]): string[] {
    return lines.filter(line => !isEmptyLine(line))
}

function isEmptyLine(line: string): boolean {
    return line === '\n' || line === '\r\n'
}