"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const Rx = __importStar(require("rxjs/operators"));
function map(sub, f) {
    return Rx.map(f)(sub);
}
exports.map = map;
function batch(arr) {
    return rxjs_1.merge(...arr);
}
exports.batch = batch;
exports.none = rxjs_1.EMPTY;
//# sourceMappingURL=Sub.js.map