import { unionize, MultiValueRec, ofType, UnionOf, UnionTypes } from 'unionize'

export const withPayload = <P>() => ofType<P>()

export type ActionOf<U extends UnionTypes<any, any>> = UnionOf<U>

export const create = <Record extends MultiValueRec<'type'>>(record: Record) =>
  unionize(record, { tag: 'type', value: 'payload' })
