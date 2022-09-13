import { Options, Result, FileCompareHandlers } from './types';
export * from './types';
/**
 * Synchronously compares given paths.
 * @param path1 Left file or directory to be compared.
 * @param path2 Right file or directory to be compared.
 * @param options Comparison options.
 */
export declare function compareSync(path1: string, path2: string, options?: Options): Result;
/**
 * Asynchronously compares given paths.
 * @param path1 Left file or directory to be compared.
 * @param path2 Right file or directory to be compared.
 * @param extOptions Comparison options.
 */
export declare function compare(path1: string, path2: string, options?: Options): Promise<Result>;
/**
 * File content comparison handlers.
 * These comparators are included with dir-compare.
 *
 * The `defaultFileCompare` is used when {@link Options.compareContent} is enabled
 * and {@link Options.compareFileSync} or {@link Options.compareFileAsync} are sent as `undefined`.
 *
 * See [Custom file content comparators](https://github.com/gliviu/dir-compare#custom-file-content-comparators) for details.
 */
export declare const fileCompareHandlers: FileCompareHandlers;
//# sourceMappingURL=index.d.ts.map