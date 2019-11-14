import { getApplicative as tupleGetApplicative } from 'fp-ts/lib/Tuple'
import { CmdR, none, getMonoid, fromCmd } from './CmdR'
import { State } from './State'

export type StateR<Env, Model, Action = never> = [Model, CmdR<Env, Action>]

export const of = <Model>(model: Model): StateR<{}, Model, never> => [model, none]

export const getApplicative = <Env, Action>() => tupleGetApplicative(getMonoid<Env, Action>())

export function fromState<Model, Action>([model, cmd]: State<Model, Action>): StateR<{}, Model, Action> {
  return [model, fromCmd(cmd)]
}
