import * as R from 'fp-ts-rxjs/lib/Observable'
import * as RO from 'fp-ts-rxjs/lib/ReaderObservable'
import { Applicative3 } from 'fp-ts/lib/Applicative'
import { apFirst as apFirst_, Apply3, apSecond as apSecond_, sequenceT } from 'fp-ts/lib/Apply'
import { Chain3, chainFirst as chainFirst_ } from 'fp-ts/lib/Chain'
import { flow, identity, pipe } from 'fp-ts/lib/function'
import { Functor3 } from 'fp-ts/lib/Functor'
import { Monad3 } from 'fp-ts/lib/Monad'
import { Monoid } from 'fp-ts/lib/Monoid'
import { Pointed3 } from 'fp-ts/lib/Pointed'
import { Profunctor3 } from 'fp-ts/lib/Profunctor'
import * as Rr from 'fp-ts/lib/Reader'
import { Observable } from 'rxjs'

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

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
const _map: Functor3<URI>['map'] = (fa, f) => pipe(fa, map(f))
const _ap: Apply3<URI>['ap'] = (fab, fa) => pipe(fab, ap(fa))
const _chain: Chain3<URI>['chain'] = (ma, f) => pipe(ma, chain(f))
const _promap: Profunctor3<URI>['promap'] = (fbc, f, g) => pipe(fbc, promap(f, g))

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

export const map: <A, B>(f: (a: A) => B) => <R, M>(fa: Sub<R, M, A>) => Sub<R, M, B> = f => ma => flow(ma, RO.map(f))

export const Functor: Functor3<URI> = {
  URI,
  map: _map
}

export const of: Pointed3<URI>['of'] = a => Rr.of(RO.of(a))

export const Pointed: Pointed3<URI> = {
  URI,
  of
}

export const ap: <R, E, A>(fa: Sub<R, E, A>) => <B>(fab: Sub<R, E, (a: A) => B>) => Sub<R, E, B> = ma => mab => model$ =>
  pipe(
    sequenceT(RO.Applicative)(mab(model$), ma(model$)),
    RO.map(([f, a]) => f(a))
  )

export const Apply: Apply3<URI> = {
  URI,
  map: _map,
  ap: _ap
}

export const Applicative: Applicative3<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of
}

export const chain: <R, E, A, B>(f: (a: A) => Sub<R, E, B>) => (ma: Sub<R, E, A>) => Sub<R, E, B> = f => ma => model$ =>
  pipe(
    ma(model$),
    RO.chain(a => f(a)(model$))
  )

export const Chain: Chain3<URI> = {
  URI,
  map: _map,
  ap: _ap,
  chain: _chain
}

export const Monad: Monad3<URI> = {
  URI,
  map: _map,
  ap: _ap,
  chain: _chain,
  of
}

export const promap: <R, E, A, D, B>(f: (d: D) => E, g: (a: A) => B) => (fea: Sub<R, E, A>) => Sub<R, D, B> =
  (f, g) => fbc => model$ =>
    pipe(model$, R.map(f), fbc, RO.map(g))

export const Profunctor: Profunctor3<URI> = {
  URI,
  map: _map,
  promap: _promap
}

export const apFirst =
  /*#__PURE__*/
  apFirst_(Apply)

export const apSecond =
  /*#__PURE__*/
  apSecond_(Apply)

export const chainFirst =
  /*#__PURE__*/
  chainFirst_(Chain)

export const flatten: <R, E, A>(mma: Sub<R, E, Sub<R, E, A>>) => Sub<R, E, A> = chain(identity)

/**
 * @deprecated
 */
export const sub: Profunctor3<URI> & Monad3<URI> = {
  ...Applicative,
  ...Chain,
  ...Functor,
  ...Monad,
  ...Pointed,
  ...Profunctor
}
