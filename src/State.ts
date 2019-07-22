import { Cmd } from './Cmd'

export type State<Model, Action> = [Model, Cmd<Action>]
