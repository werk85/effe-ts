import { Bifunctor2 } from 'fp-ts/lib/Bifunctor'
import { Semigroupoid2 } from 'fp-ts/lib/Semigroupoid'
import { Comonad2 } from 'fp-ts/lib/Comonad'
import { Foldable2 } from 'fp-ts/lib/Foldable'
import { Traversable2 } from 'fp-ts/lib/Traversable'
import { Applicative } from 'fp-ts/lib/Applicative'
import { HKT } from 'fp-ts/lib/HKT'
import { pipeable } from 'fp-ts/lib/pipeable'
import { Monad2 } from 'fp-ts/lib/Monad'
import { Monoid } from 'fp-ts/lib/Monoid'
import { Cmd, cmd as cmd_, none, getMonoid as cmdGetMonoid } from './Cmd'

declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    'effe-ts/State': State<A, E>
  }
}

export const URI = 'effe-ts/State'
export type URI = typeof URI

export type State<Model, Action = never> = [Model, Cmd<Action>]

export const model = <Model, Action>(state: State<Model, Action>): Model => state[0]
export const cmd = <Model, Action>(state: State<Model, Action>): Cmd<Action> => state[1]

export const of = <Model>(model: Model): State<Model, never> => [model, none]

const monoidCmd = cmdGetMonoid<any>()

export function getMonoid<Model, Action>(M: Monoid<Model>): Monoid<State<Model, Action>> {
  return {
    concat: (x, y) => [M.concat(model(x), model(y)), monoidCmd.concat(cmd(x), cmd(y))],
    empty: of(M.empty)
  }
}

export const state: Semigroupoid2<URI> & Bifunctor2<URI> & Comonad2<URI> & Foldable2<URI> & Traversable2<URI> & Monad2<URI> = {
  URI,
  compose: (ba, ae) => [model(ba), cmd(ae)],
  map: (ma, f) => [f(ma[0]), ma[1]],
  bimap: (ma, f, g) => [g(model(ma)), cmd_.map(cmd(ma), f)],
  mapLeft: (ma, f) => [model(ma), cmd_.map(cmd(ma), f)],
  ap: (fab, fa) => [model(fab)(model(fa)), monoidCmd.concat(cmd(fab), cmd(fa))],
  of,
  chain: (fa, f) => {
    const [b, s] = f(model(fa))
    return [b, monoidCmd.concat(cmd(fa), s)]
  },
  extract: model,
  extend: (ae, f) => [f(ae), cmd(ae)],
  reduce: (ae, b, f) => f(b, model(ae)),
  foldMap: _ => (ae, f) => f(model(ae)),
  reduceRight: (ae, b, f) => f(model(ae), b),
  traverse: <F>(F: Applicative<F>) => <A, S, B>(as: State<A, S>, f: (a: A) => HKT<F, B>): HKT<F, State<B, S>> => {
    return F.map(f(model(as)), b => [b, cmd(as)])
  },
  sequence: <F>(F: Applicative<F>) => <A, S>(fas: State<HKT<F, A>, S>): HKT<F, State<A, S>> => {
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
