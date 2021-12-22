import { ExtOptions } from "../ExtOptions"
import { StringCompareResult } from "./StringCompareResult"

/**
 * Name comparator used when dir-compare is called to compare two files.
 * Comparing two files will ignore the file name.
 */
export function fileBasedCompare(name1: string, name2: string, options: ExtOptions): StringCompareResult {
	return 0
}

