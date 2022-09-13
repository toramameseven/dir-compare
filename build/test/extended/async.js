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
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../src");
const os = require("os");
const deepCompare_1 = require("./deepCompare");
const path1 = `/${os.tmpdir()}/linux-4.3`;
const path2 = `/${os.tmpdir()}/linux-4.4`;
const expectedCompareContent = '{"distinct":8543,"equal":46693,"left":792,"right":1755,"distinctFiles":8543,"equalFiles":43167,"leftFiles":750,"rightFiles":1639,"distinctDirs":0,"equalDirs":3526,"leftDirs":42,"rightDirs":116,"brokenLinks":{"leftBrokenLinks":0,"rightBrokenLinks":0,"distinctBrokenLinks":0,"totalBrokenLinks":0},"permissionDenied":{"leftPermissionDenied":0,"rightPermissionDenied":0,"distinctPermissionDenied":0,"totalPermissionDenied":0},"same":false,"differences":11090,"differencesFiles":10932,"differencesDirs":158,"total":57783,"totalFiles":54099,"totalDirs":3684}';
const expectedCompareSize = '{"distinct":8349,"equal":46887,"left":792,"right":1755,"distinctFiles":8349,"equalFiles":43361,"leftFiles":750,"rightFiles":1639,"distinctDirs":0,"equalDirs":3526,"leftDirs":42,"rightDirs":116,"brokenLinks":{"leftBrokenLinks":0,"rightBrokenLinks":0,"distinctBrokenLinks":0,"totalBrokenLinks":0},"permissionDenied":{"leftPermissionDenied":0,"rightPermissionDenied":0,"distinctPermissionDenied":0,"totalPermissionDenied":0},"differences":10896,"differencesFiles":10738,"differencesDirs":158,"total":57783,"totalFiles":54099,"totalDirs":3684,"same":false}';
let referenceTime = Date.now();
let successfulTimerHitCount = 0;
let failedTimerHitCount = 0;
function asyncTest(expectedDiffMs, errThresholdMs, expectedResult, options) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Start async test (${JSON.stringify(options)})`);
        const printDiff = () => printTimeDiff(expectedDiffMs, errThresholdMs);
        const timer = setInterval(printDiff, expectedDiffMs);
        const result = yield (0, src_1.compare)(path1, path2, options);
        clearInterval(timer);
        const ok = (0, deepCompare_1.deepCompare)(result, JSON.parse(expectedResult));
        const okSuccessfulTimerHitCount = successfulTimerHitCount > 4;
        const okFailedTimerHitCount = failedTimerHitCount < 6;
        console.log(`Async test - successfulTimerHit: %s, failedTimerHit: %s, result: %s`, (okSuccessfulTimerHitCount ? 'OK' : 'FAIL'), (okFailedTimerHitCount ? 'OK' : 'FAIL'), (ok ? 'OK' : `FAIL - ${JSON.stringify(result)}`));
        if (!ok || !okSuccessfulTimerHitCount || !okFailedTimerHitCount) {
            process.exit(1);
        }
        console.log("Done");
    });
}
function printTimeDiff(expectedDiffMs, errThresholdMs) {
    const diffMs = Date.now() - referenceTime;
    const ok = Math.abs(expectedDiffMs - diffMs) < errThresholdMs;
    console.log('Diff: %d %s', diffMs, (ok ? 'OK' : 'FAIL'));
    referenceTime = Date.now();
    if (ok) {
        successfulTimerHitCount++;
    }
    else {
        failedTimerHitCount++;
    }
}
asyncTest(100, 10, expectedCompareContent, { compareContent: true, noDiffSet: true })
    .then(() => asyncTest(100, 10, expectedCompareSize, { compareSize: true, noDiffSet: true }))
    .catch(error => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=async.js.map