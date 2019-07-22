"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const T = __importStar(require("fp-ts/es6/Task"));
const rxjs_1 = require("rxjs");
const O = __importStar(require("fp-ts/es6/Option"));
const pipeable_1 = require("fp-ts/lib/pipeable");
const Rx = __importStar(require("rxjs/operators"));
exports.URI = 'effe-ts/Cmd';
exports.none = rxjs_1.EMPTY;
exports.of = (a) => rxjs_1.of(T.of(O.some(a)));
exports.getMonoid = () => ({
    concat: (x, y) => rxjs_1.merge(x, y),
    empty: exports.none
});
exports.perform = (task, f) => rxjs_1.of(pipeable_1.pipe(task, T.map(a => O.some(f(a)))));
exports.attempt = (task, f) => exports.perform(task, f);
exports.cmd = {
    URI: exports.URI,
    map: (ma, f) => pipeable_1.pipe(ma, Rx.map(T.map(O.map(f)))),
    of: exports.of,
    ap: (mab, ma) => pipeable_1.pipe(rxjs_1.combineLatest(mab, ma), Rx.map(([mab, ma]) => () => Promise.all([mab(), ma()]).then(([mab, ma]) => O.option.ap(mab, ma))))
};
const { ap, apFirst, apSecond, map } = pipeable_1.pipeable(exports.cmd);
exports.ap = ap;
exports.apFirst = apFirst;
exports.apSecond = apSecond;
exports.map = map;
//# sourceMappingURL=Cmd.js.map