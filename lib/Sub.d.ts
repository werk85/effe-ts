import { Observable } from 'rxjs';
import * as Rr from 'fp-ts/lib/Reader';
import { Monoid } from 'fp-ts/lib/Monoid';
import { Monad3 } from 'fp-ts/lib/Monad';
import { Profunctor3 } from 'fp-ts/lib/Profunctor';
import * as RO from 'fp-ts-rxjs/lib/ReaderObservable';
declare module 'fp-ts/lib/HKT' {
    interface URItoKind3<R, E, A> {
        'effe-ts/Sub': Sub<R, E, A>;
    }
}
export declare const URI = "effe-ts/Sub";
export declare type URI = typeof URI;
export interface Sub<R, Model, Action> extends Rr.Reader<Observable<Model>, RO.ReaderObservable<R, Action>> {
}
export declare function fromObservable<R, Model, Action>(actions$: Observable<Action>): Sub<R, Model, Action>;
export declare function fromCmd<R, Model, Action>(cmd: RO.ReaderObservable<R, Action>): Sub<R, Model, Action>;
export declare const none: Sub<unknown, unknown, never>;
export declare function getMonoid<R, Model, Action>(): Monoid<Sub<R, Model, Action>>;
export declare const sub: Profunctor3<URI> & Monad3<URI>;
declare const ap: <R, E, A>(fa: Sub<R, E, A>) => <B>(fab: Sub<R, E, (a: A) => B>) => Sub<R, E, B>, apFirst: <R, E, B>(fb: Sub<R, E, B>) => <A>(fa: Sub<R, E, A>) => Sub<R, E, A>, apSecond: <R, E, B>(fb: Sub<R, E, B>) => <A>(fa: Sub<R, E, A>) => Sub<R, E, B>, chain: <R, E, A, B>(f: (a: A) => Sub<R, E, B>) => (ma: Sub<R, E, A>) => Sub<R, E, B>, map: <A, B>(f: (a: A) => B) => <R, E>(fa: Sub<R, E, A>) => Sub<R, E, B>, chainFirst: <R, E, A, B>(f: (a: A) => Sub<R, E, B>) => (ma: Sub<R, E, A>) => Sub<R, E, A>, flatten: <R, E, A>(mma: Sub<R, E, Sub<R, E, A>>) => Sub<R, E, A>, promap: <R, E, A, D, B>(f: (d: D) => E, g: (a: A) => B) => (fbc: Sub<R, E, A>) => Sub<R, D, B>;
export { ap, apFirst, apSecond, chain, chainFirst, flatten, map, promap };
