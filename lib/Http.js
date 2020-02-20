"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const E = __importStar(require("fp-ts/lib/Either"));
const pipeable_1 = require("fp-ts/lib/pipeable");
const TE = __importStar(require("fp-ts/lib/TaskEither"));
const ts_union_1 = require("ts-union");
const R = __importStar(require("fp-ts/lib/Record"));
const Cmd_1 = require("./Cmd");
exports.HttpErrorResponse = ts_union_1.Union({
    BadStatusError: ts_union_1.of(),
    UnknownError: ts_union_1.of(),
    ParseError: ts_union_1.of(),
    ValidationErrors: ts_union_1.of()
});
const parseError = (error) => exports.HttpErrorResponse.ParseError(E.toError(error));
const convertHeaders = (headers) => {
    let result = {};
    headers.forEach((value, key) => {
        result = R.insertAt(key, value)(result);
    });
    return result;
};
const convertResponse = (response, body) => ({
    headers: convertHeaders(response.headers),
    status: {
        code: response.status,
        text: response.statusText
    },
    body,
    url: response.url
});
function mkFetch(defaults = {}) {
    return req => pipeable_1.pipe(TE.tryCatch(() => {
        var _a;
        return window.fetch(((_a = defaults.baseUrl) !== null && _a !== void 0 ? _a : '') + req.url, Object.assign(Object.assign(Object.assign({}, defaults), req), { body: typeof req.body !== 'undefined' ? JSON.stringify(req.body) : defaults.body }));
    }, E.toError), TE.chain(response => pipeable_1.pipe(TE.tryCatch(() => response.text(), E.toError), TE.map(body => convertResponse(response, body)))));
}
exports.mkFetch = mkFetch;
exports.request = (req) => env => pipeable_1.pipe(env.http(req), TE.mapLeft(exports.HttpErrorResponse.UnknownError), TE.chain(response => response.status.code >= 400 ? TE.left(exports.HttpErrorResponse.BadStatusError(response)) : TE.right(response)), TE.chain(response => pipeable_1.pipe(E.parseJSON(response.body, parseError), E.chain(json => pipeable_1.pipe(req.decoder.decode(json), E.bimap(errors => exports.HttpErrorResponse.ValidationErrors(errors, json), body => (Object.assign(Object.assign({}, response), { body }))))), TE.fromEither)));
exports.del = (url, decoder) => ({
    url,
    method: 'DELETE',
    decoder
});
exports.get = (url, decoder) => ({
    url,
    method: 'GET',
    decoder,
    headers: {
        'Content-Type': 'application/json'
    }
});
exports.post = (url, body, decoder) => ({
    url,
    method: 'POST',
    decoder,
    headers: {
        'Content-Type': 'application/json'
    },
    body
});
exports.put = (url, body, decoder) => ({
    url,
    method: 'PUT',
    decoder,
    headers: {
        'Content-Type': 'application/json'
    },
    body
});
exports.send = (req, f) => Cmd_1.attempt(exports.request(req), f);
//# sourceMappingURL=Http.js.map