import * as O from 'fp-ts/es6/Option';
import { Location as HistoryLocation, History } from 'history';
import * as html from './Html';
export declare type Location = HistoryLocation;
export declare const withHistory: <H>(history: History<H>) => {
    program: <Model, Action, DOM>(locationToMessage: (location: HistoryLocation<any>) => Action, init: (location: HistoryLocation<any>) => [Model, import("rxjs").Observable<import("fp-ts/es6/Task").Task<O.Option<Action>>>], update: (action: Action, model: Model) => [Model, import("rxjs").Observable<import("fp-ts/es6/Task").Task<O.Option<Action>>>], view: (model: Model) => html.Html<DOM, Action>, subscriptions?: (model: Model) => import("rxjs").Observable<Action>) => html.Program<Model, Action, DOM>;
    programWithFlags: <Flags, Model, Action, DOM>(locationToMessage: (location: HistoryLocation<any>) => Action, init: (flags: Flags) => (location: HistoryLocation<any>) => [Model, import("rxjs").Observable<import("fp-ts/es6/Task").Task<O.Option<Action>>>], update: (action: Action, model: Model) => [Model, import("rxjs").Observable<import("fp-ts/es6/Task").Task<O.Option<Action>>>], view: (model: Model) => html.Html<DOM, Action>, subscriptions?: (model: Model) => import("rxjs").Observable<Action>) => (flags: Flags) => html.Program<Model, Action, DOM>;
    push: <Model>(url: string) => import("rxjs").Observable<import("fp-ts/es6/Task").Task<O.Option<Model>>>;
};
