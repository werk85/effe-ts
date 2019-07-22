import { interval } from 'rxjs'
import * as T from 'fp-ts/lib/Task'
import { pipe } from 'fp-ts/lib/pipeable'
import * as Rx from 'rxjs/operators'
import { Sub } from './Sub'

export const now: T.Task<number> = async () => new Date().getTime()

export const every = <Action>(time: number, f: (time: number) => Action): Sub<Action> =>
  pipe(
    interval(time),
    Rx.map(() => f(new Date().getTime()))
  )
