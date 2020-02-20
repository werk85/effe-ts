import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import * as TE from 'fp-ts/lib/TaskEither';
import * as t from 'io-ts';
import * as E from 'fp-ts/lib/Either';
import * as O from 'fp-ts/lib/Option';
import { IORef } from 'fp-ts/lib/IORef';
import { ReaderObservable } from 'fp-ts-rxjs/lib/ReaderObservable';
export declare const StorageError: import("ts-union").UnionObj<{
    NativeError: import("ts-union").Of<[Error]>;
    ValidationErrors: import("ts-union").Of<[t.Errors, unknown]>;
}>;
export declare type StorageError = typeof StorageError.T;
export interface StorageEntity<A> {
    key: string;
    type: t.Type<A, unknown>;
}
export declare const entity: <A>(key: string, type: t.Type<A, unknown, unknown>) => StorageEntity<A>;
export interface Storage {
    get(key: string): TE.TaskEither<Error, O.Option<unknown>>;
    set(key: string, value: unknown): TE.TaskEither<Error, void>;
    remove(key: string): TE.TaskEither<Error, void>;
}
export declare const localStorage: Storage;
export declare function memoryStorage(store?: IORef<Record<string, unknown>>): Storage;
export interface StorageEnv {
    storage: Storage;
}
export declare const get: <Env extends StorageEnv, A>(entity: StorageEntity<A>) => RTE.ReaderTaskEither<Env, import("ts-union").UnionVal<{
    NativeError: import("ts-union").Of<[Error]>;
    ValidationErrors: import("ts-union").Of<[t.Errors, unknown]>;
}>, O.Option<A>>;
export declare const set: <Env extends StorageEnv, A>(entity: StorageEntity<A>) => (value: A) => RTE.ReaderTaskEither<Env, import("ts-union").UnionVal<{
    NativeError: import("ts-union").Of<[Error]>;
    ValidationErrors: import("ts-union").Of<[t.Errors, unknown]>;
}>, void>;
export declare const remove: <Env extends StorageEnv, A>(entity: StorageEntity<A>) => RTE.ReaderTaskEither<Env, import("ts-union").UnionVal<{
    NativeError: import("ts-union").Of<[Error]>;
    ValidationErrors: import("ts-union").Of<[t.Errors, unknown]>;
}>, void>;
export declare const load: <Env extends StorageEnv, A, Action>(entity: StorageEntity<A>, f: (e: E.Either<import("ts-union").UnionVal<{
    NativeError: import("ts-union").Of<[Error]>;
    ValidationErrors: import("ts-union").Of<[t.Errors, unknown]>;
}>, O.Option<A>>) => Action) => ReaderObservable<Env, Action>;
export declare const save: <Env extends StorageEnv, A>(entity: StorageEntity<A>) => (value: A) => ReaderObservable<Env, never>;
export declare const purge: <Env extends StorageEnv, A>(entity: StorageEntity<A>) => ReaderObservable<Env, never>;
