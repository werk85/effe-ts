import { Observable } from 'rxjs'
import * as Rr from 'fp-ts/lib/Reader'
import { pipeable, pipe } from 'fp-ts/lib/pipeable'
import { Monoid } from 'fp-ts/lib/Monoid'
import { Monad2 } from 'fp-ts/lib/Monad'
import { Profunctor2 } from 'fp-ts/lib/Profunctor'
import * as RX from 'fp-ts-rxjs/lib/Observable'
import { sequenceT } from 'fp-ts/lib/Apply'
import { Cmd } from './Cmd'

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

export function fromCmd<Model, Action>(cmd: Cmd<Action>): Sub<Model, Action> {
  return Rr.of(pipe(cmd, RX.chain(RX.fromTask), RX.chain(RX.fromOption)))
}

const monoidObservable = RX.getMonoid<never>()

export const none: Sub<unknown, never> = fromObservable(monoidObservable.empty)

export function getMonoid<Model, Action>(): Monoid<Sub<Model, Action>> {
  const monoidObservable = RX.getMonoid<Action>()
  return {
    concat: (x, y) => model$ => monoidObservable.concat(x(model$), y(model$)),
    empty: none
  }
}

export const sub: Profunctor2<URI> & Monad2<URI> = {
  URI,
  map: (ma, f) => model$ => RX.map(f)(ma(model$)),
  promap: (fbc, f, g) => model$ => pipe(model$, RX.map(f), fbc, RX.map(g)),
  ap: (mab, ma) => model$ =>
    pipe(
      sequenceT(RX.observable)(mab(model$), ma(model$)),
      RX.map(([f, a]) => f(a))
    ),
  of: a => Rr.of(RX.of(a)),
  chain: (ma, f) => model$ =>
    pipe(
      ma(model$),
      RX.chain(a => f(a)(model$))
    )
}

const { ap, apFirst, apSecond, chain, map, chainFirst, flatten, promap } = pipeable(sub)

export { ap, apFirst, apSecond, chain, chainFirst, flatten, map, promap }
