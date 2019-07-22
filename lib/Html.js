"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const pipeable_1 = require("fp-ts/es6/pipeable");
const Rx = __importStar(require("rxjs/operators"));
const Sub_1 = require("./Sub");
const platform = __importStar(require("./Platform"));
function map(ha, f) {
    return dispatch => ha(a => dispatch(f(a)));
}
exports.map = map;
function program(init, update, view, subscriptions = () => Sub_1.none) {
    const { dispatch, cmd$, sub$, model$ } = platform.program(init, update, subscriptions);
    const html$ = pipeable_1.pipe(model$, Rx.map(model => view(model)));
    return { dispatch, cmd$, sub$, model$, html$ };
}
exports.program = program;
exports.programWithFlags = (init, update, view, subscriptions) => (flags) => program(init(flags), update, view, subscriptions);
exports.run = (program, renderer) => {
    const { dispatch, html$ } = program;
    html$.subscribe(html => renderer(html(dispatch)));
    return platform.run(program);
};
//# sourceMappingURL=Html.js.map