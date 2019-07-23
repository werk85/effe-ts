import * as E from 'fp-ts/es6/Either'
import { pipe } from 'fp-ts/es6/pipeable'
import * as TE from 'fp-ts/es6/TaskEither'
import * as t from 'io-ts'
import { ofType, unionize, UnionOf } from 'unionize'
import { Cmd, attempt } from './Cmd'

export const HttpErrorResponse = unionize({
  UnknownError: ofType<{ error: Error }>(),
  ValidationErrors: ofType<{ value: unknown; errors: t.Errors }>()
})
export type HttpErrorResponse = UnionOf<typeof HttpErrorResponse>

const unknownError = (error: unknown): HttpErrorResponse => HttpErrorResponse.UnknownError({ error: E.toError(error) })

export interface Response<O> {
  ok: boolean
  status: number
  body: O
}

export interface Request<A, O> {
  url: string
  decoder: t.Decoder<unknown, O>
  headers?: Record<string, string>
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: A
}

export const request = <A, O>(req: Request<A, O>): TE.TaskEither<HttpErrorResponse, Response<O>> =>
  pipe(
    TE.tryCatch(
      () =>
        fetch(req.url, {
          ...req,
          body: typeof req.body !== 'undefined' ? JSON.stringify(req.body) : undefined
        }),
      unknownError
    ),
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
        TE.map(body => ({
          ok: response.ok,
          status: response.status,
          body
        }))
      )
    )
  )

export const get = <O>(url: string, type: t.Decoder<unknown, O>): Request<never, O> => ({
  url,
  method: 'GET',
  decoder: type,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const post = <A, O>(url: string, body: A, type: t.Decoder<unknown, O>): Request<A, O> => ({
  url,
  method: 'POST',
  decoder: type,
  headers: {
    'Content-Type': 'application/json'
  },
  body
})

export const send = <A, O, Action>(req: Request<A, O>, f: (e: E.Either<HttpErrorResponse, Response<O>>) => Action): Cmd<Action> =>
  attempt(request(req), f)
