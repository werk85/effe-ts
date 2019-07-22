import { Observable } from 'rxjs';
import { Sub } from './Sub';
import * as platform from './Platform';
import { State } from './State';
export interface Html<DOM, Action> {
    (dispatch: platform.Dispatch<Action>): DOM;
}
export interface Renderer<DOM> {
    (dom: DOM): void;
}
export declare function map<DOM, A, Action>(ha: Html<DOM, A>, f: (a: A) => Action): Html<DOM, Action>;
export interface Program<model, msg, dom> extends platform.Program<model, msg> {
    html$: Observable<Html<dom, msg>>;
}
export declare function program<Model, Action, DOM>(init: State<Model, Action>, update: (msg: Action, model: Model) => State<Model, Action>, view: (model: Model) => Html<DOM, Action>, subscriptions?: (model: Model) => Sub<Action>): Program<Model, Action, DOM>;
export declare const programWithFlags: <Flags, Model, Action, DOM>(init: (flags: Flags) => [Model, Observable<import("fp-ts/es6/Task").Task<import("fp-ts/es6/Option").Option<Action>>>], update: (msg: Action, model: Model) => [Model, Observable<import("fp-ts/es6/Task").Task<import("fp-ts/es6/Option").Option<Action>>>], view: (model: Model) => Html<DOM, Action>, subscriptions?: ((model: Model) => Observable<Action>) | undefined) => (flags: Flags) => Program<Model, Action, DOM>;
export declare const run: <Model, Action, DOM>(program: Program<Model, Action, DOM>, renderer: Renderer<DOM>) => Observable<Model>;
