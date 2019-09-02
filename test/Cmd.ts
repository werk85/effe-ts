import * as assert from 'assert'
import { identity } from 'fp-ts/lib/function'
import { cmd, Cmd } from '../src/Cmd'

describe('Cmd', () => {
  describe('Functor', () => {
    it('identity', async () => {
      const fa = cmd.of(123)
      const fb = cmd.map(fa, identity)

      const oa = await fa.toPromise()
      const ob = await fb.toPromise()

      const ta = await oa()
      const tb = await ob()

      assert.deepStrictEqual(ta, tb)
    })

    it('composition', async () => {
      const fa = cmd.of(123)

      const ab = (a: number): number => a + 1
      const bc = (b: number): string => 'test' + b

      const oa = await cmd.map(fa, a => bc(ab(a))).toPromise()
      const ob = await cmd.map(cmd.map(fa, ab), bc).toPromise()

      const ta = await oa()
      const tb = await ob()

      assert.deepStrictEqual(ta, tb)
    })
  })

  describe('Chain', () => {
    it('associativity', async () => {
      const fa = cmd.of(123)
      const afb = (a: number): Cmd<number> => cmd.of(a + 1)
      const bfc = (a: number): Cmd<string> => cmd.of('test' + a)

      const oa = await cmd.chain(cmd.chain(fa, afb), bfc).toPromise()
      const ob = await cmd.chain(fa, a => cmd.chain(afb(a), bfc)).toPromise()

      const ta = await oa()
      const tb = await ob()

      assert.deepStrictEqual(ta, tb)
    })
  })

  describe('Monad', () => {
    it('left identity', async () => {
      const f = (a: number): Cmd<string> => cmd.of('test' + a)

      const oa = await cmd.chain(cmd.of(123), f).toPromise()
      const ob = await f(123).toPromise()

      const ta = await oa()
      const tb = await ob()

      assert.deepStrictEqual(ta, tb)
    })

    it('right identity', async () => {
      const fa = cmd.of(123)

      const oa = await cmd.chain(fa, cmd.of).toPromise()
      const ob = await fa.toPromise()

      const ta = await oa()
      const tb = await ob()

      assert.deepStrictEqual(ta, tb)
    })

    describe('derive map', () => {
      const map = <A, B>(fa: Cmd<A>, f: (a: A) => B) => cmd.chain(fa, a => cmd.of(f(a)))

      it('identity', async () => {
        const fa = cmd.of(123)
        const fb = map(fa, identity)

        const oa = await fa.toPromise()
        const ob = await fb.toPromise()

        const ta = await oa()
        const tb = await ob()

        assert.deepStrictEqual(ta, tb)
      })

      it('composition', async () => {
        const fa = cmd.of(123)

        const ab = (a: number): number => a + 1
        const bc = (b: number): string => 'test' + b

        const oa = await map(fa, a => bc(ab(a))).toPromise()
        const ob = await map(map(fa, ab), bc).toPromise()

        const ta = await oa()
        const tb = await ob()

        assert.deepStrictEqual(ta, tb)
      })
    })
  })
})
