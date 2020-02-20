"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const pipeable_1 = require("fp-ts/lib/pipeable");
const RO = __importStar(require("fp-ts-rxjs/lib/ReaderObservable"));
const monoidReaderObservable = RO.getMonoid();
exports.URI = 'effe-ts/State';
exports.model = (state) => state[0];
exports.cmd = (state) => state[1];
exports.of = (model) => [model, monoidReaderObservable.empty];
function getSemigroup(S) {
    return {
        concat: (x, y) => [S.concat(exports.model(x), exports.model(y)), monoidReaderObservable.concat(exports.cmd(x), exports.cmd(y))]
    };
}
exports.getSemigroup = getSemigroup;
function getMonoid(M) {
    return Object.assign(Object.assign({}, getSemigroup(M)), { empty: exports.of(M.empty) });
}
exports.getMonoid = getMonoid;
exports.state = {
    URI: exports.URI,
    compose: (ba, ae) => [exports.model(ba), exports.cmd(ae)],
    map: (ma, f) => [f(ma[0]), ma[1]],
    bimap: (ma, f, g) => [g(exports.model(ma)), RO.readerObservable.map(exports.cmd(ma), f)],
    mapLeft: (ma, f) => [exports.model(ma), RO.readerObservable.map(exports.cmd(ma), f)],
    ap: (fab, fa) => [exports.model(fab)(exports.model(fa)), monoidReaderObservable.concat(exports.cmd(fab), exports.cmd(fa))],
    of: exports.of,
    chain: (fa, f) => {
        const [b, s] = f(exports.model(fa));
        return [b, monoidReaderObservable.concat(exports.cmd(fa), s)];
    },
    extract: exports.model,
    extend: (ae, f) => [f(ae), exports.cmd(ae)],
    reduce: (ae, b, f) => f(b, exports.model(ae)),
    foldMap: _ => (ae, f) => f(exports.model(ae)),
    reduceRight: (ae, b, f) => f(exports.model(ae), b),
    traverse: (F) => (as, f) => {
        return F.map(f(exports.model(as)), b => [b, exports.cmd(as)]);
    },
    sequence: (F) => (fas) => {
        return F.map(exports.model(fas), a => [a, exports.cmd(fas)]);
    }
};
const { ap, apFirst, apSecond, bimap, chain, chainFirst, compose, duplicate, extend, flatten, foldMap, map, mapLeft, reduce, reduceRight } = pipeable_1.pipeable(exports.state);
exports.ap = ap;
exports.apFirst = apFirst;
exports.apSecond = apSecond;
exports.bimap = bimap;
exports.chain = chain;
exports.chainFirst = chainFirst;
exports.compose = compose;
exports.duplicate = duplicate;
exports.extend = extend;
exports.flatten = flatten;
exports.foldMap = foldMap;
exports.map = map;
exports.mapLeft = mapLeft;
exports.reduce = reduce;
exports.reduceRight = reduceRight;
//# sourceMappingURL=State.js.map