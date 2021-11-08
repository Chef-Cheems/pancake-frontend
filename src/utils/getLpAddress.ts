import { Token, Pair, ChainId } from '@pancakeswap/sdk'

const getLpAddress = (token1: string | Token, token2: string | Token) => {
  let token1AsTokenInstance = token1
  let token2AsTokenInstance = token2
  if (typeof token1 === 'string' || token1 instanceof String) {
    token1AsTokenInstance = new Token(ChainId.MAINNET, token1 as string, 18)
  }
  if (typeof token2 === 'string' || token2 instanceof String) {
    token2AsTokenInstance = new Token(ChainId.MAINNET, token2 as string, 18)
  }
  return Pair.getAddress(token1AsTokenInstance as Token, token2AsTokenInstance as Token)
}

export default getLpAddress
