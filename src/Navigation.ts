import { Subject, of } from 'rxjs'
import * as O from 'fp-ts/es6/Option'
import { Location as HistoryLocation, History } from 'history'
import { pipe } from 'fp-ts/es6/pipeable'
import * as Rx from 'rxjs/operators'
import { Cmd } from './Cmd'
import { Sub, none, batch } from './Sub'
import * as html from './Html'
import { State } from './State'

export type Location = HistoryLocation

export const navigation = <H>(history: History<H>) => {
  const push = <Model>(url: string): Cmd<Model> =>
    of(async () => {
      history.push(url)
      return O.none
    })

  const program = <Model, Action, DOM>(
    locationToMessage: (location: Location) => Action,
    init: (location: Location) => State<Model, Action>,
    update: (msg: Action, model: Model) => State<Model, Action>,
    view: (model: Model) => html.Html<DOM, Action>,
    subscriptions: (model: Model) => Sub<Action> = () => none
  ): html.Program<Model, Action, DOM> => {
    const location$ = new Subject<Location>()

    history.listen(location => location$.next(location))

    const onChangeLocation$ = pipe(
      location$,
      Rx.map(location => locationToMessage(location))
    )
    const subs = (model: Model): Sub<Action> => batch([subscriptions(model), onChangeLocation$])
    return html.program(init(history.location), update, view, subs)
  }

  const programWithFlags = <flags, model, msg, dom>(
    locationToMessage: (location: Location) => msg,
    init: (flags: flags) => (location: Location) => [model, Cmd<msg>],
    update: (msg: msg, model: model) => [model, Cmd<msg>],
    view: (model: model) => html.Html<dom, msg>,
    subscriptions: (model: model) => Sub<msg> = () => none
  ) => (flags: flags): html.Program<model, msg, dom> => program(locationToMessage, init(flags), update, view, subscriptions)

  return { program, programWithFlags, push }
}
