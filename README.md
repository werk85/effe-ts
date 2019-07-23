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
import { html, cmd, platform } from 'effe-ts'

type Action = { type: 'Increase' } | { type: 'Decrease' }

type Model = number

const init: [Model, cmd.Cmd<Action>] = [0, cmd.none]

const update = (action: Action, model: Model) => {
  switch (action.type) {
    case 'Increase':
      return [model + 1, cmd.none]
    case 'Decrease':
      return [model - 1, cmd.none]
  }
}

const view = (model: Model) => (dispatch: platform.Dispatch<Action>) => (
  <>
    <p>{model}</p>
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