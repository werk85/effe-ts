import { Observable } from 'rxjs'
import * as Rr from 'fp-ts/lib/Reader'
import { pipeable } from 'fp-ts/lib/pipeable'
import { Monoid } from 'fp-ts/lib/Monoid'
import { Monad3 } from 'fp-ts/lib/Monad'
import * as sub from './Sub'

declare module 'fp-ts/lib/HKT' {
  interface URItoKind3<R, E, A> {
    'effe-ts/SubR': SubR<R, E, A>
  }
}

export const URI = 'effe-ts/SubR'
export type URI = typeof URI

export interface SubR<Env, Model, Action> extends Rr.Reader<Env, sub.Sub<Model, Action>> {}

export const none: SubR<{}, unknown, never> = Rr.of(sub.none)

export function fromObservable<Env, Model, Action>(actions$: Observable<Action>): SubR<Env, Model, Action> {
  return Rr.of(sub.fromObservable(actions$))
}

export function fromSub<Env, Model, Action>(sub: sub.Sub<Model, Action>): SubR<Env, Model, Action> {
  return Rr.of(sub)
}

export function getMonoid<Env, Model, Action>(): Monoid<SubR<Env, Model, Action>> {
  return Rr.getMonoid(sub.getMonoid())
}

export const subr: Monad3<URI> = {
  URI,
  map: (ma, f) => r => sub.sub.map(ma(r), f),
  ap: (mab, ma) => r => sub.sub.ap(mab(r), ma(r)),
  of: a => Rr.of(sub.sub.of(a)),
  chain: (ma, f) => r => sub.sub.chain(ma(r), a => f(a)(r))
}

const { ap, apFirst, apSecond, map, chainFirst, flatten, chain } = pipeable(subr)

export { ap, apFirst, apSecond, chain, chainFirst, flatten, map }
