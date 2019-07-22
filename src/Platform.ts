import * as O from 'fp-ts/es6/Option'
import { pipe } from 'fp-ts/es6/pipeable'
import { BehaviorSubject, Observable } from 'rxjs'
import { distinctUntilChanged, map, mergeAll, share, startWith, switchMap } from 'rxjs/operators'
import { Cmd } from './Cmd'
import { Sub, none } from './Sub'
import { State } from './State'

export type Dispatch<Action> = (action: Action) => void

export interface Program<Model, Action> {
  dispatch: Dispatch<Action>
  cmd$: Cmd<Action>
  model$: Observable<Model>
  sub$: Observable<Action>
}

export function program<Model, Action>(
  init: State<Model, Action>,
  reducer: (action: Action, model: Model) => State<Model, Action>,
  subscriptions: (model: Model) => Sub<Action> = () => none
): Program<Model, Action> {
  const state$ = new BehaviorSubject<State<Model, Action>>(init)

  const dispatch: Dispatch<Action> = action => state$.next(reducer(action, state$.value[0]))

  const model$ = pipe(
    state$,
    map(state => state[0]),
    distinctUntilChanged(),
    share()
  )

  const cmd$ = pipe(
    state$,
    map(state => state[1]),
    mergeAll()
  )

  const sub$ = pipe(
    model$,
    startWith(init[0]),
    switchMap(model => subscriptions(model))
  )

  return { cmd$, dispatch, model$, sub$ }
}

export function programWithFlags<Flags, Model, Action>(
  init: (flags: Flags) => State<Model, Action>,
  update: (msg: Action, model: Model) => State<Model, Action>,
  subscriptions: (model: Model) => Sub<Action> = () => none
): (flags: Flags) => Program<Model, Action> {
  return flags => program(init(flags), update, subscriptions)
}

export function run<Model, Action>(program: Program<Model, Action>): Observable<Model> {
  const { dispatch, cmd$, model$, sub$ } = program
  sub$.subscribe(dispatch)
  cmd$.subscribe(cmd => cmd().then(O.map(dispatch)))
  return model$
}
