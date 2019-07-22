import { Observable } from 'rxjs';
import { Cmd } from './Cmd';
import { Sub } from './Sub';
import { State } from './State';
export declare type Dispatch<Action> = (action: Action) => void;
export interface Program<Model, Action> {
    dispatch: Dispatch<Action>;
    cmd$: Cmd<Action>;
    model$: Observable<Model>;
    sub$: Observable<Action>;
}
export declare function program<Model, Action>(init: State<Model, Action>, reducer: (action: Action, model: Model) => State<Model, Action>, subscriptions?: (model: Model) => Sub<Action>): Program<Model, Action>;
export declare function programWithFlags<Flags, Model, Action>(init: (flags: Flags) => State<Model, Action>, update: (msg: Action, model: Model) => State<Model, Action>, subscriptions?: (model: Model) => Sub<Action>): (flags: Flags) => Program<Model, Action>;
export declare function run<Model, Action>(program: Program<Model, Action>): Observable<Model>;
