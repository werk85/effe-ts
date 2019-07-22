import { Observable } from 'rxjs';
export declare type Sub<Action> = Observable<Action>;
export declare function map<A, Action>(sub: Sub<A>, f: (a: A) => Action): Sub<Action>;
export declare function batch<Action>(arr: Sub<Action>[]): Sub<Action>;
export declare const none: Sub<never>;
