import * as T from 'fp-ts/lib/Task';
import * as sub from './Sub';
export declare const now: T.Task<number>;
export declare function every<R, Model, Action>(time: number, f: (time: number) => Action): sub.Sub<R, Model, Action>;
