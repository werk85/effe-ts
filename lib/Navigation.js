"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const O = __importStar(require("fp-ts/es6/Option"));
const pipeable_1 = require("fp-ts/es6/pipeable");
const Rx = __importStar(require("rxjs/operators"));
const Sub_1 = require("./Sub");
const html = __importStar(require("./Html"));
exports.navigation = (history) => {
    const push = (url) => rxjs_1.of(() => __awaiter(this, void 0, void 0, function* () {
        history.push(url);
        return O.none;
    }));
    const program = (locationToMessage, init, update, view, subscriptions = () => Sub_1.none) => {
        const location$ = new rxjs_1.Subject();
        history.listen(location => location$.next(location));
        const onChangeLocation$ = pipeable_1.pipe(location$, Rx.map(location => locationToMessage(location)));
        const subs = (model) => Sub_1.batch([subscriptions(model), onChangeLocation$]);
        return html.program(init(history.location), update, view, subs);
    };
    const programWithFlags = (locationToMessage, init, update, view, subscriptions = () => Sub_1.none) => (flags) => program(locationToMessage, init(flags), update, view, subscriptions);
    return { program, programWithFlags, push };
};
//# sourceMappingURL=Navigation.js.map