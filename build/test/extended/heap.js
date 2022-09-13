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
const path1 = `/${os.tmpdir()}/linux-4.3`;
const path2 = `/${os.tmpdir()}/linux-4.4`;
const durationSeconds = 30;
const MB = 1024 * 1024;
const MAX_HEAP_MB = 300;
function testHeap(testType, compareFn) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Start ${testType} heap test`);
        const startTime = Date.now();
        while (durationSeconds > (Date.now() - startTime) / 1000) {
            const t1 = Date.now();
            const result = yield compareFn(path1, path2, { compareContent: true });
            if (result.diffSet && result.totalFiles !== 54099) {
                console.error(`Different number of files found: ${result.totalFiles}`);
                process.exit(1);
            }
            const t2 = new Date().getTime();
            const heapMb = Math.round(process.memoryUsage().heapUsed / MB);
            const heapOk = heapMb < MAX_HEAP_MB;
            console.log(`${(t2 - t1) / 1000}s, heap: ${heapMb}MB, ${heapOk ? 'OK' : 'FAIL'}`);
        }
        console.log("Done");
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield testHeap('sync', src_1.compareSync);
        yield testHeap('async', src_1.compare);
    });
}
main().catch(error => console.error(error));
//# sourceMappingURL=heap.js.map