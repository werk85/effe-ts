import { Lens, Prism } from 'monocle-ts'
import * as t from 'io-ts'
import * as O from 'fp-ts/lib/Option'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import { cmd, http, html, state } from 'effe-ts'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { flow } from 'fp-ts/lib/function'

export type Result = E.Either<http.HttpErrorResponse, string>

export type MorePlease = { type: 'MorePlease' }
export type NewGif = { type: 'NewGif'; result: Result }
export type Topic = { type: 'Topic'; topic: string }

export type Action = MorePlease | NewGif | Topic

export interface Model {
  topic: O.Option<string>
  gifUrl: O.Option<Result>
}

const gifUrlLens = Lens.fromProp<Model>()('gifUrl')
const topicLens = Lens.fromProp<Model>()('topic')
const topicOptional = topicLens.composePrism(Prism.some())

export interface Env extends http.HttpEnv {
  topic: string
}

export const monoidCmd = cmd.getMonoid<Env, Action>()

const ApiPayloadSchema = t.interface({
  data: t.interface({
    image_url: t.string
  })
})

function newGif(result: Result): NewGif {
  return { type: 'NewGif', result }
}

function getRandomGif(topic: string): cmd.Cmd<Env, Action> {
  const url = `https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${topic}`
  return http.send(
    http.get(url, ApiPayloadSchema),
    flow(
      E.map(a => a.body.data.image_url),
      newGif
    )
  )
}

const getTopic: cmd.Cmd<Env, Action> = cmd.fromReader(env => ({ type: 'Topic', topic: env.topic }))

export const init: state.State<Env, Model, Action> = [
  {
    topic: O.none,
    gifUrl: O.none
  },
  getTopic
]

export const update = (action: Action) => (model: Model): state.State<Env, Model, Action> => {
  switch (action.type) {
    case 'MorePlease':
      return [pipe(model, gifUrlLens.set(O.none)), pipe(model, topicLens.get, O.foldMap(monoidCmd)(getRandomGif))]
    case 'NewGif':
      return pipe(model, gifUrlLens.set(O.some(action.result)), state.of)
    case 'Topic':
      return [pipe(model, topicLens.set(O.some(action.topic))), getRandomGif(action.topic)]
  }
}

export function view(model: Model): html.Html<JSX.Element, Action> {
  return dispatch => (
    <div>
      <h2>
        {pipe(
          model,
          topicOptional.getOption,
          O.getOrElse(() => 'No Topic')
        )}
      </h2>
      {pipe(
        model.gifUrl,
        O.fold(
          () => <span>loading...</span>,
          e =>
            pipe(
              e,
              E.fold(
                error => <span>Error: {error}</span>,
                gifUrl => <img src={gifUrl} />
              )
            )
        )
      )}
      <button onClick={() => dispatch({ type: 'MorePlease' })}>New Gif</button>
    </div>
  )
}

export const app = html.program(init, update, view)

html.run(app, dom => ReactDOM.render(dom, document.getElementById('app')!), {
  topic: 'cats',
  http: http.mkFetch()
})
