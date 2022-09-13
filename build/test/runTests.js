"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tests_1 = require("./tests");
const safe_1 = __importDefault(require("colors/safe"));
const util_1 = __importDefault(require("util"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const temp_1 = __importDefault(require("temp"));
const print_1 = __importDefault(require("./print"));
const memory_streams_1 = __importDefault(require("memory-streams"));
const src_1 = require("../src");
const untar_1 = __importDefault(require("./untar"));
const semver_1 = __importDefault(require("semver"));
let count = 0, failed = 0, successful = 0;
let syncCount = 0, syncFailed = 0, syncSuccessful = 0;
let asyncCount = 0, asyncFailed = 0, asyncSuccessful = 0;
// Automatically track and cleanup files at exit
temp_1.default.track();
function passed(value, type) {
    count++;
    if (value) {
        successful++;
    }
    else {
        failed++;
    }
    if (type === 'sync') {
        syncCount++;
        if (value) {
            syncSuccessful++;
        }
        else {
            syncFailed++;
        }
    }
    if (type === 'async') {
        asyncCount++;
        if (value) {
            asyncSuccessful++;
        }
        else {
            asyncFailed++;
        }
    }
    return value ? safe_1.default.green('Passed') : safe_1.default.yellow('!!!!FAILED!!!!');
}
// Matches date (ie 2014-11-18T21:32:39.000Z)
const normalizeDateRegexp = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/gm;
function normalize(str) {
    str = str.replace(normalizeDateRegexp, 'x');
    str = str.replace(/\r\n/g, '\n');
    str = str.replace(/\\/g, '/');
    return str;
}
function checkStatistics(statistics, test) {
    if (test.skipStatisticsCheck) {
        return true;
    }
    if (statistics.differences !== statistics.left + statistics.right + statistics.distinct) {
        return false;
    }
    if (statistics.differencesFiles !== statistics.leftFiles + statistics.rightFiles + statistics.distinctFiles) {
        return false;
    }
    if (statistics.differencesDirs !== statistics.leftDirs + statistics.rightDirs + statistics.distinctDirs) {
        return false;
    }
    if (statistics.total !== statistics.equal + statistics.differences) {
        return false;
    }
    if (statistics.totalFiles !== statistics.equalFiles + statistics.differencesFiles) {
        return false;
    }
    if (statistics.totalDirs !== statistics.equalDirs + statistics.differencesDirs) {
        return false;
    }
    const brokenLinksStats = statistics.brokenLinks;
    if (brokenLinksStats.totalBrokenLinks !== brokenLinksStats.leftBrokenLinks + brokenLinksStats.rightBrokenLinks + brokenLinksStats.distinctBrokenLinks) {
        return false;
    }
    if (statistics.total !== statistics.totalDirs + statistics.totalFiles + brokenLinksStats.totalBrokenLinks) {
        return false;
    }
    if (statistics.equal !== statistics.equalDirs + statistics.equalFiles) {
        return false;
    }
    if (statistics.left !== statistics.leftDirs + statistics.leftFiles + brokenLinksStats.leftBrokenLinks) {
        return false;
    }
    if (statistics.right !== statistics.rightDirs + statistics.rightFiles + brokenLinksStats.rightBrokenLinks) {
        return false;
    }
    if (statistics.distinct !== statistics.distinctDirs + statistics.distinctFiles + brokenLinksStats.distinctBrokenLinks) {
        return false;
    }
    return true;
}
function getExpected(test) {
    if (test.expected) {
        return test.expected.trim();
    }
    const expectedFilePath = __dirname + '/expected/' + test.name + '.txt';
    if (!fs_1.default.existsSync(expectedFilePath)) {
        return '';
    }
    return normalize(fs_1.default.readFileSync(expectedFilePath, 'utf8')).trim();
}
function testSync(test, testDirPath, saveReport, runOptions) {
    process.chdir(testDirPath);
    let path1, path2;
    if (test.withRelativePath) {
        path1 = test.path1;
        path2 = test.path2;
    }
    else {
        path1 = test.path1 ? testDirPath + '/' + test.path1 : '';
        path2 = test.path2 ? testDirPath + '/' + test.path2 : '';
    }
    return new Promise(resolve => resolve((0, src_1.compareSync)(path1, path2, test.options)))
        .then((result) => {
        // PRINT DETAILS
        const writer = new memory_streams_1.default.WritableStream();
        const print = test.print ? test.print : print_1.default;
        print(result, writer, test.displayOptions);
        const output = normalize(writer.toString()).trim();
        const expected = getExpected(test);
        const statisticsCheck = checkStatistics(result, test);
        const validated = runCustomValidator(test, result);
        const res = expected === output && statisticsCheck && validated;
        if (runOptions.showResult) {
            printResult(output, expected, res);
        }
        report(test.name, 'sync', output, null, res, saveReport);
        console.log(test.name + ' sync: ' + passed(res, 'sync'));
    })
        .catch(error => {
        if (test.expectedError && JSON.stringify(error).includes(test.expectedError)) {
            report(test.name, 'sync', error instanceof Error ? error.stack : error, null, true, saveReport);
            console.log(test.name + ' sync: ' + passed(true, 'sync'));
            return;
        }
        report(test.name, 'sync', error instanceof Error ? error.stack : error, null, false, saveReport);
        console.log(test.name + ' sync: ' + passed(false, 'sync') + '. Error: ' + printError(error));
    });
}
function testAsync(test, testDirPath, saveReport, runOptions) {
    if (runOptions.skipAsync) {
        return Promise.resolve();
    }
    process.chdir(testDirPath);
    let path1, path2;
    if (test.withRelativePath) {
        path1 = test.path1;
        path2 = test.path2;
    }
    else {
        path1 = test.path1 ? testDirPath + '/' + test.path1 : '';
        path2 = test.path2 ? testDirPath + '/' + test.path2 : '';
    }
    let promise;
    if (test.runAsync) {
        promise = test.runAsync()
            .then(result => ({ output: result, statisticsCheck: true, validated: true }));
    }
    else {
        promise = (0, src_1.compare)(path1, path2, test.options)
            .then(result => {
            const writer = new memory_streams_1.default.WritableStream();
            const print = test.print ? test.print : print_1.default;
            print(result, writer, test.displayOptions);
            const statisticsCheck = checkStatistics(result, test);
            const output = normalize(writer.toString()).trim();
            const validated = runCustomValidator(test, result);
            return { output, statisticsCheck, validated };
        });
    }
    return promise
        .then(result => {
        const output = result.output;
        const expected = getExpected(test);
        const res = expected === output && result.statisticsCheck && result.validated;
        if (runOptions.showResult) {
            printResult(output, expected, res);
        }
        report(test.name, 'async', output, null, res, saveReport);
        console.log(test.name + ' async: ' + passed(res, 'async'));
    })
        .catch(error => {
        if (test.expectedError && JSON.stringify(error).includes(test.expectedError)) {
            report(test.name, 'async', error instanceof Error ? error.stack : error, null, true, saveReport);
            console.log(test.name + ' async: ' + passed(true, 'async'));
            return;
        }
        report(test.name, 'async', error instanceof Error ? error.stack : error, null, false, saveReport);
        console.log(test.name + ' async: ' + passed(false, 'async') + '. Error: ' + printError(error));
    });
}
function printError(error) {
    return error instanceof Error ? error.stack : error;
}
function initReport(saveReport) {
    if (saveReport) {
        if (fs_1.default.existsSync(REPORT_FILE)) {
            fs_1.default.unlinkSync(REPORT_FILE);
        }
        fs_1.default.appendFileSync(REPORT_FILE, util_1.default.format('Date: %s, Node version: %s. OS platform: %s, OS release: %s\n', new Date(), process.version, os_1.default.platform(), os_1.default.release()));
    }
}
const REPORT_FILE = __dirname + "/report.txt";
function report(testName, testDescription, output, exitCode, result, saveReport) {
    if (saveReport && !result) {
        fs_1.default.appendFileSync(REPORT_FILE, util_1.default.format("\n%s %s failed - result: %s, exitCode: %s, output: %s\n", testName, testDescription, result, exitCode ? exitCode : 'n/a', output ? output : 'n/a'));
    }
}
function endReport(saveReport) {
    if (saveReport) {
        fs_1.default.appendFileSync(REPORT_FILE, 'Tests: ' + count + ', failed: ' + failed + ', succeeded: ' + successful);
    }
}
function printResult(output, expected, result) {
    console.log('Actual:');
    console.log(output);
    console.log('Expected:');
    console.log(expected);
    console.log('Result: ' + result);
}
function validatePlatform(test) {
    if (!test.excludePlatform || test.excludePlatform.length === 0) {
        return true;
    }
    return !includes(test.excludePlatform, os_1.default.platform());
}
function includes(arr, item) {
    return arr.filter(v => v === item).length === 1;
}
function runCustomValidator(test, statistics) {
    if (!test.customValidator) {
        return true;
    }
    return test.customValidator(statistics);
}
/**
 * @param testDirPath path to test data
 */
function executeTests(testDirPath, runOptions) {
    console.log('Test dir: ' + testDirPath);
    const saveReport = !runOptions.noReport;
    initReport(saveReport);
    Promise.resolve()
        .then(() => {
        // Run sync tests
        const syncTestsPromises = [];
        (0, tests_1.getTests)(testDirPath)
            .filter(test => !test.onlyAsync)
            .filter(test => runOptions.singleTestName ? test.name === runOptions.singleTestName : true)
            .filter(test => test.nodeVersionSupport === undefined || semver_1.default.satisfies(process.version, test.nodeVersionSupport))
            .filter(test => validatePlatform(test))
            .forEach(test => syncTestsPromises.push(testSync(test, testDirPath, saveReport, runOptions)));
        return Promise.all(syncTestsPromises);
    })
        .then(() => {
        console.log();
        console.log('Sync tests: ' + syncCount + ', failed: ' + safe_1.default.yellow(syncFailed.toString()) + ', succeeded: ' + safe_1.default.green(syncSuccessful.toString()));
        console.log();
    })
        .then(() => {
        // Run async tests
        const asyncTestsPromises = [];
        (0, tests_1.getTests)(testDirPath)
            .filter(test => !test.onlySync)
            .filter(test => test.nodeVersionSupport === undefined || semver_1.default.satisfies(process.version, test.nodeVersionSupport))
            .filter(test => validatePlatform(test))
            .filter(test => runOptions.singleTestName ? test.name === runOptions.singleTestName : true)
            .forEach(test => asyncTestsPromises.push(testAsync(test, testDirPath, saveReport, runOptions)));
        return Promise.all(asyncTestsPromises);
    })
        .then(() => {
        console.log();
        console.log('Async tests: ' + asyncCount + ', failed: ' + safe_1.default.yellow(asyncFailed.toString()) + ', succeeded: ' + safe_1.default.green(asyncSuccessful.toString()));
        console.log();
    }).then(() => {
        console.log();
        console.log('All tests: ' + count + ', failed: ' + safe_1.default.yellow(failed.toString()) + ', succeeded: ' + safe_1.default.green(successful.toString()));
        endReport(saveReport);
        process.exitCode = failed > 0 ? 1 : 0;
        process.chdir(__dirname); // allow temp dir to be removed
    }).catch(error => {
        console.error(error);
        process.exit(1);
    });
}
function main() {
    const args = process.argv;
    const runOptions = {
        unpacked: false,
        showResult: false,
        skipAsync: false,
        noReport: false,
        singleTestName: undefined
    };
    args.forEach(arg => {
        if (arg.match('unpacked')) {
            runOptions.unpacked = true;
        }
        if (arg.match('showresult')) {
            runOptions.showResult = true;
        }
        if (arg.match('skipasync')) {
            runOptions.skipAsync = true;
        }
        if (arg.match('noreport')) {
            runOptions.noReport = true;
        }
        if (arg.match(/test\d\d\d_\d/)) {
            runOptions.singleTestName = arg;
        }
    });
    if (runOptions.unpacked) {
        executeTests(__dirname + '/testdir', runOptions);
    }
    else {
        temp_1.default.mkdir('dircompare-test', (err, testDirPath) => {
            if (err) {
                throw err;
            }
            const onError = (error) => {
                console.error('Error occurred:', error);
            };
            (0, untar_1.default)(__dirname + "/testdir.tar", testDirPath, () => { executeTests(testDirPath, runOptions); }, onError);
        });
    }
}
main();
//# sourceMappingURL=runTests.js.map