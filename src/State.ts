import { Bifunctor3 } from 'fp-ts/lib/Bifunctor'
import { Semigroupoid3 } from 'fp-ts/lib/Semigroupoid'
import { Comonad3 } from 'fp-ts/lib/Comonad'
import { Foldable3 } from 'fp-ts/lib/Foldable'
import { Traversable3 } from 'fp-ts/lib/Traversable'
import { Applicative } from 'fp-ts/lib/Applicative'
import { HKT } from 'fp-ts/lib/HKT'
import { pipeable } from 'fp-ts/lib/pipeable'
import { Monad3 } from 'fp-ts/lib/Monad'
import { Monoid } from 'fp-ts/lib/Monoid'
import { Semigroup } from 'fp-ts/lib/Semigroup'
import * as RO from 'fp-ts-rxjs/lib/ReaderObservable'

const monoidReaderObservable = RO.getMonoid<any, any>()

declare module 'fp-ts/lib/HKT' {
  interface URItoKind3<R, E, A> {
    'effe-ts/State': State<R, A, E>
  }
}

export const URI = 'effe-ts/State'
export type URI = typeof URI

export type State<R, Model, Action = never> = [Model, RO.ReaderObservable<R, Action>]

export const model = <R, Model>(state: State<R, Model, unknown>): Model => state[0]
export const cmd = <R, Action>(state: State<R, unknown, Action>): RO.ReaderObservable<R, Action> => state[1]

export const of = <R, Model, Action = never>(model: Model): State<R, Model, Action> => [model, monoidReaderObservable.empty]

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

export const state: Semigroupoid3<URI> & Bifunctor3<URI> & Comonad3<URI> & Foldable3<URI> & Traversable3<URI> & Monad3<URI> = {
  URI,
  compose: (ba, ae) => [model(ba), cmd(ae)],
  map: (ma, f) => [f(ma[0]), ma[1]],
  bimap: (ma, f, g) => [g(model(ma)), RO.readerObservable.map(cmd(ma), f)],
  mapLeft: (ma, f) => [model(ma), RO.readerObservable.map(cmd(ma), f)],
  ap: (fab, fa) => [model(fab)(model(fa)), monoidReaderObservable.concat(cmd(fab), cmd(fa))],
  of,
  chain: (fa, f) => {
    const [b, s] = f(model(fa))
    return [b, monoidReaderObservable.concat(cmd(fa), s)]
  },
  extract: model,
  extend: (ae, f) => [f(ae), cmd(ae)],
  reduce: (ae, b, f) => f(b, model(ae)),
  foldMap: _ => (ae, f) => f(model(ae)),
  reduceRight: (ae, b, f) => f(model(ae), b),
  traverse: <F>(F: Applicative<F>) => <R, A, S, B>(as: State<R, A, S>, f: (a: A) => HKT<F, B>): HKT<F, State<R, B, S>> => {
    return F.map(f(model(as)), b => [b, cmd(as)])
  },
  sequence: <F>(F: Applicative<F>) => <R, A, S>(fas: State<R, HKT<F, A>, S>): HKT<F, State<R, A, S>> => {
    return F.map(model(fas), a => [a, cmd(fas)])
  }
}

const {
  ap,
  apFirst,
  apSecond,
  bimap,
  chain,
  chainFirst,
  compose,
  duplicate,
  extend,
  flatten,
  foldMap,
  map,
  mapLeft,
  reduce,
  reduceRight
} = pipeable(state)

export {
  ap,
  apFirst,
  apSecond,
  bimap,
  chain,
  chainFirst,
  compose,
  duplicate,
  extend,
  flatten,
  foldMap,
  map,
  mapLeft,
  reduce,
  reduceRight
}
