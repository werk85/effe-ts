import { Observable } from 'rxjs'
import { pipe } from 'fp-ts/es6/pipeable'
import * as Rx from 'rxjs/operators'
import { Sub, none } from './Sub'
import * as platform from './Platform'
import { State } from './State'

export interface Html<DOM, Action> {
  (dispatch: platform.Dispatch<Action>): DOM
}

export interface Renderer<DOM> {
  (dom: DOM): void
}

export function map<DOM, A, Action>(ha: Html<DOM, A>, f: (a: A) => Action): Html<DOM, Action> {
  return dispatch => ha(a => dispatch(f(a)))
}

export interface Program<model, msg, dom> extends platform.Program<model, msg> {
  html$: Observable<Html<dom, msg>>
}

export function program<Model, Action, DOM>(
  init: State<Model, Action>,
  update: (msg: Action, model: Model) => State<Model, Action>,
  view: (model: Model) => Html<DOM, Action>,
  subscriptions: (model: Model) => Sub<Action> = () => none
): Program<Model, Action, DOM> {
  const { dispatch, cmd$, sub$, model$ } = platform.program(init, update, subscriptions)
  const html$ = pipe(
    model$,
    Rx.map(model => view(model))
  )
  return { dispatch, cmd$, sub$, model$, html$ }
}

export const programWithFlags = <Flags, Model, Action, DOM>(
  init: (flags: Flags) => State<Model, Action>,
  update: (msg: Action, model: Model) => State<Model, Action>,
  view: (model: Model) => Html<DOM, Action>,
  subscriptions?: (model: Model) => Sub<Action>
) => (flags: Flags): Program<Model, Action, DOM> => program(init(flags), update, view, subscriptions)

export const run = <Model, Action, DOM>(program: Program<Model, Action, DOM>, renderer: Renderer<DOM>): Observable<Model> => {
  const { dispatch, html$ } = program
  html$.subscribe(html => renderer(html(dispatch)))
  return platform.run(program)
}
