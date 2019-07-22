import { Cmd } from './Cmd';
export declare type State<Model, Action> = [Model, Cmd<Action>];
