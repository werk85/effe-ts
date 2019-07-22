"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const E = __importStar(require("fp-ts/es6/Either"));
const pipeable_1 = require("fp-ts/es6/pipeable");
const TE = __importStar(require("fp-ts/es6/TaskEither"));
const unionize_1 = require("unionize");
const Cmd_1 = require("./Cmd");
exports.HttpErrorResponse = unionize_1.unionize({
    UnknownError: unionize_1.ofType(),
    ValidationErrors: unionize_1.ofType()
});
const unknownError = (error) => exports.HttpErrorResponse.UnknownError({ error: E.toError(error) });
exports.request = (req) => pipeable_1.pipe(TE.tryCatch(() => fetch(req.url, Object.assign({}, req, { body: typeof req.body !== 'undefined' ? JSON.stringify(req.body) : undefined })), unknownError), TE.chain(response => pipeable_1.pipe(TE.tryCatch(() => response.json(), unknownError), TE.chain(json => TE.fromEither(pipeable_1.pipe(req.decoder.decode(json), E.mapLeft(errors => exports.HttpErrorResponse.ValidationErrors({ value: json, errors }))))), TE.map(body => ({
    ok: response.ok,
    status: response.status,
    body
})))));
exports.get = (url, type) => ({
    url,
    method: 'GET',
    decoder: type,
    headers: {
        'Content-Type': 'application/json'
    }
});
exports.post = (url, body, type) => ({
    url,
    method: 'POST',
    decoder: type,
    headers: {
        'Content-Type': 'application/json'
    },
    body
});
exports.send = (req, f) => Cmd_1.attempt(exports.request(req), f);
//# sourceMappingURL=Http.js.map