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
const TE = __importStar(require("fp-ts/lib/TaskEither"));
const E = __importStar(require("fp-ts/lib/Either"));
const O = __importStar(require("fp-ts/lib/Option"));
const ts_union_1 = require("ts-union");
const pipeable_1 = require("fp-ts/lib/pipeable");
const IORef_1 = require("fp-ts/lib/IORef");
const R = __importStar(require("fp-ts/lib/Record"));
const Cmd_1 = require("./Cmd");
const traverseOE = O.option.traverse(E.either);
exports.StorageError = ts_union_1.Union({
    NativeError: ts_union_1.of(),
    ValidationErrors: ts_union_1.of()
});
exports.entity = (key, type) => ({
    key,
    type
});
exports.localStorage = {
    get: key => TE.tryCatch(() => __awaiter(void 0, void 0, void 0, function* () { return O.fromNullable(JSON.parse(window.localStorage.getItem(key) || 'null')); }), E.toError),
    set: (key, value) => TE.tryCatch(() => __awaiter(void 0, void 0, void 0, function* () { return window.localStorage.setItem(key, JSON.stringify(value)); }), E.toError),
    remove: key => TE.tryCatch(() => __awaiter(void 0, void 0, void 0, function* () { return window.localStorage.removeItem(key); }), E.toError)
};
function memoryStorage(store = new IORef_1.IORef({})) {
    return {
        get: key => pipeable_1.pipe(TE.rightIO(store.read), TE.map(store => R.lookup(key, store))),
        set: (key, value) => TE.rightIO(store.modify(R.insertAt(key, value))),
        remove: key => TE.rightIO(store.modify(R.deleteAt(key)))
    };
}
exports.memoryStorage = memoryStorage;
exports.get = (entity) => env => pipeable_1.pipe(env.storage.get(entity.key), TE.mapLeft(exports.StorageError.NativeError), TE.chain(value => pipeable_1.pipe(traverseOE(value, value => pipeable_1.pipe(entity.type.decode(value), E.mapLeft(errors => exports.StorageError.ValidationErrors(errors, value)))), TE.fromEither)));
exports.set = (entity) => (value) => env => pipeable_1.pipe(env.storage.set(entity.key, entity.type.encode(value)), TE.mapLeft(exports.StorageError.NativeError));
exports.remove = (entity) => env => pipeable_1.pipe(env.storage.remove(entity.key), TE.mapLeft(exports.StorageError.NativeError));
exports.load = (entity, f) => Cmd_1.attempt(exports.get(entity), f);
exports.save = (entity) => (value) => Cmd_1.perform_(exports.set(entity)(value));
exports.purge = (entity) => Cmd_1.perform_(exports.remove(entity));
//# sourceMappingURL=Storage.js.map