import * as assert from 'assert'
import { identity, pipe } from 'fp-ts/lib/function'
import { EMPTY } from 'rxjs'
import * as _ from '../src/Sub'

describe('Sub', () => {
  describe('Functor', () => {
    it('identity', async () => {
      const fa = _.of(123)
      const fb = _.Functor.map(fa, identity)

      const oa = await fa(EMPTY)({}).toPromise()
      const ob = await fb(EMPTY)({}).toPromise()

      assert.deepStrictEqual(oa, ob)
    })

    it('composition', async () => {
      const fa = _.of(123)

      const ab = (a: number): number => a + 1
      const bc = (b: number): string => 'test' + b

      const oa = await pipe(
        fa,
        _.map(a => bc(ab(a)))
      )(EMPTY)({}).toPromise()
      const ob = await pipe(pipe(fa, _.map(ab)), _.map(bc))(EMPTY)({}).toPromise()

      assert.deepStrictEqual(oa, ob)
    })
  })
})
