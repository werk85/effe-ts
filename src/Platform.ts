import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { BehaviorSubject, Observable } from 'rxjs'
import { distinctUntilChanged, map, mergeAll, share } from 'rxjs/operators'
import * as T from 'fp-ts/lib/Tuple'
import { Task } from 'fp-ts/lib/Task'
import { Reader } from 'fp-ts/lib/Reader'
import * as subr from './SubR'
import * as stater from './StateR'
import { State } from './State'
import * as sub from './Sub'

export interface Dispatch<Action> {
  (action: Action): void
}

export interface Program<Model, Action> {
  dispatch: Dispatch<Action>
  cmd$: Observable<Task<O.Option<Action>>>
  model$: Observable<Model>
  sub$: Observable<Action>
}
export interface ProgramR<Env, Model, Action> extends Reader<Env, Program<Model, Action>> {}

export function programR<Env, Model, Action>(
  init: Reader<Env, stater.StateR<Env, Model, Action>>,
  update: (action: Action, model: Model) => stater.StateR<Env, Model, Action>,
  subscriptions: subr.SubR<Env, Model, Action> = subr.none
): ProgramR<Env, Model, Action> {
  return env => {
    const state$ = new BehaviorSubject<stater.StateR<Env, Model, Action>>(init(env))

    const dispatch: Dispatch<Action> = action => state$.next(update(action, T.fst(state$.value)))

    const model$ = pipe(state$, map(T.fst), distinctUntilChanged(), share())

    const cmd$ = pipe(
      state$,
      map(state => T.snd(state)(env)),
      mergeAll()
    )

    const sub$ = subscriptions(env)(model$)

    return { cmd$, dispatch, model$, sub$ }
  }
}

export function program<Model, Action>(
  init: State<Model, Action>,
  update: (action: Action, model: Model) => State<Model, Action>,
  subscriptions: sub.Sub<Model, Action> = sub.none
): ProgramR<{}, Model, Action> {
  return programR(
    () => stater.fromState(init),
    (action, model) => stater.fromState(update(action, model)),
    subr.fromSub(subscriptions)
  )
}

export function run<Env, Model, Action>(program: ProgramR<Env, Model, Action>, env: Env): Observable<Model> {
  const { dispatch, cmd$, model$, sub$ } = program(env)
  sub$.subscribe(dispatch)
  cmd$.subscribe(cmd => cmd().then(O.map(dispatch)))
  return model$
}
