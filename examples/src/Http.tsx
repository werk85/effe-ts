import { Lens } from 'monocle-ts'
import * as t from 'io-ts'
import * as O from 'fp-ts/lib/Option'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import { cmdr, http, html, stater, platform } from 'effe-ts'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

export type Result = E.Either<http.HttpErrorResponse, string>

export type MorePlease = { type: 'MorePlease' }
export type NewGif = { type: 'NewGif'; result: Result }

export type Action = MorePlease | NewGif

export interface Model {
  topic: string
  gifUrl: O.Option<Result>
}

export interface Env extends http.HttpEnv {
  topic: string
}

const gifUrlLens = Lens.fromProp<Model>()('gifUrl')

const ApiPayloadSchema = t.interface({
  data: t.interface({
    image_url: t.string
  })
})

function newGif(result: Result): NewGif {
  return { type: 'NewGif', result }
}

const getRandomGif: cmdr.CmdR<Env, Action> = cmdr.env(env => {
  const url = `https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${env.topic}`
  return http.send(http.get(url, ApiPayloadSchema), e =>
    newGif(
      pipe(
        e,
        E.map(a => a.body.data.image_url)
      )
    )
  )
})

export function init(env: Env): stater.StateR<Env, Model, Action> {
  return [
    {
      topic: env.topic,
      gifUrl: O.none
    },
    getRandomGif
  ]
}

export function update(msg: Action, model: Model): stater.StateR<Env, Model, Action> {
  switch (msg.type) {
    case 'MorePlease':
      return [gifUrlLens.set(O.none)(model), getRandomGif]
    case 'NewGif':
      return [gifUrlLens.set(O.some(msg.result))(model), cmdr.none]
  }
}

export const view = (model: Model) => (dispatch: platform.Dispatch<Action>) => (
  <div>
    <h2>{model.topic}</h2>
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

export const app = html.programR(init, update, view)

html.run(app, dom => ReactDOM.render(dom, document.getElementById('app')!), {
  topic: 'cats',
  http: http.fetch
})
