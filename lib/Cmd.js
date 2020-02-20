"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const RO = __importStar(require("fp-ts-rxjs/lib/ReaderObservable"));
const R = __importStar(require("fp-ts-rxjs/lib/Observable"));
const pipeable_1 = require("fp-ts/lib/pipeable");
const monoidReaderObservable = RO.getMonoid();
exports.none = monoidReaderObservable.empty;
function perform(task, f) {
    return r => pipeable_1.pipe(R.fromTask(task(r)), R.map(f));
}
exports.perform = perform;
function perform_(task) {
    return r => pipeable_1.pipe(R.fromTask(task(r)), R.chain(() => rxjs_1.EMPTY));
}
exports.perform_ = perform_;
function attempt(task, f) {
    return perform(task, f);
}
exports.attempt = attempt;
exports.cmd = RO.readerObservable;
__export(require("fp-ts-rxjs/lib/ReaderObservable"));
//# sourceMappingURL=Cmd.js.map