import * as O from 'fp-ts/es6/Option';
import { Location as HistoryLocation, History } from 'history';
import * as html from './Html';
export declare type Location = HistoryLocation;
export declare const navigation: <H>(history: History<H>) => {
    program: <Model, Action, DOM>(locationToMessage: (location: HistoryLocation<any>) => Action, init: (location: HistoryLocation<any>) => [Model, import("rxjs").Observable<import("fp-ts/es6/Task").Task<O.Option<Action>>>], update: (msg: Action, model: Model) => [Model, import("rxjs").Observable<import("fp-ts/es6/Task").Task<O.Option<Action>>>], view: (model: Model) => html.Html<DOM, Action>, subscriptions?: (model: Model) => import("rxjs").Observable<Action>) => html.Program<Model, Action, DOM>;
    programWithFlags: <flags, model, msg, dom>(locationToMessage: (location: HistoryLocation<any>) => msg, init: (flags: flags) => (location: HistoryLocation<any>) => [model, import("rxjs").Observable<import("fp-ts/es6/Task").Task<O.Option<msg>>>], update: (msg: msg, model: model) => [model, import("rxjs").Observable<import("fp-ts/es6/Task").Task<O.Option<msg>>>], view: (model: model) => html.Html<dom, msg>, subscriptions?: (model: model) => import("rxjs").Observable<msg>) => (flags: flags) => html.Program<model, msg, dom>;
    push: <Model>(url: string) => import("rxjs").Observable<import("fp-ts/es6/Task").Task<O.Option<Model>>>;
};
