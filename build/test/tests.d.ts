import { Options, Result, Statistics } from "../src";
import Streams from 'memory-streams';
export interface DisplayOptions {
    showAll: boolean;
    wholeReport: boolean;
    csv: boolean;
    noDiffIndicator: boolean;
    reason: boolean;
}
export interface Test {
    name: string;
    path1: string;
    path2: string;
    description: string;
    expected: string;
    expectedError?: string;
    withRelativePath: boolean;
    options: Partial<Options>;
    displayOptions: Partial<DisplayOptions>;
    print: (res: Result, writer: Streams.WritableStream, displayOptions: DisplayOptions) => void;
    skipStatisticsCheck: boolean;
    onlySync: boolean;
    onlyAsync: boolean;
    nodeVersionSupport: string;
    excludePlatform: Platform[];
    runAsync: () => Promise<string>;
    customValidator: (result: Statistics) => boolean;
}
declare type Platform = 'aix' | 'android' | 'darwin' | 'freebsd' | 'linux' | 'openbsd' | 'sunos' | 'win32' | 'cygwin' | 'netbsd';
export declare function getTests(testDirPath: string): Partial<Test>[];
export {};
//# sourceMappingURL=tests.d.ts.map