import * as R from 'fp-ts-rxjs/lib/Observable'
import { pipe } from 'fp-ts/lib/function'
import { Functor2 } from 'fp-ts/lib/Functor'
import { Reader } from 'fp-ts/lib/Reader'
import { Observable } from 'rxjs'
import * as platform from './Platform'
import * as state from './State'
import * as sub from './Sub'

declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    'effe-ts/Html': Html<E, A>
  }
}

export const URI = 'effe-ts/Html'
export type URI = typeof URI

export interface Html<DOM, Action> {
  (dispatch: platform.Dispatch<Action>): DOM
}

export const map: <E, A, B>(f: (a: A) => B) => (ma: Html<E, A>) => Html<E, B> = f => fa => dispatch => fa(a => dispatch(f(a)))

export const Functor: Functor2<URI> = {
  URI,
  map: (fa, f) => pipe(fa, map(f))
}

/**
 * @deprecated
 */
export const html = Functor

export interface Renderer<DOM> {
  (dom: DOM): void
}

export interface Program<Model, Action, DOM> extends platform.Program<Model, Action> {
  html$: Observable<Html<DOM, Action>>
}
export interface ReaderProgram<Env, Model, Action, DOM> extends Reader<Env, Program<Model, Action, DOM>> {}

export function program<Env, Model, Action, DOM>(
  init: state.State<Env, Model, Action>,
  update: (action: Action) => (model: Model) => state.State<Env, Model, Action>,
  view: (model: Model) => Html<DOM, Action>,
  subscriptions: sub.Sub<Env, Model, Action> = sub.none
): ReaderProgram<Env, Model, Action, DOM> {
  return env => {
    const { dispatch, action$, model$ } = platform.program(init, update, subscriptions)(env)
    const html$ = pipe(
      model$,
      R.map(model => view(model))
    )
    return { dispatch, action$, model$, html$ }
  }
}

export function run<Env, Model, Action, DOM>(
  program: ReaderProgram<Env, Model, Action, DOM>,
  renderer: Renderer<DOM>,
  env: Env
): Observable<Model> {
  const p = program(env)
  p.html$.subscribe(html => renderer(html(p.dispatch)))
  return platform.run(() => p, env)
}
