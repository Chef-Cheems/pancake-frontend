import { Token, ChainId } from '@pancakeswap/sdk'
import getLpAddress from 'utils/getLpAddress'

const CAKE_AS_STRING = '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82'
const BUSD_AS_STRING = '0xe9e7cea3dedca5984780bafc599bd69add087d56'
const CAKE_AS_TOKEN = new Token(ChainId.MAINNET, CAKE_AS_STRING, 18)
const BUSD_AS_TOKEN = new Token(ChainId.MAINNET, BUSD_AS_STRING, 18)
const CAKE_BUSD_LP = '0x804678fa97d91B974ec2af3c843270886528a9E6'

describe('getLpAddress', () => {
  it('returns correct LP address, both tokens are strings', () => {
    expect(getLpAddress(CAKE_AS_STRING, BUSD_AS_STRING)).toBe(CAKE_BUSD_LP)
  })
  it('returns correct LP address, token1 is string, token 2 is Token', () => {
    expect(getLpAddress(CAKE_AS_STRING, BUSD_AS_TOKEN)).toBe(CAKE_BUSD_LP)
  })
  it('returns correct LP address, both tokens are Token', () => {
    expect(getLpAddress(CAKE_AS_TOKEN, BUSD_AS_TOKEN)).toBe(CAKE_BUSD_LP)
  })
})
