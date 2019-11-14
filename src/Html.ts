import { Observable } from 'rxjs'
import { pipe } from 'fp-ts/lib/pipeable'
import * as Rx from 'rxjs/operators'
import { Reader } from 'fp-ts/lib/Reader'
import * as subr from './SubR'
import * as platform from './Platform'
import * as stater from './StateR'
import * as state from './State'
import * as sub from './Sub'

export interface Html<DOM, Action> {
  (dispatch: platform.Dispatch<Action>): DOM
}

export interface Renderer<DOM> {
  (dom: DOM): void
}

export function map<DOM, A, Action>(ha: Html<DOM, A>, f: (a: A) => Action): Html<DOM, Action> {
  return dispatch => ha(a => dispatch(f(a)))
}

export interface Program<Model, Action, DOM> extends platform.Program<Model, Action> {
  html$: Observable<Html<DOM, Action>>
}
export interface ProgramR<Env, Model, Action, DOM> extends Reader<Env, Program<Model, Action, DOM>> {}

export function programR<Env, Model, Action, DOM>(
  init: Reader<Env, stater.StateR<Env, Model, Action>>,
  update: (action: Action, model: Model) => stater.StateR<Env, Model, Action>,
  view: (model: Model) => Html<DOM, Action>,
  subscriptions: subr.SubR<Env, Model, Action> = subr.none
): ProgramR<Env, Model, Action, DOM> {
  return env => {
    const { dispatch, cmd$, sub$, model$ } = platform.programR(init, update, subscriptions)(env)
    const html$ = pipe(
      model$,
      Rx.map(model => view(model))
    )
    return { dispatch, cmd$, sub$, model$, html$ }
  }
}

export function program<Model, Action, DOM>(
  init: state.State<Model, Action>,
  update: (action: Action, model: Model) => state.State<Model, Action>,
  view: (model: Model) => Html<DOM, Action>,
  subscriptions: sub.Sub<Model, Action> = sub.none
): ProgramR<{}, Model, Action, DOM> {
  return programR(
    () => stater.fromState(init),
    (action, model) => stater.fromState(update(action, model)),
    view,
    subr.fromSub(subscriptions)
  )
}

export function run<Env, Model, Action, DOM>(
  program: ProgramR<Env, Model, Action, DOM>,
  renderer: Renderer<DOM>,
  env: Env
): Observable<Model> {
  const p = program(env)
  p.html$.subscribe(html => renderer(html(p.dispatch)))
  return platform.run(() => p, env)
}
