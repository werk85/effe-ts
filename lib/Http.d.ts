import * as E from 'fp-ts/es6/Either';
import * as TE from 'fp-ts/es6/TaskEither';
import * as t from 'io-ts';
import { UnionOf } from 'unionize';
export declare const HttpErrorResponse: import("unionize").Unionized<{
    UnknownError: {
        error: Error;
    };
    ValidationErrors: {
        value: unknown;
        errors: t.Errors;
    };
}, import("unionize").MultiValueVariants<{
    UnknownError: {
        error: Error;
    };
    ValidationErrors: {
        value: unknown;
        errors: t.Errors;
    };
}, "tag">, "tag">;
export declare type HttpErrorResponse = UnionOf<typeof HttpErrorResponse>;
export interface Response<O> {
    ok: boolean;
    status: number;
    body: O;
}
export interface Request<A, O> {
    url: string;
    decoder: t.Decoder<unknown, O>;
    headers?: Record<string, string>;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: A;
}
export declare const request: <A, O>(req: Request<A, O>) => TE.TaskEither<({
    tag: "UnknownError";
} & {
    error: Error;
}) | ({
    tag: "ValidationErrors";
} & {
    value: unknown;
    errors: t.Errors;
}), Response<O>>;
export declare const get: <O>(url: string, type: t.Decoder<unknown, O>) => Request<never, O>;
export declare const post: <A, O>(url: string, body: A, type: t.Decoder<unknown, O>) => Request<A, O>;
export declare const send: <A, O, Action>(req: Request<A, O>, f: (e: E.Either<({
    tag: "UnknownError";
} & {
    error: Error;
}) | ({
    tag: "ValidationErrors";
} & {
    value: unknown;
    errors: t.Errors;
}), Response<O>>) => Action) => import("rxjs").Observable<import("fp-ts/es6/Task").Task<import("fp-ts/es6/Option").Option<Action>>>;
