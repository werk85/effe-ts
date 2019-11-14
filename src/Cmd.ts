import { Monoid } from 'fp-ts/lib/Monoid'
import * as T from 'fp-ts/lib/Task'
import { Observable, EMPTY, of as rxOf, merge, combineLatest, defer } from 'rxjs'
import * as O from 'fp-ts/lib/Option'
import { pipe, pipeable } from 'fp-ts/lib/pipeable'
import * as Rx from 'rxjs/operators'
import * as E from 'fp-ts/lib/Either'
import { Monad1 } from 'fp-ts/lib/Monad'
import * as TE from 'fp-ts/lib/TaskEither'

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    'effe-ts/Cmd': Cmd<A>
  }
}

export const URI = 'effe-ts/Cmd'
export type URI = typeof URI

export interface Cmd<Action> extends Observable<T.Task<O.Option<Action>>> {}
export const none: Cmd<never> = EMPTY
export const constNone = <Action>(): Cmd<Action> => none
export const of = <Action>(a: Action) => rxOf(T.of(O.some(a)))

export function getMonoid<A>(): Monoid<Cmd<A>> {
  return {
    concat: (x, y) => merge(x, y),
    empty: none
  }
}

export function perform<A, Action>(task: T.Task<A>, f: (a: A) => Action): Cmd<Action> {
  return rxOf(
    pipe(
      task,
      T.map(a => O.some(f(a)))
    )
  )
}

export function perform_<A, Action>(task: T.Task<A>): Cmd<Action> {
  return rxOf(
    pipe(
      task,
      T.map(() => O.none)
    )
  )
}

export function attempt<L, A, Action>(task: TE.TaskEither<L, A>, f: (e: E.Either<L, A>) => Action): Cmd<Action> {
  return perform(task, f)
}

export const cmd: Monad1<URI> = {
  URI,
  map: (ma, f) => pipe(ma, Rx.map(T.map(O.map(f)))),
  of,
  ap: (mab, ma) =>
    pipe(
      combineLatest(mab, ma),
      Rx.map(([mab, ma]) => () => Promise.all([mab(), ma()]).then(([mab, ma]) => O.option.ap(mab, ma)))
    ),
  chain: (ma, f) => pipe(ma, Rx.mergeMap(defer), Rx.mergeMap(O.fold(() => EMPTY, f)))
}

const { ap, apFirst, apSecond, chain, chainFirst, flatten, map } = pipeable(cmd)

export { ap, apFirst, apSecond, chain, chainFirst, flatten, map }
