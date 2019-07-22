import { Monoid } from 'fp-ts/lib/Monoid';
import * as T from 'fp-ts/es6/Task';
import { Observable } from 'rxjs';
import * as O from 'fp-ts/es6/Option';
import { Applicative1 } from 'fp-ts/lib/Applicative';
import * as E from 'fp-ts/lib/Either';
declare module 'fp-ts/lib/HKT' {
    interface URItoKind<A> {
        'effe-ts/Cmd': Cmd<A>;
    }
}
export declare const URI = "effe-ts/Cmd";
export declare type URI = typeof URI;
export declare type Cmd<Action> = Observable<T.Task<O.Option<Action>>>;
export declare const none: Cmd<never>;
export declare const of: <Action>(a: Action) => Observable<T.Task<O.Option<Action>>>;
export declare const getMonoid: <A>() => Monoid<Observable<T.Task<O.Option<A>>>>;
export declare const perform: <A, Action>(task: T.Task<A>, f: (a: A) => Action) => Observable<T.Task<O.Option<Action>>>;
export declare const attempt: <L, A, Action>(task: T.Task<E.Either<L, A>>, f: (e: E.Either<L, A>) => Action) => Observable<T.Task<O.Option<Action>>>;
export declare const cmd: Applicative1<URI>;
declare const ap: <A>(fa: Observable<T.Task<O.Option<A>>>) => <B>(fab: Observable<T.Task<O.Option<(a: A) => B>>>) => Observable<T.Task<O.Option<B>>>, apFirst: <B>(fb: Observable<T.Task<O.Option<B>>>) => <A>(fa: Observable<T.Task<O.Option<A>>>) => Observable<T.Task<O.Option<A>>>, apSecond: <B>(fb: Observable<T.Task<O.Option<B>>>) => <A>(fa: Observable<T.Task<O.Option<A>>>) => Observable<T.Task<O.Option<B>>>, map: <A, B>(f: (a: A) => B) => (fa: Observable<T.Task<O.Option<A>>>) => Observable<T.Task<O.Option<B>>>;
export { ap, apFirst, apSecond, map };
