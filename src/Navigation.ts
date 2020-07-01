import { Subject, Observable } from 'rxjs'
import { pipe } from 'fp-ts/lib/pipeable'
import * as R from 'fp-ts-rxjs/lib/Observable'
import * as IO from 'fp-ts/lib/IO'
import { Reader } from 'fp-ts/lib/Reader'
import { Location as HistoryLocation, History, Listener } from 'history'
import * as RO from 'fp-ts-rxjs/lib/ReaderObservable'
import * as T from 'fp-ts/lib/Task'
import * as sub from './Sub'
import * as html from './Html'
import { State } from './State'
import { perform_ } from './Cmd'

export interface Location extends HistoryLocation {}

export interface LocationUpdate {
  action: 'POP' | 'PUSH' | 'REPLACE'
  location: Location
}

export interface NavigationHistory {
  location: Location
  push(url: string): IO.IO<void>
  back: IO.IO<void>
  listen(f: Listener<any>): IO.IO<void>
}

export function history(history: History): NavigationHistory {
  return {
    location: history.location,
    push: url => () => history.push(url),
    back: () => history.back(),
    listen: f => () => history.listen(f)
  }
}

export interface NavigationEnv {
  history: NavigationHistory
}

export const push = <Env extends NavigationEnv>(url: string): RO.ReaderObservable<Env, never> =>
  perform_(env => T.fromIO(env.history.push(url)))

export const goBack = <Env extends NavigationEnv>(): RO.ReaderObservable<Env, never> =>
  perform_(env => T.fromIO(env.history.back))

export interface Program<Model, Action, DOM> extends html.Program<Model, Action, DOM> {
  listen: IO.IO<void>
}
export interface ReaderProgram<Env, Model, Action, DOM> extends Reader<Env, Program<Model, Action, DOM>> {}

export function program<Env extends NavigationEnv, Model, Action, DOM>(
  locationUpdateToMessage: (update: LocationUpdate) => Action,
  init: (location: Location) => State<Env, Model, Action>,
  update: (action: Action) => (model: Model) => State<Env, Model, Action>,
  view: (model: Model) => html.Html<DOM, Action>,
  subscriptions: sub.Sub<Env, Model, Action> = sub.none
): ReaderProgram<Env, Model, Action, DOM> {
  const monoidSubR = sub.getMonoid<Env, Model, Action>()

  return env => {
    const update$ = new Subject<LocationUpdate>()

    const onChangeLocation = sub.fromObservable(pipe(update$, R.map(locationUpdateToMessage)))
    const subs: sub.Sub<Env, Model, Action> = monoidSubR.concat(subscriptions, onChangeLocation)

    return {
      ...html.program(init(env.history.location), update, view, subs)(env),
      listen: env.history.listen(update => update$.next(update))
    }
  }
}

export function run<Env extends NavigationEnv, Model, Action, DOM>(
  program: ReaderProgram<Env, Model, Action, DOM>,
  renderer: html.Renderer<DOM>,
  env: Env
): Observable<Model> {
  const p = program(env)
  p.listen()
  return html.run(() => p, renderer, env)
}
