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
import { action, html, cmd, platform } from 'effe-ts'

const Action = action.create({
  Increase: {},
  Decrease: {}
})
type Action = action.ActionOf<typeof Action>

type Model = number

const init: [Model, cmd.Cmd<Action>] = [0, cmd.none]

const update = (action: Action, model: Model) => [
  Action.match(action, {
    Increase: () => model + 1,
    Decrease: () => model - 1
  }),
  cmd.none
]

const view = (model: Model) => (dispatch: platform.Dispatch<Action>) => (
  <>
    <p>{model}</p>
    <button onClick={() => dispatch(Action.Increase())}>+</button>
    <button onClick={() => dispatch(Action.Decrease())}>-</button>
  </>
)

const app = html.program(init, update, view)

html.run(app, dom => {
  ReactDOM.render(dom, document.getElementById('app'))
})
```

## Further resources

 * [react-todo-app](https://github.com/werk85/react-todo-app)