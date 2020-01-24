import { Applicative } from 'fp-ts/lib/Applicative'
import { HKT } from 'fp-ts/lib/HKT'
import { pipeable } from 'fp-ts/lib/pipeable'
import { Semigroupoid3 } from 'fp-ts/lib/Semigroupoid'
import { Bifunctor3 } from 'fp-ts/lib/Bifunctor'
import { Comonad3 } from 'fp-ts/lib/Comonad'
import { Foldable3 } from 'fp-ts/lib/Foldable'
import { Traversable3 } from 'fp-ts/lib/Traversable'
import { Monad3 } from 'fp-ts/lib/Monad'
import { Monoid } from 'fp-ts/lib/Monoid'
import { Semigroup } from 'fp-ts/lib/Semigroup'
import { CmdR, none, cmdr as cmdr_, fromCmd, getMonoid as cmdrGetMonoid } from './CmdR'
import { State } from './State'

declare module 'fp-ts/lib/HKT' {
  interface URItoKind3<R, E, A> {
    'effe-ts/StateR': StateR<R, A, E>
  }
}

export const URI = 'effe-ts/StateR'
export type URI = typeof URI

export type StateR<R, Model, Action = never> = [Model, CmdR<R, Action>]

export const model = <R, Model, Action>(state: StateR<R, Model, Action>): Model => state[0]
export const cmdr = <R, Model, Action>(state: StateR<R, Model, Action>): CmdR<R, Action> => state[1]

export const of = <R, Model, Action = never>(model: Model): StateR<R, Model, Action> => [model, none]

export function fromState<Model, Action>([model, cmd]: State<Model, Action>): StateR<{}, Model, Action> {
  return [model, fromCmd(cmd)]
}

const monoidCmd = cmdrGetMonoid<any, any>()

export function getSemigroup<R, Model, Action>(S: Semigroup<Model>): Semigroup<StateR<R, Model, Action>> {
  return {
    concat: (x, y) => [S.concat(model(x), model(y)), monoidCmd.concat(cmdr(x), cmdr(y))]
  }
}

export function getMonoid<R, Model, Action>(M: Monoid<Model>): Monoid<StateR<R, Model, Action>> {
  return {
    ...getSemigroup(M),
    empty: of(M.empty)
  }
}

export const stater: Semigroupoid3<URI> & Bifunctor3<URI> & Comonad3<URI> & Foldable3<URI> & Traversable3<URI> & Monad3<URI> = {
  URI,
  compose: (ba, ae) => [model(ba), cmdr(ae)],
  map: (ma, f) => [f(ma[0]), ma[1]],
  bimap: (ma, f, g) => [g(model(ma)), cmdr_.map(cmdr(ma), f)],
  mapLeft: (ma, f) => [model(ma), cmdr_.map(cmdr(ma), f)],
  ap: (fab, fa) => [model(fab)(model(fa)), monoidCmd.concat(cmdr(fab), cmdr(fa))],
  of,
  chain: (fa, f) => {
    const [b, s] = f(model(fa))
    return [b, monoidCmd.concat(cmdr(fa), s)]
  },
  extract: model,
  extend: (ae, f) => [f(ae), cmdr(ae)],
  reduce: (ae, b, f) => f(b, model(ae)),
  foldMap: _ => (ae, f) => f(model(ae)),
  reduceRight: (ae, b, f) => f(model(ae), b),
  traverse: <F>(F: Applicative<F>) => <R, A, S, B>(as: StateR<R, A, S>, f: (a: A) => HKT<F, B>): HKT<F, StateR<R, B, S>> => {
    return F.map(f(model(as)), b => [b, cmdr(as)])
  },
  sequence: <F>(F: Applicative<F>) => <R, A, S>(fas: StateR<R, HKT<F, A>, S>): HKT<F, StateR<R, A, S>> => {
    return F.map(model(fas), a => [a, cmdr(fas)])
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
} = pipeable(stater)

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
