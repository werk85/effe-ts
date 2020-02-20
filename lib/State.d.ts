import { Bifunctor3 } from 'fp-ts/lib/Bifunctor';
import { Semigroupoid3 } from 'fp-ts/lib/Semigroupoid';
import { Comonad3 } from 'fp-ts/lib/Comonad';
import { Foldable3 } from 'fp-ts/lib/Foldable';
import { Traversable3 } from 'fp-ts/lib/Traversable';
import { Monad3 } from 'fp-ts/lib/Monad';
import { Monoid } from 'fp-ts/lib/Monoid';
import { Semigroup } from 'fp-ts/lib/Semigroup';
import * as RO from 'fp-ts-rxjs/lib/ReaderObservable';
declare module 'fp-ts/lib/HKT' {
    interface URItoKind3<R, E, A> {
        'effe-ts/State': State<R, A, E>;
    }
}
export declare const URI = "effe-ts/State";
export declare type URI = typeof URI;
export declare type State<R, Model, Action = never> = [Model, RO.ReaderObservable<R, Action>];
export declare const model: <R, Model>(state: State<R, Model, unknown>) => Model;
export declare const cmd: <R, Action>(state: State<R, unknown, Action>) => RO.ReaderObservable<R, Action>;
export declare const of: <R, Model, Action = never>(model: Model) => State<R, Model, Action>;
export declare function getSemigroup<R, Model, Action>(S: Semigroup<Model>): Semigroup<State<R, Model, Action>>;
export declare function getMonoid<R, Model, Action>(M: Monoid<Model>): Monoid<State<R, Model, Action>>;
export declare const state: Semigroupoid3<URI> & Bifunctor3<URI> & Comonad3<URI> & Foldable3<URI> & Traversable3<URI> & Monad3<URI>;
declare const ap: <R, E, A>(fa: State<R, A, E>) => <B>(fab: State<R, (a: A) => B, E>) => State<R, B, E>, apFirst: <R, E, B>(fb: State<R, B, E>) => <A>(fa: State<R, A, E>) => State<R, A, E>, apSecond: <R, E, B>(fb: State<R, B, E>) => <A>(fa: State<R, A, E>) => State<R, B, E>, bimap: <E, G, A, B>(f: (e: E) => G, g: (a: A) => B) => <R>(fa: State<R, A, E>) => State<R, B, G>, chain: <R, E, A, B>(f: (a: A) => State<R, B, E>) => (ma: State<R, A, E>) => State<R, B, E>, chainFirst: <R, E, A, B>(f: (a: A) => State<R, B, E>) => (ma: State<R, A, E>) => State<R, A, E>, compose: <R, E, A>(la: State<R, A, E>) => <B>(ab: State<R, B, A>) => State<R, B, E>, duplicate: <R, E, A>(ma: State<R, A, E>) => State<R, State<R, A, E>, E>, extend: <R, E, A, B>(f: (fa: State<R, A, E>) => B) => (ma: State<R, A, E>) => State<R, B, E>, flatten: <R, E, A>(mma: State<R, State<R, A, E>, E>) => State<R, A, E>, foldMap: <M>(M: Monoid<M>) => <A>(f: (a: A) => M) => <R, E>(fa: State<R, A, E>) => M, map: <A, B>(f: (a: A) => B) => <R, E>(fa: State<R, A, E>) => State<R, B, E>, mapLeft: <E, G>(f: (e: E) => G) => <R, A>(fa: State<R, A, E>) => State<R, A, G>, reduce: <A, B>(b: B, f: (b: B, a: A) => B) => <R, E>(fa: State<R, A, E>) => B, reduceRight: <A, B>(b: B, f: (a: A, b: B) => B) => <R, E>(fa: State<R, A, E>) => B;
export { ap, apFirst, apSecond, bimap, chain, chainFirst, compose, duplicate, extend, flatten, foldMap, map, mapLeft, reduce, reduceRight };
