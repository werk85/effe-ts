import { Monoid } from 'fp-ts/lib/Monoid'
import * as T from 'fp-ts/lib/Task'
import { EMPTY } from 'rxjs'
import { pipeable } from 'fp-ts/lib/pipeable'
import * as E from 'fp-ts/lib/Either'
import { Monad2 } from 'fp-ts/lib/Monad'
import * as Rr from 'fp-ts/lib/Reader'
import * as RTE from 'fp-ts/lib/ReaderTaskEither'
import * as cmd from './Cmd'

declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    'effe-ts/CmdR': CmdR<E, A>
  }
}

export const URI = 'effe-ts/CmdR'
export type URI = typeof URI

export interface CmdR<Env, Action> extends Rr.Reader<Env, cmd.Cmd<Action>> {}

export const ask = <Env>(): CmdR<Env, Env> => cmd.of

export const asks = <Env, Action>(f: (env: Env) => Action): CmdR<Env, Action> => r => cmd.of(f(r))

export const env = <Env, Action>(f: (env: Env) => CmdR<Env, Action>): CmdR<Env, Action> => r => f(r)(r)

export const none: CmdR<{}, never> = Rr.of(EMPTY)

export const of = <Action>(a: Action): CmdR<{}, Action> => Rr.of(cmd.of(a))

export function getMonoid<Env, Action>(): Monoid<CmdR<Env, Action>> {
  return Rr.getMonoid<Env, cmd.Cmd<Action>>(cmd.getMonoid())
}

export function perform<Env, A, Action>(task: Rr.Reader<Env, T.Task<A>>, f: (a: A) => Action): CmdR<Env, Action> {
  return r => cmd.perform(task(r), f)
}

export function perform_<Env, A, Action>(task: Rr.Reader<Env, T.Task<A>>): CmdR<Env, Action> {
  return r => cmd.perform_(task(r))
}

export function attempt<Env, E, A, Action>(
  task: RTE.ReaderTaskEither<Env, E, A>,
  f: (e: E.Either<E, A>) => Action
): CmdR<Env, Action> {
  return perform(task, f)
}

export function fromCmd<Action>(cmd: cmd.Cmd<Action>): CmdR<{}, Action> {
  return () => cmd
}

export const cmdr: Monad2<URI> = {
  URI,
  map: (ma, f) => r => cmd.cmd.map(ma(r), f),
  of,
  ap: (mab, ma) => r => cmd.cmd.ap(mab(r), ma(r)),
  chain: (ma, f) => r => cmd.cmd.chain(ma(r), a => f(a)(r))
}

const { ap, apFirst, apSecond, chain, chainFirst, flatten, map } = pipeable(cmdr)

export { ap, apFirst, apSecond, chain, chainFirst, flatten, map }
