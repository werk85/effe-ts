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
const pipeable_1 = require("fp-ts/lib/pipeable");
const R = __importStar(require("fp-ts-rxjs/lib/Observable"));
const T = __importStar(require("fp-ts/lib/Task"));
const sub = __importStar(require("./Sub"));
const html = __importStar(require("./Html"));
const Cmd_1 = require("./Cmd");
function history(history) {
    return {
        location: history.location,
        push: url => () => history.push(url),
        goBack: () => history.goBack(),
        listen: f => () => history.listen(f)
    };
}
exports.history = history;
exports.push = (url) => Cmd_1.perform_(env => T.fromIO(env.history.push(url)));
exports.goBack = () => Cmd_1.perform_(env => T.fromIO(env.history.goBack));
function program(locationToMessage, init, update, view, subscriptions = sub.none) {
    const monoidSubR = sub.getMonoid();
    return env => {
        const location$ = new rxjs_1.Subject();
        const onChangeLocation = sub.fromObservable(pipeable_1.pipe(location$, R.map(location => locationToMessage(location))));
        const subs = monoidSubR.concat(subscriptions, onChangeLocation);
        return Object.assign(Object.assign({}, html.program(init(env.history.location), update, view, subs)(env)), { listen: env.history.listen(location => location$.next(location)) });
    };
}
exports.program = program;
function run(program, renderer, env) {
    const p = program(env);
    p.listen();
    return html.run(() => p, renderer, env);
}
exports.run = run;
//# sourceMappingURL=Navigation.js.map