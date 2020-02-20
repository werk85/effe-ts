import { Either } from 'fp-ts/lib/Either';
import { ReaderTaskEither } from 'fp-ts/lib/ReaderTaskEither';
import { ReaderTask } from 'fp-ts/lib/ReaderTask';
import * as RO from 'fp-ts-rxjs/lib/ReaderObservable';
export interface Cmd<R, Action> extends RO.ReaderObservable<R, Action> {
}
export declare const none: Cmd<unknown, never>;
export declare function perform<R, A, Action>(task: ReaderTask<R, A>, f: (a: A) => Action): Cmd<R, Action>;
export declare function perform_<R, A>(task: ReaderTask<R, A>): Cmd<R, never>;
export declare function attempt<R, E, A, Action>(task: ReaderTaskEither<R, E, A>, f: (e: Either<E, A>) => Action): Cmd<R, Action>;
export declare const cmd: import("fp-ts/lib/Monad").Monad2<"ReaderObservable"> & import("fp-ts/lib/Alternative").Alternative2<"ReaderObservable"> & import("fp-ts/lib/Filterable").Filterable2<"ReaderObservable"> & import("fp-ts-rxjs/lib/MonadObservable").MonadObservable2<"ReaderObservable">;
export * from 'fp-ts-rxjs/lib/ReaderObservable';
