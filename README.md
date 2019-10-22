# effe-ts

Fork of [elm-ts](https://github.com/gcanti/elm-ts). Effe is the german word for elm.

## Install

```
yarn add effe-ts
```

## Usage

Counter example

```tsx
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { html, cmd, platform, state } from 'effe-ts'

type Action = { type: 'Increase' } | { type: 'Decrease' }

type Model = number

const init: state.State<Model> = state.of(0)

const update = (action: Action, model: Model): state.State<Model> => {
  switch (action.type) {
    case 'Increase':
      return state.of(model + 1)
    case 'Decrease':
      return state.of(model - 1)
  }
}

const view = (model: Model) => (dispatch: platform.Dispatch<Action>) => (
  <>
    <span>Counter: {model}</span>
    <button onClick={() => dispatch({ type: 'Increase' })}>+</button>
    <button onClick={() => dispatch({ type: 'Decrease' })}>-</button>
  </>
)

const app = html.program(init, update, view)

html.run(app, dom => {
  ReactDOM.render(dom, document.getElementById('app'))
})
```

## Further resources

 * [react-todo-app](https://github.com/werk85/react-todo-app)