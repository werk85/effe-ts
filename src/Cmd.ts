import { Monoid } from 'fp-ts/lib/Monoid'
import * as T from 'fp-ts/es6/Task'
import { Observable, EMPTY, of as rxOf, merge, combineLatest } from 'rxjs'
import * as O from 'fp-ts/es6/Option'
import { pipe, pipeable } from 'fp-ts/lib/pipeable'
import * as Rx from 'rxjs/operators'
import { Applicative1 } from 'fp-ts/lib/Applicative'
import * as E from 'fp-ts/lib/Either'

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    'effe-ts/Cmd': Cmd<A>
  }
}

export const URI = 'effe-ts/Cmd'
export type URI = typeof URI

export type Cmd<Action> = Observable<T.Task<O.Option<Action>>>
export const none: Cmd<never> = EMPTY
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

export const attempt = <L, A, Action>(task: T.Task<E.Either<L, A>>, f: (e: E.Either<L, A>) => Action): Cmd<Action> =>
  perform(task, f)

export const cmd: Applicative1<URI> = {
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
    )
}

const { ap, apFirst, apSecond, map } = pipeable(cmd)

export { ap, apFirst, apSecond, map }
