"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../src");
const print_1 = __importDefault(require("../print"));
const memory_streams_1 = __importDefault(require("memory-streams"));
const fs_1 = require("fs");
const path_1 = require("path");
const tests = [
    {
        testId: '001',
        description: 'Should handle permission denied errors when options.handlePermissionDenied is enabled',
        left: '/tmp/37-perms-test/t1-files-and-dirs/a',
        right: '/tmp/37-perms-test/t1-files-and-dirs/b',
        options: { compareSize: true, compareContent: true, handlePermissionDenied: true },
    },
    {
        testId: '002',
        description: 'Should support links when dealing with permission denied errors',
        left: '/tmp/37-perms-test/t2-links/a',
        right: '/tmp/37-perms-test/t2-links/b',
        options: { compareSize: true, compareContent: true, handlePermissionDenied: true },
    },
    {
        testId: '003',
        description: 'Should support forbidden root directories',
        left: '/tmp/37-perms-test/t3-root/t1-root-left-dir-ok,root-right-dir-forbidden/a',
        right: '/tmp/37-perms-test/t3-root/t1-root-left-dir-ok,root-right-dir-forbidden/b',
        options: { compareSize: true, compareContent: true, handlePermissionDenied: true },
    },
    {
        testId: '004',
        description: 'Should support forbidden root directories (reversed)',
        left: '/tmp/37-perms-test/t3-root/t1-root-left-dir-ok,root-right-dir-forbidden/b',
        right: '/tmp/37-perms-test/t3-root/t1-root-left-dir-ok,root-right-dir-forbidden/a',
        options: { compareSize: true, compareContent: true, handlePermissionDenied: true },
    },
    {
        testId: '005',
        description: 'Should support forbidden root files',
        left: '/tmp/37-perms-test/t3-root/t2-root-left-file-ok,root-right-file-forbidden.txt/a/test.txt',
        right: '/tmp/37-perms-test/t3-root/t2-root-left-file-ok,root-right-file-forbidden.txt/b/test.txt',
        options: { compareSize: true, compareContent: true, handlePermissionDenied: true },
    },
    {
        testId: '006',
        description: 'Should not report permission denied if files are not compared by content',
        left: '/tmp/37-perms-test/t1-files-and-dirs/a',
        right: '/tmp/37-perms-test/t1-files-and-dirs/b',
        options: { compareSize: true, compareContent: false, handlePermissionDenied: true },
    },
    {
        testId: '010',
        description: 'Should not handle permission denied errors when options.handlePermissionDenied is disabled',
        left: '/tmp/37-perms-test/t1-files-and-dirs/a',
        right: '/tmp/37-perms-test/t1-files-and-dirs/b',
        options: { compareSize: true, compareContent: true, handlePermissionDenied: false },
    },
];
function runSingleTest(test, compareFn) {
    return __awaiter(this, void 0, void 0, function* () {
        const outputWriter = new memory_streams_1.default.WritableStream();
        try {
            const compareResult = yield compareFn(test.left, test.right, test.options);
            (0, print_1.default)(compareResult, outputWriter, { showAll: true, wholeReport: true, reason: true });
        }
        catch (error) {
            outputWriter.write(error.toString());
        }
        const compareResultStr = outputWriter.toString();
        const expectedFilePath = (0, path_1.join)(__dirname, 'res', '37-perms-expected', `${test.testId}.txt`);
        const expected = (0, fs_1.readFileSync)(expectedFilePath).toString();
        const ok = compareResultStr === expected;
        const testResult = ok ? `OK` : 'FAIL ' + compareResultStr;
        console.log(`${test.testId} ${test.description}: ${testResult}`);
        if (test.testId === '001') {
            // console.log(compareResultStr)
            // console.log(expected)
        }
        if (!ok) {
            process.exit(1);
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Start permission denied test");
        console.log('Sync');
        for (const test of tests) {
            yield runSingleTest(test, src_1.compareSync);
        }
        console.log('Async');
        for (const test of tests) {
            yield runSingleTest(test, src_1.compare);
        }
        console.log("Done");
    });
}
main()
    .catch(error => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=permissionDeniedTests.js.map