import { interval } from 'rxjs'
import * as T from 'fp-ts/lib/Task'
import { pipe } from 'fp-ts/lib/pipeable'
import * as Rx from 'rxjs/operators'
import * as sub from './Sub'

export const now: T.Task<number> = async () => new Date().getTime()

export function every<Model, Action>(time: number, f: (time: number) => Action): sub.Sub<Model, Action> {
  return sub.fromObservable(
    pipe(
      interval(time),
      Rx.map(() => f(new Date().getTime()))
    )
  )
}
