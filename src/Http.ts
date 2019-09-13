import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'
import * as t from 'io-ts'
import { ofType, unionize, UnionOf } from 'unionize'
import * as T from 'fp-ts/lib/Task'
import * as R from 'fp-ts/lib/Record'
import { Cmd, attempt } from './Cmd'

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

export const HttpErrorResponse = unionize({
  BadStatusError: ofType<{ response: HttpResponse<string> }>(),
  UnknownError: ofType<{ error: Error }>(),
  ValidationErrors: ofType<{ value: unknown; errors: t.Errors }>()
})
export type HttpErrorResponse = UnionOf<typeof HttpErrorResponse>

const unknownError = (error: unknown): HttpErrorResponse => HttpErrorResponse.UnknownError({ error: E.toError(error) })
const badStatusError = (response: Response): TE.TaskEither<HttpErrorResponse, never> =>
  pipe(
    TE.tryCatch(() => response.text(), unknownError),
    TE.chain(body => TE.left(HttpErrorResponse.BadStatusError({ response: convertResponse(response, body) })))
  )

export type HttpResponseEither<O> = E.Either<HttpErrorResponse, HttpResponse<O>>

export const request = <A, O>(req: HttpRequest<A, O>): T.Task<HttpResponseEither<O>> =>
  pipe(
    TE.tryCatch(
      () =>
        fetch(req.url, {
          ...req,
          body: typeof req.body !== 'undefined' ? JSON.stringify(req.body) : undefined
        }),
      unknownError
    ),
    TE.chain(response => (response.status >= 400 ? badStatusError(response) : TE.right(response))),
    TE.chain(response =>
      pipe(
        TE.tryCatch(() => response.json(), unknownError),
        TE.chain(json =>
          TE.fromEither(
            pipe(
              req.decoder.decode(json),
              E.mapLeft(errors => HttpErrorResponse.ValidationErrors({ value: json, errors }))
            )
          )
        ),
        TE.map(body => convertResponse(response, body))
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

export const send = <A, O, Action>(
  req: HttpRequest<A, O>,
  f: (e: E.Either<HttpErrorResponse, HttpResponse<O>>) => Action
): Cmd<Action> => attempt(request(req), f)
