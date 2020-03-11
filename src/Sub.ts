import { Observable } from 'rxjs'
import * as Rr from 'fp-ts/lib/Reader'
import { pipeable, pipe } from 'fp-ts/lib/pipeable'
import { Monoid } from 'fp-ts/lib/Monoid'
import { Monad3 } from 'fp-ts/lib/Monad'
import { Profunctor3 } from 'fp-ts/lib/Profunctor'
import { sequenceT } from 'fp-ts/lib/Apply'
import * as RO from 'fp-ts-rxjs/lib/ReaderObservable'
import * as R from 'fp-ts-rxjs/lib/Observable'

declare module 'fp-ts/lib/HKT' {
  interface URItoKind3<R, E, A> {
    'effe-ts/Sub': Sub<R, E, A>
  }
}

export const URI = 'effe-ts/Sub'
export type URI = typeof URI

export interface Sub<R, Model, Action> extends Rr.Reader<Observable<Model>, RO.ReaderObservable<R, Action>> {}

export function fromObservable<R, Model, Action>(actions$: Observable<Action>): Sub<R, Model, Action> {
  return Rr.of(Rr.of(actions$))
}

export function fromCmd<R, Model, Action>(cmd: RO.ReaderObservable<R, Action>): Sub<R, Model, Action> {
  return Rr.of(cmd)
}

const monoidObservable = RO.getMonoid<unknown, never>()

export const none: Sub<unknown, unknown, never> = fromCmd(monoidObservable.empty)

export function getMonoid<R, Model, Action>(): Monoid<Sub<R, Model, Action>> {
  const monoidObservable = RO.getMonoid<R, Action>()
  return {
    concat: (x, y) => model$ => monoidObservable.concat(x(model$), y(model$)),
    empty: none
  }
}

export const sub: Profunctor3<URI> & Monad3<URI> = {
  URI,
  map: (ma, f) => model$ => RO.map(f)(ma(model$)),
  promap: (fbc, f, g) => model$ => pipe(model$, R.map(f), fbc, RO.map(g)),
  ap: (mab, ma) => model$ =>
    pipe(
      sequenceT(RO.readerObservable)(mab(model$), ma(model$)),
      RO.map(([f, a]) => f(a))
    ),
  of: a => Rr.of(RO.of(a)),
  chain: (ma, f) => model$ =>
    pipe(
      ma(model$),
      RO.chain(a => f(a)(model$))
    )
}

const { ap, apFirst, apSecond, chain, map, chainFirst, flatten, promap } = pipeable(sub)

export { ap, apFirst, apSecond, chain, chainFirst, flatten, map, promap }
