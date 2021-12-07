import { interval } from 'rxjs'
import * as T from 'fp-ts/lib/Task'
import { pipe } from 'fp-ts/lib/function'
import * as R from 'fp-ts-rxjs/lib/Observable'
import * as sub from './Sub'

export const now: T.Task<number> = async () => new Date().getTime()

export function every<R, Model, Action>(time: number, f: (time: number) => Action): sub.Sub<R, Model, Action> {
  return pipe(
    interval(time),
    R.map(() => f(new Date().getTime())),
    sub.fromObservable
  )
}
