import { getApplicative as tupleGetApplicative } from 'fp-ts/lib/Tuple'
import { Cmd, none, getMonoid } from './Cmd'

export type State<Model, Action = never> = [Model, Cmd<Action>]

export const of = <Model>(model: Model): State<Model, never> => [model, none]

export const getApplicative = <Action>() => tupleGetApplicative(getMonoid<Action>())
