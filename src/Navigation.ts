import { Subject, Observable } from 'rxjs'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as Rx from 'rxjs/operators'
import { IORef } from 'fp-ts/lib/IORef'
import * as T from 'fp-ts/lib/Task'
import * as IO from 'fp-ts/lib/IO'
import { Cmd, perform_ } from './Cmd'
import { Sub, none, batch } from './Sub'
import * as html from './Html'
import { State } from './State'
import { Location as HistoryLocation, History } from 'history'

export interface Location extends HistoryLocation {}

const historyRef = new IORef<O.Option<History>>(O.none)

export const pushTask = (url: string): T.Task<O.Option<never>> =>
  pipe(
    T.fromIO(historyRef.read),
    T.map(
      O.chain(history => {
        history.push(url)
        return O.none
      })
    )
  )

export const push = (url: string): Cmd<never> => perform_(pushTask(url))

export interface Program<Model, Action, DOM> extends html.Program<Model, Action, DOM> {
  history: IO.IO<void>
}

export const program = <Model, Action, DOM>(
  locationToMessage: (location: Location) => Action,
  init: (location: Location) => State<Model, Action>,
  update: (action: Action, model: Model) => State<Model, Action>,
  view: (model: Model) => html.Html<DOM, Action>,
  subscriptions: (model: Model) => Sub<Action> = () => none
) => <HLS>(history: History<HLS>): Program<Model, Action, DOM> => {
  const location$ = new Subject<Location>()

  const listen: IO.IO<void> = () => history.listen(location => location$.next(location))

  const onChangeLocation$ = pipe(
    location$,
    Rx.map(location => locationToMessage(location))
  )
  const subs = (model: Model): Sub<Action> => batch([subscriptions(model), onChangeLocation$])
  return {
    ...html.program(init(history.location), update, view, subs),
    history: pipe(
      historyRef.write(O.some(history)),
      IO.chain(() => listen)
    )
  }
}

export const programWithFlags = <Flags, Model, Action, DOM>(
  locationToMessage: (location: Location) => Action,
  init: (flags: Flags) => (location: Location) => [Model, Cmd<Action>],
  update: (action: Action, model: Model) => [Model, Cmd<Action>],
  view: (model: Model) => html.Html<DOM, Action>,
  subscriptions: (model: Model) => Sub<Action> = () => none
) => <HLS>(history: History<HLS>) => (flags: Flags): Program<Model, Action, DOM> =>
  program(locationToMessage, init(flags), update, view, subscriptions)(history)

export const run = <Model, Action, DOM>(
  program: Program<Model, Action, DOM>,
  renderer: html.Renderer<DOM>
): Observable<Model> => {
  program.history()
  return html.run(program, renderer)
}
