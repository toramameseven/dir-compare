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
const path = require("path");
const PATH1 = path.join(__dirname, 'res/line-based-handler/lf');
const PATH2 = path.join(__dirname, 'res/line-based-handler/crlf-spaces');
const BASE_OPTIONS = {
    compareContent: true,
    compareFileSync: src_1.fileCompareHandlers.lineBasedFileCompare.compareSync,
    compareFileAsync: src_1.fileCompareHandlers.lineBasedFileCompare.compareAsync,
    ignoreLineEnding: true,
    ignoreWhiteSpaces: true,
    ignoreEmptyLines: true,
};
const MAX_BUFFER_SIZE = 100;
function warmup() {
    const baseOptions = {
        compareContent: true,
        compareFileSync: src_1.fileCompareHandlers.lineBasedFileCompare.compareSync,
        compareFileAsync: src_1.fileCompareHandlers.lineBasedFileCompare.compareAsync,
        ignoreLineEnding: true,
        ignoreWhiteSpaces: true,
        ignoreEmptyLines: true,
    };
    for (let i = 1; i < 50; i++) {
        (0, src_1.compareSync)(PATH1, PATH2, baseOptions);
    }
}
function runSingleTest(compareFn) {
    return __awaiter(this, void 0, void 0, function* () {
        const durations = [];
        for (let bufferSize = 1; bufferSize < MAX_BUFFER_SIZE; bufferSize++) {
            const options = Object.assign(Object.assign({}, BASE_OPTIONS), { lineBasedHandlerBufferSize: bufferSize });
            const t1 = Date.now();
            const res = yield compareFn(PATH1, PATH2, options);
            const duration = Date.now() - t1;
            durations.push(duration);
            const ok = res.same;
            const testResult = ok ? `ok ${duration}ms` : 'fail';
            console.log(`bufferSize ${bufferSize}: ${testResult}`);
            if (!ok) {
                process.exit(1);
            }
        }
        const bufferSizeUseOk = durations[0] > durations[4] * 2;
        if (!bufferSizeUseOk) {
            console.log('Fail: Buffer size not used');
            process.exit(1);
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Start line based handler test");
        warmup();
        console.log('Sync');
        yield runSingleTest(src_1.compareSync);
        console.log('Async');
        yield runSingleTest(src_1.compare);
        console.log("Done");
    });
}
main()
    .catch(error => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=lineBasedFileCompareTest.js.map