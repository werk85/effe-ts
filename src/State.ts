import * as RO from 'fp-ts-rxjs/lib/ReaderObservable'
import { Applicative as FpApplicative, Applicative3 } from 'fp-ts/lib/Applicative'
import { apFirst as apFirst_, Apply3, apS as apS_, apSecond as apSecond_ } from 'fp-ts/lib/Apply'
import { Bifunctor3 } from 'fp-ts/lib/Bifunctor'
import { bind as bind_, Chain3, chainFirst as chainFirst_ } from 'fp-ts/lib/Chain'
import { Comonad3 } from 'fp-ts/lib/Comonad'
import { Extend3 } from 'fp-ts/lib/Extend'
import { Foldable3 } from 'fp-ts/lib/Foldable'
import { identity, pipe } from 'fp-ts/lib/function'
import { bindTo as bindTo_, flap as flap_, Functor3 } from 'fp-ts/lib/Functor'
import { HKT } from 'fp-ts/lib/HKT'
import { Monad3 } from 'fp-ts/lib/Monad'
import { Monoid } from 'fp-ts/lib/Monoid'
import { Pointed3 } from 'fp-ts/lib/Pointed'
import { Semigroup } from 'fp-ts/lib/Semigroup'
import { Semigroupoid3 } from 'fp-ts/lib/Semigroupoid'
import { Traversable3 } from 'fp-ts/lib/Traversable'
import { none } from './Cmd'

declare module 'fp-ts/lib/HKT' {
  interface URItoKind3<R, E, A> {
    'effe-ts/State': State<R, A, E>
  }
}

export const URI = 'effe-ts/State'
export type URI = typeof URI

export type State<R, Model, Action = never> = [Model, RO.ReaderObservable<R, Action>]

export const fromModel = <R, Model>(model: Model): State<R, Model, never> => [model, none]
export const model = <R, Model>(state: State<R, Model, unknown>): Model => state[0]
export const cmd = <R, Action>(state: State<R, unknown, Action>): RO.ReaderObservable<R, Action> => state[1]

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

const _map: Monad3<URI>['map'] = (ma, f) => pipe(ma, map(f))
const _ap: Monad3<URI>['ap'] = (fab, fa) => pipe(fab, ap(fa))
const _chain: Monad3<URI>['chain'] = (fa, f) => pipe(fa, chain(f))
const _foldMap: Foldable3<URI>['foldMap'] = M => (ae, f) => pipe(ae, foldMap(M)(f))
const _reduce: Foldable3<URI>['reduce'] = (fa, b, f) => pipe(fa, reduce(b, f))
const _reduceRight: Foldable3<URI>['reduceRight'] = (fa, b, f) => pipe(fa, reduceRight(b, f))
const _mapLeft: Bifunctor3<URI>['mapLeft'] = (fa, g) => pipe(fa, mapLeft(g))
const _bimap: Bifunctor3<URI>['bimap'] = (fa, f, g) => pipe(fa, bimap(f, g))
const _extend: Extend3<URI>['extend'] = (fa, f) => pipe(fa, extend(f))
const _traverse: Traversable3<URI>['traverse'] =
  <F>(F: FpApplicative<F>) =>
  <R, A, S, B>(as: State<R, A, S>, f: (a: A) => HKT<F, B>): HKT<F, State<R, B, S>> => {
    return F.map(f(model(as)), b => [b, cmd(as)])
  }
const _compose: Semigroupoid3<URI>['compose'] = (ab, la) => pipe(ab, compose(la))

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

const monoidReaderObservable = RO.getMonoid<any, any>()

export function getSemigroup<R, Model, Action>(S: Semigroup<Model>): Semigroup<State<R, Model, Action>> {
  return {
    concat: (x, y) => [S.concat(model(x), model(y)), monoidReaderObservable.concat(cmd(x), cmd(y))]
  }
}
export function getMonoid<R, Model, Action>(M: Monoid<Model>): Monoid<State<R, Model, Action>> {
  return {
    ...getSemigroup(M),
    empty: of(M.empty)
  }
}

export const map: <R, Action, A, B>(f: (a: A) => B) => (ma: State<R, A, Action>) => State<R, B, Action> = f => ma =>
  [f(ma[0]), ma[1]]

export const Functor: Functor3<URI> = {
  URI,
  map: _map
}

export const of: Pointed3<URI>['of'] = fromModel

export const Pointed: Pointed3<URI> = {
  URI,
  of
}

export const ap: <R, Action, A>(fa: State<R, A, Action>) => <B>(fab: State<R, (a: A) => B, Action>) => State<R, B, Action> =
  fa => fab =>
    [model(fab)(model(fa)), monoidReaderObservable.concat(cmd(fab), cmd(fa))]

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

export const chain: <R, E, A, B>(f: (a: A) => State<R, B, E>) => (ma: State<R, A, E>) => State<R, B, E> = f => ma => {
  const [b, s] = f(model(ma))
  return [b, monoidReaderObservable.concat(cmd(ma), s)]
}

