import { getMonoid, State } from '../src/State'
import { monoidString } from 'fp-ts/lib/Monoid'
import * as assert from 'assert'
import { of } from 'fp-ts-rxjs/lib/ReaderObservable'

describe('State', () => {
  describe('Semigroup', () => {
    it('associativity', async () => {
      const S = getMonoid<{}, string, string>(monoidString)
      const x: State<{}, string, string> = ['model1', of('action1')]
      const y: State<{}, string, string> = ['model2', of('action2')]
      const z: State<{}, string, string> = ['model3', of('action3')]
      const [m1, c1] = S.concat(S.concat(x, y), z)
      const [m2, c2] = S.concat(x, S.concat(y, z))

      assert.deepStrictEqual(m1, m2)
      assert.deepStrictEqual(await c1({}).toPromise(), await c2({}).toPromise())
    })
  })
})