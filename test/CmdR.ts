import * as assert from 'assert'
import { identity } from 'fp-ts/lib/function'
import { cmdr, CmdR } from '../src/CmdR'

describe('Cmd', () => {
  describe('Functor', () => {
    it('identity', async () => {
      const fa = cmdr.of(123)
      const fb = cmdr.map(fa, identity)

      const oa = await fa({}).toPromise()
      const ob = await fb({}).toPromise()

      const ta = await oa()
      const tb = await ob()

      assert.deepStrictEqual(ta, tb)
    })

    it('composition', async () => {
      const fa = cmdr.of(123)

      const ab = (a: number): number => a + 1
      const bc = (b: number): string => 'test' + b

      const oa = await cmdr.map(fa, a => bc(ab(a)))({}).toPromise()
      const ob = await cmdr.map(cmdr.map(fa, ab), bc)({}).toPromise()

      const ta = await oa()
      const tb = await ob()

      assert.deepStrictEqual(ta, tb)
    })
  })

  describe('Chain', () => {
    it('associativity', async () => {
      const fa = cmdr.of(123)
      const afb = (a: number): CmdR<{}, number> => cmdr.of(a + 1)
      const bfc = (a: number): CmdR<{}, string> => cmdr.of('test' + a)

      const oa = await cmdr.chain(cmdr.chain(fa, afb), bfc)({}).toPromise()
      const ob = await cmdr.chain(fa, a => cmdr.chain(afb(a), bfc))({}).toPromise()

      const ta = await oa()
      const tb = await ob()

      assert.deepStrictEqual(ta, tb)
    })
  })

  describe('Monad', () => {
    it('left identity', async () => {
      const f = (a: number): CmdR<{}, string> => cmdr.of('test' + a)

      const oa = await cmdr.chain(cmdr.of(123), f)({}).toPromise()
      const ob = await f(123)({}).toPromise()

      const ta = await oa()
      const tb = await ob()

      assert.deepStrictEqual(ta, tb)
    })

    it('right identity', async () => {
      const fa = cmdr.of(123)

      const oa = await cmdr.chain(fa, cmdr.of)({}).toPromise()
      const ob = await fa({}).toPromise()

      const ta = await oa()
      const tb = await ob()

      assert.deepStrictEqual(ta, tb)
    })

    describe('derive map', () => {
      const map = <A, B>(fa: CmdR<{}, A>, f: (a: A) => B) => cmdr.chain(fa, a => cmdr.of(f(a)))

      it('identity', async () => {
        const fa = cmdr.of(123)
        const fb = map(fa, identity)

        const oa = await fa({}).toPromise()
        const ob = await fb({}).toPromise()

        const ta = await oa()
        const tb = await ob()

        assert.deepStrictEqual(ta, tb)
      })

      it('composition', async () => {
        const fa = cmdr.of(123)

        const ab = (a: number): number => a + 1
        const bc = (b: number): string => 'test' + b

        const oa = await map(fa, a => bc(ab(a)))({}).toPromise()
        const ob = await map(map(fa, ab), bc)({}).toPromise()

        const ta = await oa()
        const tb = await ob()

        assert.deepStrictEqual(ta, tb)
      })
    })
  })
})
