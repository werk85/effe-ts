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
const R = __importStar(require("fp-ts-rxjs/lib/Observable"));
const sub = __importStar(require("./Sub"));
const platform = __importStar(require("./Platform"));
exports.URI = 'effe-ts/Html';
exports.html = {
    URI: exports.URI,
    map: (fa, f) => dispatch => fa(a => dispatch(f(a)))
};
const { map } = pipeable_1.pipeable(exports.html);
exports.map = map;
function program(init, update, view, subscriptions = sub.none) {
    return env => {
        const { dispatch, action$, model$ } = platform.program(init, update, subscriptions)(env);
        const html$ = pipeable_1.pipe(model$, R.map(model => view(model)));
        return { dispatch, action$, model$, html$ };
    };
}
exports.program = program;
function run(program, renderer, env) {
    const p = program(env);
    p.html$.subscribe(html => renderer(html(p.dispatch)));
    return platform.run(() => p, env);
}
exports.run = run;
//# sourceMappingURL=Html.js.map