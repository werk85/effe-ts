import * as T from 'fp-ts/lib/Task';
export declare const now: T.Task<number>;
export declare const every: <Action>(time: number, f: (time: number) => Action) => import("rxjs").Observable<Action>;
