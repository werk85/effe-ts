import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { html, state } from 'effe-ts'

type Action = { type: 'Increase' } | { type: 'Decrease' }

type Model = number

interface State extends state.State<{}, Model> {}

const init: State = state.of(0)

const update = (action: Action) => (model: Model): State => {
  switch (action.type) {
    case 'Increase':
      return state.of(model + 1)
    case 'Decrease':
      return state.of(model - 1)
  }
}

function view(model: Model): html.Html<JSX.Element, Action> {
  return dispatch => (
    <>
      <span>Counter: {model}</span>
      <button onClick={() => dispatch({ type: 'Increase' })}>+</button>
      <button onClick={() => dispatch({ type: 'Decrease' })}>-</button>
    </>
  )
}

const app = html.program(init, update, view)

html.run(app, dom => ReactDOM.render(dom, document.getElementById('app')!), {})
