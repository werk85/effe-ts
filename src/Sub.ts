import { Observable, merge, EMPTY, combineLatest, of as rxOf } from 'rxjs'
import * as Rr from 'fp-ts/lib/Reader'
import * as Rx from 'rxjs/operators'
import { pipeable, pipe } from 'fp-ts/lib/pipeable'
import { Monoid } from 'fp-ts/lib/Monoid'
import { Monad2 } from 'fp-ts/lib/Monad'
import { Profunctor2 } from 'fp-ts/lib/Profunctor'

declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    'effe-ts/Sub': Sub<E, A>
  }
}

export const URI = 'effe-ts/Sub'
export type URI = typeof URI

export interface Sub<Model, Action> extends Rr.Reader<Observable<Model>, Observable<Action>> {}

export function fromObservable<Model, Action>(actions$: Observable<Action>): Sub<Model, Action> {
  return Rr.of(actions$)
}

export const none: Sub<unknown, never> = fromObservable(EMPTY)

export function getMonoid<Model, Action>(): Monoid<Sub<Model, Action>> {
  return {
    concat: (x, y) => model$ => merge(x(model$), y(model$)),
    empty: none
  }
}

export const sub: Profunctor2<URI> & Monad2<URI> = {
  URI,
  map: (ma, f) => model$ => Rx.map(f)(ma(model$)),
  promap: (fbc, f, g) => model$ => pipe(model$, Rx.map(f), fbc, Rx.map(g)),
  ap: (mab, ma) => model$ =>
    pipe(
      combineLatest(mab(model$), ma(model$)),
      Rx.map(([f, a]) => f(a))
    ),
  of: a => Rr.of(rxOf(a)),
  chain: (ma, f) => model$ => pipe(ma(model$), Rx.mergeMap(f))
}

const { ap, apFirst, apSecond, chain, map, chainFirst, flatten, promap } = pipeable(sub)

export { ap, apFirst, apSecond, chain, chainFirst, flatten, map, promap }
