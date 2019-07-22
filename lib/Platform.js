"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const O = __importStar(require("fp-ts/es6/Option"));
const pipeable_1 = require("fp-ts/es6/pipeable");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const Sub_1 = require("./Sub");
function program(init, reducer, subscriptions = () => Sub_1.none) {
    const state$ = new rxjs_1.BehaviorSubject(init);
    const dispatch = action => state$.next(reducer(action, state$.value[0]));
    const model$ = pipeable_1.pipe(state$, operators_1.map(state => state[0]), operators_1.distinctUntilChanged(), operators_1.share());
    const cmd$ = pipeable_1.pipe(state$, operators_1.map(state => state[1]), operators_1.mergeAll());
    const sub$ = pipeable_1.pipe(model$, operators_1.startWith(init[0]), operators_1.switchMap(model => subscriptions(model)));
    return { cmd$, dispatch, model$, sub$ };
}
exports.program = program;
function programWithFlags(init, update, subscriptions = () => Sub_1.none) {
    return flags => program(init(flags), update, subscriptions);
}
exports.programWithFlags = programWithFlags;
function run(program) {
    const { dispatch, cmd$, model$, sub$ } = program;
    sub$.subscribe(dispatch);
    cmd$.subscribe(cmd => cmd().then(O.map(dispatch)));
    return model$;
}
exports.run = run;
//# sourceMappingURL=Platform.js.map