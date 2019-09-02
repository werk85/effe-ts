import { Monoid } from 'fp-ts/lib/Monoid'
import * as T from 'fp-ts/lib/Task'
import { Observable, EMPTY, of as rxOf, merge, combineLatest, defer, empty } from 'rxjs'
import * as O from 'fp-ts/lib/Option'
import { pipe, pipeable } from 'fp-ts/lib/pipeable'
import * as Rx from 'rxjs/operators'
import * as E from 'fp-ts/lib/Either'
import { Monad1 } from 'fp-ts/lib/Monad'

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    'effe-ts/Cmd': Cmd<A>
  }
}

export const URI = 'effe-ts/Cmd'
export type URI = typeof URI

export type Cmd<Action> = Observable<T.Task<O.Option<Action>>>
export const none: Cmd<never> = EMPTY
export const constNone = <Action>(): Cmd<Action> => none
export const of = <Action>(a: Action) => rxOf(T.of(O.some(a)))

export const getMonoid = <A>(): Monoid<Cmd<A>> => ({
  concat: (x, y) => merge(x, y),
  empty: none
})

export const perform = <A, Action>(task: T.Task<A>, f: (a: A) => Action): Cmd<Action> =>
  rxOf(
    pipe(
      task,
      T.map(a => O.some(f(a)))
    )
  )

export const perform_ = <A, Action>(task: T.Task<A>): Cmd<Action> =>
  rxOf(
    pipe(
      task,
      T.map(() => O.none)
    )
  )

export const attempt = <L, A, Action>(task: T.Task<E.Either<L, A>>, f: (e: E.Either<L, A>) => Action): Cmd<Action> =>
  perform(task, f)

export const cmd: Monad1<URI> = {
  URI,
  map: (ma, f) =>
    pipe(
      ma,
      Rx.map(T.map(O.map(f)))
    ),
  of,
  ap: (mab, ma) =>
    pipe(
      combineLatest(mab, ma),
      Rx.map(([mab, ma]) => () => Promise.all([mab(), ma()]).then(([mab, ma]) => O.option.ap(mab, ma)))
    ),
  chain: (ma, f) =>
    pipe(
      ma,
      Rx.mergeMap(defer),
      Rx.mergeMap(O.fold(empty, f))
    )
}

const { ap, apFirst, apSecond, chain, chainFirst, flatten, map } = pipeable(cmd)

export { ap, apFirst, apSecond, chain, chainFirst, flatten, map }
