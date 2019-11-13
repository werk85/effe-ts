import { Subject, Observable } from 'rxjs'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as Rx from 'rxjs/operators'
import * as T from 'fp-ts/lib/Task'
import * as IO from 'fp-ts/lib/IO'
import { Reader } from 'fp-ts/lib/Reader'
import { CmdR, perform_ } from './CmdR'
import * as subr from './SubR'
import * as html from './Html'
import { StateR } from './StateR'
import { Location as HistoryLocation, History } from 'history'

export interface Location extends HistoryLocation {}

export interface NavigationHistory {
  location: Location
  push(url: string): IO.IO<void>
  listen(f: (location: Location) => void): IO.IO<void>
}

export function history(history: History): NavigationHistory {
  return {
    location: history.location,
    push: url => () => history.push(url),
    listen: f => () => history.listen(f)
  }
}

export interface NavigationEnv {
  history: NavigationHistory
}

export const pushTask = <Env extends NavigationEnv>(url: string): Reader<Env, T.Task<O.Option<never>>> => env =>
  pipe(
    T.fromIO(env.history.push(url)),
    T.map(() => O.none)
  )

export const push = <Env extends NavigationEnv>(url: string): CmdR<Env, never> => perform_(pushTask(url))

export interface Program<Model, Action, DOM> extends html.Program<Model, Action, DOM> {
  listen: IO.IO<void>
}
export interface ProgramR<Env, Model, Action, DOM> extends Reader<Env, Program<Model, Action, DOM>> {}

export function program<Env extends NavigationEnv, Model, Action, DOM>(
  locationToMessage: (location: Location) => Action,
  init: (location: Location) => Reader<Env, StateR<Env, Model, Action>>,
  update: (action: Action, model: Model) => StateR<Env, Model, Action>,
  view: (model: Model) => html.Html<DOM, Action>,
  subscriptions: subr.SubR<Env, Model, Action> = subr.none
): ProgramR<Env, Model, Action, DOM> {
  const monoidSubR = subr.getMonoid<Env, Model, Action>()

  return env => {
    const location$ = new Subject<Location>()

    const onChangeLocation = subr.fromObservable(
      pipe(
        location$,
        Rx.map(location => locationToMessage(location))
      )
    )
    const subs: subr.SubR<Env, Model, Action> = monoidSubR.concat(subscriptions, onChangeLocation)

    return {
      ...html.programR(init(env.history.location), update, view, subs)(env),
      listen: env.history.listen(location => location$.next(location))
    }
  }
}

export function run<Env extends NavigationEnv, Model, Action, DOM>(
  program: ProgramR<Env, Model, Action, DOM>,
  renderer: html.Renderer<DOM>,
  env: Env
): Observable<Model> {
  const p = program(env)
  p.listen()
  return html.run(() => p, renderer, env)
}
