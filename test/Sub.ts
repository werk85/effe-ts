import { sub } from '../src/Sub'
import { identity } from 'fp-ts/lib/function'
import * as assert from 'assert'
import { EMPTY } from 'rxjs'

describe('Sub', () => {
  describe('Functor', () => {
    it('identity', async () => {
      const fa = sub.of(123)
      const fb = sub.map(fa, identity)

      const oa = await fa(EMPTY).toPromise()
      const ob = await fb(EMPTY).toPromise()

      assert.deepStrictEqual(oa, ob)
    })

    it('composition', async () => {
      const fa = sub.of(123)

      const ab = (a: number): number => a + 1
      const bc = (b: number): string => 'test' + b

      const oa = await sub.map(fa, a => bc(ab(a)))(EMPTY).toPromise()
      const ob = await sub.map(sub.map(fa, ab), bc)(EMPTY).toPromise()


      assert.deepStrictEqual(oa, ob)
    })
  })
})