export const chainW: <R2, E2, A, B>(
  f: (a: A) => State<R2, B, E2>
) => <R1, E1>(ma: State<R1, A, E1>) => State<R1 & R2, B, E1 | E2> = chain as any

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
  of,
  chain: _chain
}

export const foldMap: <M>(M: Monoid<M>) => <R, E, A>(f: (a: A) => M) => (fa: State<R, A, E>) => M = () => f => fa => f(model(fa))

export const reduce: <R, A, B>(b: B, f: (b: B, a: A) => B) => <E>(fa: State<R, A, E>) => B = (b, f) => fa => f(b, model(fa))

export const reduceRight: <R, A, B>(b: B, f: (a: A, b: B) => B) => <E>(fa: State<R, A, E>) => B = (b, f) => fa => f(model(fa), b)

export const Foldable: Foldable3<URI> = {
  URI,
  reduce: _reduce,
  foldMap: _foldMap,
  reduceRight: _reduceRight
}

export const traverse =
  <F>(F: FpApplicative<F>) =>
  <A, B>(f: (a: A) => HKT<F, B>) =>
  <R, S>(as: State<R, A, S>): HKT<F, State<R, B, S>> =>
    F.map(f(model(as)), b => [b, cmd(as)])

export const sequence =
  <F>(F: FpApplicative<F>) =>
  <R, A, S>(fas: State<R, HKT<F, A>, S>): HKT<F, State<R, A, S>> => {
    return F.map(model(fas), a => [a, cmd(fas)])
  }

export const Traversable: Traversable3<URI> = {
  URI,
  map: _map,
  reduce: _reduce,
  foldMap: _foldMap,
  reduceRight: _reduceRight,
  traverse: _traverse,
  sequence
}

export const bimap: <E, G, A, B>(f: (e: E) => G, g: (a: A) => B) => <R>(fa: State<R, A, E>) => State<R, B, G> = (f, g) => fa =>
  [g(model(fa)), RO.Functor.map(cmd(fa), f)]

export const mapLeft: <E, G>(f: (e: E) => G) => <R, A>(fa: State<R, A, E>) => State<R, A, G> = f => ma =>
  [model(ma), RO.Functor.map(cmd(ma), f)]

export const Bifunctor: Bifunctor3<URI> = {
  URI,
  bimap: _bimap,
  mapLeft: _mapLeft
}

export const compose: <R, A, B, C>(la: State<R, B, A>) => (ab: State<R, C, B>) => State<R, C, A> = la => ab =>
  [model(ab), cmd(la)]

export const Semigroupoid: Semigroupoid3<URI> = {
  URI,
  compose: _compose
}

export const extend: <R, E, A, B>(f: (wa: State<R, A, E>) => B) => (wa: State<R, A, E>) => State<R, B, E> = f => wa =>
  [f(wa), cmd(wa)]

export const Extend: Extend3<URI> = {
  URI,
  map: _map,
  extend: _extend
}

export const extract: Comonad3<URI>['extract'] = model

export const Comonad: Comonad3<URI> = {
  URI,
  map: _map,
  extend: _extend,
  extract
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

export const duplicate: <R, E, A>(wa: State<R, A, E>) => State<R, State<R, A, E>, E> =
  /*#__PURE__*/
  extend(identity)

export const flatten: <R, E, A>(mma: State<R, State<R, A, E>, E>) => State<R, A, E> = chain(identity)

export const flap =
  /*#__PURE__*/
  flap_(Functor)

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

export const Do: State<unknown, Record<never, unknown>, never> =
  /*#__PURE__*/
  of({})

export const bindTo =
  /*#__PURE__*/
  bindTo_(Functor)

export const bind =
  /*#__PURE__*/
  bind_(Chain)

export const bindW: <N extends string, A, R2, E2, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => State<R2, B, E2>
) => <R1, E1>(fa: State<R1, A, E1>) => State<R1 & R2, { readonly [K in keyof A | N]: K extends keyof A ? A[K] : B }, E1 | E2> =
  bind as any

// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------

export const apS =
  /*#__PURE__*/
  apS_(Apply)

export const apSW: <A, N extends string, R2, E2, B>(
  name: Exclude<N, keyof A>,
  fb: State<R2, B, E2>
) => <R1, E1>(fa: State<R1, A, E1>) => State<R1 & R2, { readonly [K in keyof A | N]: K extends keyof A ? A[K] : B }, E1 | E2> =
  apS as any

// -------------------------------------------------------------------------------------
// sequence T
// -------------------------------------------------------------------------------------

export const ApT: State<unknown, readonly [], never> =
  /*#__PURE__*/
  of([])

// -------------------------------------------------------------------------------------
// deprecated
// -------------------------------------------------------------------------------------

/**
 * @deprecated
 */
export const state: Semigroupoid3<URI> & Comonad3<URI> & Traversable3<URI> & Foldable3<URI> & Monad3<URI> = {
  ...Applicative,
  ...Bifunctor,
  ...Chain,
  ...Comonad,
  ...Extend,
  ...Foldable,
  ...Semigroupoid,
  ...Traversable
}
