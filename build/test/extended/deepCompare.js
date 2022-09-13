"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepCompare = void 0;
function deepCompare(obj1, obj2) {
    const obj1Keys = Object.keys(obj1);
    const obj2Keys = Object.keys(obj2);
    const allKeys = new Set([...obj1Keys, ...obj2Keys]);
    for (const objKey of allKeys) {
        if (obj1[objKey] !== obj2[objKey]) {
            if (typeof obj1[objKey] == "object" && typeof obj2[objKey] == "object") {
                if (!deepCompare(obj1[objKey], obj2[objKey])) {
                    return false;
                }
            }
            else {
                return false;
            }
        }
    }
    return true;
}
exports.deepCompare = deepCompare;
//# sourceMappingURL=deepCompare.js.map