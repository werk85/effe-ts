import { Monoid } from 'fp-ts/lib/Monoid'
import { EMPTY } from 'rxjs'
import { pipeable } from 'fp-ts/lib/pipeable'
import * as E from 'fp-ts/lib/Either'
import { Monad2 } from 'fp-ts/lib/Monad'
import * as Rr from 'fp-ts/lib/Reader'
import * as RTE from 'fp-ts/lib/ReaderTaskEither'
import * as RT from 'fp-ts/lib/ReaderTask'
import * as cmd from './Cmd'

declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    'effe-ts/CmdR': CmdR<E, A>
  }
}

export const URI = 'effe-ts/CmdR'
export type URI = typeof URI

export interface CmdR<R, Action> extends Rr.Reader<R, cmd.Cmd<Action>> {}

export const ask = <R>(): CmdR<R, R> => cmd.of

export const asks = <R, Action>(f: (env: R) => Action): CmdR<R, Action> => r => cmd.of(f(r))

export const env = <R, Action>(f: (env: R) => CmdR<R, Action>): CmdR<R, Action> => r => f(r)(r)

export const none: CmdR<{}, never> = Rr.of(EMPTY)

export const of = <Action>(a: Action): CmdR<{}, Action> => Rr.of(cmd.of(a))

export function getMonoid<R, Action>(): Monoid<CmdR<R, Action>> {
  return Rr.getMonoid<R, cmd.Cmd<Action>>(cmd.getMonoid())
}

export function perform<R, A, Action>(task: RT.ReaderTask<R, A>, f: (a: A) => Action): CmdR<R, Action> {
  return r => cmd.perform(task(r), f)
}

export function perform_<R, A, Action>(task: RT.ReaderTask<R, A>): CmdR<R, Action> {
  return r => cmd.perform_(task(r))
}

export function attempt<R, E, A, Action>(task: RTE.ReaderTaskEither<R, E, A>, f: (e: E.Either<E, A>) => Action): CmdR<R, Action> {
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
