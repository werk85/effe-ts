"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
const pipeable_1 = require("fp-ts/lib/pipeable");
const R = __importStar(require("fp-ts-rxjs/lib/Observable"));
const sub = __importStar(require("./Sub"));
exports.now = () => __awaiter(void 0, void 0, void 0, function* () { return new Date().getTime(); });
function every(time, f) {
    return sub.fromObservable(pipeable_1.pipe(rxjs_1.interval(time), R.map(() => f(new Date().getTime()))));
}
exports.every = every;
//# sourceMappingURL=Time.js.map