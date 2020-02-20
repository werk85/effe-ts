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
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const R = __importStar(require("fp-ts-rxjs/lib/Observable"));
const RO = __importStar(require("fp-ts-rxjs/lib/ReaderObservable"));
const Monoid_1 = require("fp-ts/lib/Monoid");
const sub = __importStar(require("./Sub"));
const state = __importStar(require("./State"));
function program(init, update, subscriptions = sub.none) {
    return env => {
        const state$ = new rxjs_1.BehaviorSubject(init);
        const dispatch = action => state$.next(pipeable_1.pipe(state.model(state$.value), update(action)));
        const model$ = pipeable_1.pipe(state$, R.map(state.model), operators_1.distinctUntilChanged(), operators_1.share());
        const cmd$ = pipeable_1.pipe(state$, RO.fromObservable, RO.chain(state.cmd));
        const sub$ = subscriptions(model$);
        const action$ = pipeable_1.pipe(env, Monoid_1.fold(RO.getMonoid())([cmd$, sub$]));
        return { action$, dispatch, model$ };
    };
}
exports.program = program;
function run(program, env) {
    const { action$, dispatch, model$ } = program(env);
    action$.subscribe(dispatch);
    return model$;
}
exports.run = run;
//# sourceMappingURL=Platform.js.map