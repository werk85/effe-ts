import { pipe } from 'fp-ts/lib/function'
import { BehaviorSubject, Observable } from 'rxjs'
import { distinctUntilChanged, share } from 'rxjs/operators'
import { Reader } from 'fp-ts/lib/Reader'
import * as R from 'fp-ts-rxjs/lib/Observable'
import * as RO from 'fp-ts-rxjs/lib/ReaderObservable'
import { concatAll } from 'fp-ts/lib/Monoid'
import * as sub from './Sub'
import * as state from './State'

export interface Dispatch<Action> {
  (action: Action): void
}

export interface Program<Model, Action> {
  action$: Observable<Action>
  dispatch: Dispatch<Action>
  model$: Observable<Model>
}
export interface ReaderProgram<Env, Model, Action> extends Reader<Env, Program<Model, Action>> {}

export function program<Env, Model, Action>(
  init: state.State<Env, Model, Action>,
  update: (action: Action) => (model: Model) => state.State<Env, Model, Action>,
  subscriptions: sub.Sub<Env, Model, Action> = sub.none
): ReaderProgram<Env, Model, Action> {
  return env => {
    const state$ = new BehaviorSubject<state.State<Env, Model, Action>>(init)

    const dispatch: Dispatch<Action> = action => state$.next(pipe(state.model(state$.value), update(action)))

    const model$ = pipe(state$, R.map(state.model), distinctUntilChanged(), share())

    const cmd$ = pipe(state$, RO.fromObservable, RO.chain(state.cmd))

    const sub$ = subscriptions(model$)

    const action$ = pipe(env, concatAll(RO.getMonoid<Env, Action>())([cmd$, sub$]))

    return { action$, dispatch, model$ }
  }
}

export function run<Env, Model, Action>(program: ReaderProgram<Env, Model, Action>, env: Env): Observable<Model> {
  const { action$, dispatch, model$ } = program(env)
  action$.subscribe(dispatch)
  return model$
}
