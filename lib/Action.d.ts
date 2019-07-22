import { UnionOf, UnionTypes } from 'unionize';
export declare const withPayload: <P>() => P;
export declare type ActionOf<U extends UnionTypes<any, any>> = UnionOf<U>;
export declare const create: <Record_1 extends import("unionize").NoDefaultRec<{
    [tag: string]: any;
} & {
    type?: undefined;
}>>(record: Record_1) => import("unionize").Unionized<Record_1, import("unionize").SingleValueVariants<Record_1, "type", "payload">, "type">;
