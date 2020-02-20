"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Rr = __importStar(require("fp-ts/lib/Reader"));
const pipeable_1 = require("fp-ts/lib/pipeable");
const Apply_1 = require("fp-ts/lib/Apply");
const RO = __importStar(require("fp-ts-rxjs/lib/ReaderObservable"));
const R = __importStar(require("fp-ts-rxjs/lib/Observable"));
exports.URI = 'effe-ts/Sub';
function fromObservable(actions$) {
    return Rr.of(Rr.of(actions$));
}
exports.fromObservable = fromObservable;
function fromCmd(cmd) {
    return Rr.of(cmd);
}
exports.fromCmd = fromCmd;
const monoidObservable = RO.getMonoid();
exports.none = fromCmd(monoidObservable.empty);
function getMonoid() {
    const monoidObservable = RO.getMonoid();
    return {
        concat: (x, y) => model$ => monoidObservable.concat(x(model$), y(model$)),
        empty: exports.none
    };
}
exports.getMonoid = getMonoid;
exports.sub = {
    URI: exports.URI,
    map: (ma, f) => model$ => RO.map(f)(ma(model$)),
    promap: (fbc, f, g) => model$ => pipeable_1.pipe(model$, R.map(f), fbc, RO.map(g)),
    ap: (mab, ma) => model$ => pipeable_1.pipe(Apply_1.sequenceT(RO.readerObservable)(mab(model$), ma(model$)), RO.map(([f, a]) => f(a))),
    of: a => Rr.of(RO.of(a)),
    chain: (ma, f) => model$ => pipeable_1.pipe(ma(model$), RO.chain(a => f(a)(model$)))
};
const { ap, apFirst, apSecond, chain, map, chainFirst, flatten, promap } = pipeable_1.pipeable(exports.sub);
exports.ap = ap;
exports.apFirst = apFirst;
exports.apSecond = apSecond;
exports.chain = chain;
exports.map = map;
exports.chainFirst = chainFirst;
exports.flatten = flatten;
exports.promap = promap;
//# sourceMappingURL=Sub.js.map