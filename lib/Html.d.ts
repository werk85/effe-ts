import { Observable } from 'rxjs';
import { Reader } from 'fp-ts/lib/Reader';
import { Functor2 } from 'fp-ts/lib/Functor';
import * as sub from './Sub';
import * as platform from './Platform';
import * as state from './State';
declare module 'fp-ts/lib/HKT' {
    interface URItoKind2<E, A> {
        'effe-ts/Html': Html<E, A>;
    }
}
export declare const URI = "effe-ts/Html";
export declare type URI = typeof URI;
export interface Html<DOM, Action> {
    (dispatch: platform.Dispatch<Action>): DOM;
}
export declare const html: Functor2<URI>;
declare const map: <A, B>(f: (a: A) => B) => <E>(fa: Html<E, A>) => Html<E, B>;
export { map };
export interface Renderer<DOM> {
    (dom: DOM): void;
}
export interface Program<Model, Action, DOM> extends platform.Program<Model, Action> {
    html$: Observable<Html<DOM, Action>>;
}
export interface ReaderProgram<Env, Model, Action, DOM> extends Reader<Env, Program<Model, Action, DOM>> {
}
export declare function program<Env, Model, Action, DOM>(init: state.State<Env, Model, Action>, update: (action: Action) => (model: Model) => state.State<Env, Model, Action>, view: (model: Model) => Html<DOM, Action>, subscriptions?: sub.Sub<Env, Model, Action>): ReaderProgram<Env, Model, Action, DOM>;
export declare function run<Env, Model, Action, DOM>(program: ReaderProgram<Env, Model, Action, DOM>, renderer: Renderer<DOM>, env: Env): Observable<Model>;
