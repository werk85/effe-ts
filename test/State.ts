import * as assert from 'assert'
import { of } from 'fp-ts-rxjs/lib/ReaderObservable'
import { pipe } from 'fp-ts/lib/function'
import * as s from 'fp-ts/lib/string'
import * as _ from '../src/State'

describe('State', () => {
  describe('Semigroup', () => {
    it('associativity', async () => {
      const S = _.getMonoid<unknown, string, string>(s.Monoid)
      const x: _.State<unknown, string, string> = ['model1', of('action1')]
      const y: _.State<unknown, string, string> = ['model2', of('action2')]
      const z: _.State<unknown, string, string> = ['model3', of('action3')]
      const [m1, c1] = S.concat(S.concat(x, y), z)
      const [m2, c2] = S.concat(x, S.concat(y, z))

      assert.deepStrictEqual(m1, m2)
      assert.deepStrictEqual(await c1({}).toPromise(), await c2({}).toPromise())
    })
  })

  it('Do', () => {
    assert.deepStrictEqual(
      pipe(
        _.of('abc'),
        _.bindTo('a'),
        _.bind('b', () => _.of(123)),
        _.model
      ),
      {
        a: 'abc',
        b: 123
      }
    )
    assert.deepStrictEqual(
      pipe(
        _.Do,
        _.bind('a', () => _.of('abc')),
        _.bind('b', () => _.of(123)),
        _.model
      ),
      {
        a: 'abc',
        b: 123
      }
    )
  })
})
