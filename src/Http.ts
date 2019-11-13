import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'
import * as t from 'io-ts'
import { Union, of } from 'ts-union'
import * as R from 'fp-ts/lib/Record'
import * as RTE from 'fp-ts/lib/ReaderTaskEither'
import { CmdR, attempt } from './CmdR'

export interface HttpResponse<O> {
  headers: Record<string, string>
  status: {
    code: number
    text: string
  }
  url: string
  body: O
}

export interface HttpRequest<A, O> {
  url: string
  decoder: t.Decoder<unknown, O>
  headers?: Record<string, string>
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: A
}

export const HttpErrorResponse = Union({
  BadStatusError: of<HttpResponse<string>>(),
  UnknownError: of<Error>(),
  ParseError: of<Error>(),
  ValidationErrors: of<t.Errors, unknown>()
})
export type HttpErrorResponse = typeof HttpErrorResponse.T

const parseError = (error: unknown): HttpErrorResponse => HttpErrorResponse.ParseError(E.toError(error))

export interface Http {
  <A, O>(req: HttpRequest<A, O>): TE.TaskEither<Error, HttpResponse<string>>
}

const convertHeaders = (headers: Headers): Record<string, string> => {
  let result: Record<string, string> = {}
  headers.forEach((value, key) => {
    result = R.insertAt(key, value)(result)
  })
  return result
}

const convertResponse = <O>(response: Response, body: O): HttpResponse<O> => ({
  headers: convertHeaders(response.headers),
  status: {
    code: response.status,
    text: response.statusText
  },
  body,
  url: response.url
})

export const fetch: Http = req =>
  pipe(
    TE.tryCatch(
      () =>
        window.fetch(req.url, {
          ...req,
          body: typeof req.body !== 'undefined' ? JSON.stringify(req.body) : undefined
        }),
      E.toError
    ),
    TE.chain(response =>
      pipe(
        TE.tryCatch(() => response.text(), E.toError),
        TE.map(body => convertResponse(response, body))
      )
    )
  )

export interface HttpEnv {
  http: Http
}
export type HttpResponseEither<O> = E.Either<HttpErrorResponse, HttpResponse<O>>
export type HttpResponseReaderTaskEither<Env, O> = RTE.ReaderTaskEither<Env, HttpErrorResponse, HttpResponse<O>>

export const request = <Env extends HttpEnv, A, O>(req: HttpRequest<A, O>): HttpResponseReaderTaskEither<Env, O> => env =>
  pipe(
    env.http(req),
    TE.mapLeft(HttpErrorResponse.UnknownError),
    TE.chain(response =>
      response.status.code >= 400 ? TE.left(HttpErrorResponse.BadStatusError(response)) : TE.right(response)
    ),
    TE.chain(response =>
      pipe(
        E.parseJSON(response.body, parseError),
        E.chain(json =>
          pipe(
            req.decoder.decode(json),
            E.bimap(
              errors => HttpErrorResponse.ValidationErrors(errors, json),
              body => ({ ...response, body })
            )
          )
        ),
        TE.fromEither
      )
    )
  )

export const del = <O>(url: string, decoder: t.Decoder<unknown, O>): HttpRequest<never, O> => ({
  url,
  method: 'DELETE',
  decoder
})

export const get = <O>(url: string, decoder: t.Decoder<unknown, O>): HttpRequest<never, O> => ({
  url,
  method: 'GET',
  decoder,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const post = <A, O>(url: string, body: A, decoder: t.Decoder<unknown, O>): HttpRequest<A, O> => ({
  url,
  method: 'POST',
  decoder,
  headers: {
    'Content-Type': 'application/json'
  },
  body
})

export const put = <A, O>(url: string, body: A, decoder: t.Decoder<unknown, O>): HttpRequest<A, O> => ({
  url,
  method: 'PUT',
  decoder,
  headers: {
    'Content-Type': 'application/json'
  },
  body
})

export const send = <Env extends HttpEnv, A, O, Action>(
  req: HttpRequest<A, O>,
  f: (e: HttpResponseEither<O>) => Action
): CmdR<Env, Action> => attempt(request(req), f)
