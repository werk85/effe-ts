import { Observable } from 'rxjs';
import * as IO from 'fp-ts/lib/IO';
import { Reader } from 'fp-ts/lib/Reader';
import { Location as HistoryLocation, History } from 'history';
import * as RO from 'fp-ts-rxjs/lib/ReaderObservable';
import * as sub from './Sub';
import * as html from './Html';
import { State } from './State';
export interface Location extends HistoryLocation {
}
export interface NavigationHistory {
    location: Location;
    push(url: string): IO.IO<void>;
    goBack: IO.IO<void>;
    listen(f: (location: Location) => void): IO.IO<void>;
}
export declare function history(history: History): NavigationHistory;
export interface NavigationEnv {
    history: NavigationHistory;
}
export declare const push: <Env extends NavigationEnv>(url: string) => RO.ReaderObservable<Env, never>;
export declare const goBack: <Env extends NavigationEnv>() => RO.ReaderObservable<Env, never>;
export interface Program<Model, Action, DOM> extends html.Program<Model, Action, DOM> {
    listen: IO.IO<void>;
}
export interface ReaderProgram<Env, Model, Action, DOM> extends Reader<Env, Program<Model, Action, DOM>> {
}
export declare function program<Env extends NavigationEnv, Model, Action, DOM>(locationToMessage: (location: Location) => Action, init: (location: Location) => State<Env, Model, Action>, update: (action: Action) => (model: Model) => State<Env, Model, Action>, view: (model: Model) => html.Html<DOM, Action>, subscriptions?: sub.Sub<Env, Model, Action>): ReaderProgram<Env, Model, Action, DOM>;
export declare function run<Env extends NavigationEnv, Model, Action, DOM>(program: ReaderProgram<Env, Model, Action, DOM>, renderer: html.Renderer<DOM>, env: Env): Observable<Model>;
