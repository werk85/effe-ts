import { Observable } from 'rxjs';
import { Reader } from 'fp-ts/lib/Reader';
import * as sub from './Sub';
import * as state from './State';
export interface Dispatch<Action> {
    (action: Action): void;
}
export interface Program<Model, Action> {
    action$: Observable<Action>;
    dispatch: Dispatch<Action>;
    model$: Observable<Model>;
}
export interface ReaderProgram<Env, Model, Action> extends Reader<Env, Program<Model, Action>> {
}
export declare function program<Env, Model, Action>(init: state.State<Env, Model, Action>, update: (action: Action) => (model: Model) => state.State<Env, Model, Action>, subscriptions?: sub.Sub<Env, Model, Action>): ReaderProgram<Env, Model, Action>;
export declare function run<Env, Model, Action>(program: ReaderProgram<Env, Model, Action>, env: Env): Observable<Model>;
