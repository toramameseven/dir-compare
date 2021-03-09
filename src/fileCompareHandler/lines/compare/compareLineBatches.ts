import { Options } from '../../..';
import { LineBasedCompareContext } from '../LineBasedCompareContext';
import { ReadLinesResult as LineBatch } from '../readLines/ReadLinesResult';
import { compareLines } from './compareLines';

export interface CompareLineBatchResult {
    reachedEof: boolean
    batchIsEqual: boolean
}

/**
 * Compares two line batches.
 * @param lineBatch1 Batch to compare.
 * @param lineBatch2 Batch to compare.
 * @param context Comparison context.
 * @param options Comparison options.
 */
export function compareLineBatches(lineBatch1: LineBatch, lineBatch2: LineBatch,
    context: LineBasedCompareContext, options: Options): CompareLineBatchResult {

    context.rest.rest1 = lineBatch1.rest;
    context.rest.rest2 = lineBatch2.rest;

    const compareResult = compareLines(lineBatch1.lines, lineBatch2.lines, options);
    if (!compareResult.isEqual) {
        return { batchIsEqual: false, reachedEof: false };
    }

    const reachedEof = lineBatch1.reachedEof && lineBatch2.reachedEof;
    const hasMoreLinesToProcess = compareResult.restLines1.length > 0 || compareResult.restLines2.length > 0;
    if (reachedEof && hasMoreLinesToProcess) {
        return { batchIsEqual: false, reachedEof: true };
    }

    if (reachedEof) {
        return { batchIsEqual: true, reachedEof: true };
    }

    context.restLines.restLines1 = compareResult.restLines1;
    context.restLines.restLines2 = compareResult.restLines2;

    return { batchIsEqual: true, reachedEof: false };
}
