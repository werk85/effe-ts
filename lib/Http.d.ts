import * as E from 'fp-ts/lib/Either';
import * as TE from 'fp-ts/lib/TaskEither';
import * as t from 'io-ts';
import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import { ReaderObservable } from 'fp-ts-rxjs/lib/ReaderObservable';
export interface HttpResponse<O> {
    headers: Record<string, string>;
    status: {
        code: number;
        text: string;
    };
    url: string;
    body: O;
}
export interface HttpRequest<A, O> {
    url: string;
    decoder: t.Decoder<unknown, O>;
    headers?: Record<string, string>;
    credentials?: 'omit' | 'same-origin' | 'include';
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: A;
}
export declare const HttpErrorResponse: import("ts-union").UnionObj<{
    BadStatusError: import("ts-union").Of<[HttpResponse<string>]>;
    UnknownError: import("ts-union").Of<[Error]>;
    ParseError: import("ts-union").Of<[Error]>;
    ValidationErrors: import("ts-union").Of<[t.Errors, unknown]>;
}>;
export declare type HttpErrorResponse = typeof HttpErrorResponse.T;
export interface Http {
    <A, O>(req: HttpRequest<A, O>): TE.TaskEither<Error, HttpResponse<string>>;
}
export interface FetchDefaults extends RequestInit {
    baseUrl?: string;
}
export declare function mkFetch(defaults?: FetchDefaults): Http;
export interface HttpEnv {
    http: Http;
}
export declare type HttpResponseEither<O> = E.Either<HttpErrorResponse, HttpResponse<O>>;
export declare type HttpResponseReaderTaskEither<Env, O> = RTE.ReaderTaskEither<Env, HttpErrorResponse, HttpResponse<O>>;
export declare const request: <Env extends HttpEnv, A, O>(req: HttpRequest<A, O>) => HttpResponseReaderTaskEither<Env, O>;
export declare const del: <O>(url: string, decoder: t.Decoder<unknown, O>) => HttpRequest<never, O>;
export declare const get: <O>(url: string, decoder: t.Decoder<unknown, O>) => HttpRequest<never, O>;
export declare const post: <A, O>(url: string, body: A, decoder: t.Decoder<unknown, O>) => HttpRequest<A, O>;
export declare const put: <A, O>(url: string, body: A, decoder: t.Decoder<unknown, O>) => HttpRequest<A, O>;
export declare const send: <Env extends HttpEnv, A, O, Action>(req: HttpRequest<A, O>, f: (e: E.Either<import("ts-union").UnionVal<{
    BadStatusError: import("ts-union").Of<[HttpResponse<string>]>;
    UnknownError: import("ts-union").Of<[Error]>;
    ParseError: import("ts-union").Of<[Error]>;
    ValidationErrors: import("ts-union").Of<[t.Errors, unknown]>;
}>, HttpResponse<O>>) => Action) => ReaderObservable<Env, Action>;
