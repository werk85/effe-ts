import { Observable, merge, EMPTY } from 'rxjs'
import * as Rx from 'rxjs/operators'

export type Sub<Action> = Observable<Action>

export function map<A, Action>(sub: Sub<A>, f: (a: A) => Action): Sub<Action> {
  return Rx.map(f)(sub)
}

export function batch<Action>(arr: Sub<Action>[]): Sub<Action> {
  return merge(...arr)
}

export const none: Sub<never> = EMPTY
