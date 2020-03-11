# effe-ts

Fork of [elm-ts](https://github.com/gcanti/elm-ts). Effe is the german word for elm.

## Install

```
yarn add effe-ts
```

## Usage

### Counter example

```tsx
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
```

### Further examples

 * [effe-ts-starter](https://github.com/werk85/effe-ts-starter) - Starter Project that conatins Routing and Bootstrap.
 * [react-todo-app](https://github.com/werk85/react-todo-app) - Example TODO application with live sync between multiple browser instances via CouchDB
 * [Http Request Example](https://github.com/werk85/examples/src/Http.tsx)
