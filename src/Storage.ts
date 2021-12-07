import * as RTE from 'fp-ts/lib/ReaderTaskEither'
import * as TE from 'fp-ts/lib/TaskEither'
import * as t from 'io-ts'
import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import { Union, of } from 'ts-union'
import { flow, pipe } from 'fp-ts/lib/function'
import { IORef } from 'fp-ts/lib/IORef'
import * as R from 'fp-ts/lib/Record'
import { ReaderObservable } from 'fp-ts-rxjs/lib/ReaderObservable'
import { attempt, perform_ } from './Cmd'

export const StorageError = Union({
  NativeError: of<Error>(),
  ValidationErrors: of<t.Errors, unknown>()
})
export type StorageError = typeof StorageError.T

export interface StorageEntity<A> {
  key: string
  type: t.Type<A, unknown>
}

export const entity = <A>(key: string, type: t.Type<A, unknown>): StorageEntity<A> => ({
  key,
  type
})

export interface Storage {
  get(key: string): TE.TaskEither<Error, O.Option<unknown>>
  set(key: string, value: unknown): TE.TaskEither<Error, void>
  remove(key: string): TE.TaskEither<Error, void>
}

export const localStorage: Storage = {
  get: key => TE.tryCatch(async () => O.fromNullable(JSON.parse(window.localStorage.getItem(key) || 'null')), E.toError),
  set: (key, value) => TE.tryCatch(async () => window.localStorage.setItem(key, JSON.stringify(value)), E.toError),
  remove: key => TE.tryCatch(async () => window.localStorage.removeItem(key), E.toError)
}

export function memoryStorage(store: IORef<Record<string, unknown>> = new IORef({})): Storage {
  return {
    get: key =>
      pipe(
        TE.rightIO(store.read),
        TE.map(store => R.lookup(key, store))
      ),
    set: (key, value) => TE.rightIO(store.modify(R.upsertAt(key, value))),
    remove: key => TE.rightIO(store.modify(R.deleteAt(key)))
  }
}

export interface StorageEnv {
  storage: Storage
}

export const get =
  <Env extends StorageEnv, A>(entity: StorageEntity<A>): RTE.ReaderTaskEither<Env, StorageError, O.Option<A>> =>
  env =>
    pipe(
      env.storage.get(entity.key),
      TE.mapLeft(StorageError.NativeError),
      TE.chain(
        flow(
          O.traverse(E.Applicative)(value =>
            pipe(
              entity.type.decode(value),
              E.mapLeft(errors => StorageError.ValidationErrors(errors, value))
            )
          ),
          TE.fromEither
        )
      )
    )

export const set =
  <Env extends StorageEnv, A>(entity: StorageEntity<A>) =>
  (value: A): RTE.ReaderTaskEither<Env, StorageError, void> =>
  env =>
    pipe(env.storage.set(entity.key, entity.type.encode(value)), TE.mapLeft(StorageError.NativeError))

export const remove =
  <Env extends StorageEnv, A>(entity: StorageEntity<A>): RTE.ReaderTaskEither<Env, StorageError, void> =>
  env =>
    pipe(env.storage.remove(entity.key), TE.mapLeft(StorageError.NativeError))

export const load = <Env extends StorageEnv, A, Action>(
  entity: StorageEntity<A>,
  f: (e: E.Either<StorageError, O.Option<A>>) => Action
): ReaderObservable<Env, Action> => attempt(get(entity), f)

export const save =
  <Env extends StorageEnv, A>(entity: StorageEntity<A>) =>
  (value: A): ReaderObservable<Env, never> =>
    perform_(set(entity)(value))
export const purge = <Env extends StorageEnv, A>(entity: StorageEntity<A>): ReaderObservable<Env, never> =>
  perform_(remove(entity))
