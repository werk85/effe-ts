import { EMPTY } from 'rxjs'
import { Either } from 'fp-ts/lib/Either'
import { ReaderTaskEither } from 'fp-ts/lib/ReaderTaskEither'
import { ReaderTask } from 'fp-ts/lib/ReaderTask'
import * as RO from 'fp-ts-rxjs/lib/ReaderObservable'
import * as R from 'fp-ts-rxjs/lib/Observable'
import { pipe } from 'fp-ts/lib/pipeable'

const monoidReaderObservable = RO.getMonoid<unknown, never>()

export interface Cmd<R, Action = never> extends RO.ReaderObservable<R, Action> {}
export const none: Cmd<unknown, never> = monoidReaderObservable.empty

export function perform<R, A, Action>(task: ReaderTask<R, A>, f: (a: A) => Action): Cmd<R, Action> {
  return r => pipe(R.fromTask(task(r)), R.map(f))
}

export function perform_<R, A>(task: ReaderTask<R, A>): Cmd<R, never> {
  return r =>
    pipe(
      R.fromTask(task(r)),
      R.chain(() => EMPTY)
    )
}

export function attempt<R, E, A, Action>(task: ReaderTaskEither<R, E, A>, f: (e: Either<E, A>) => Action): Cmd<R, Action> {
  return perform(task, f)
}

export const cmd = RO.readerObservable

export * from 'fp-ts-rxjs/lib/ReaderObservable'
