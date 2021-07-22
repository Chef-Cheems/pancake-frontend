import { FarmAuctionBidderConfig } from './types'

export const whitelistedBidders: FarmAuctionBidderConfig[] = [
  {
    account: '0x60D1ce4D691F9017613807267d1c487aEeCA3024',
    farmName: 'ONE-BNB',
    tokenName: 'ONE Token',
    projectSite: 'http://one.com',
    lpAddress: '0x1234567890abcdef',
  },
  {
    account: '0x44f61D990aBfeA0E62C26b8bB37921BF06649C13',
    farmName: 'TWO-BNB',
    tokenName: 'TWO Token',
    projectSite: 'http://two.com',
    lpAddress: '0x1234567890abcdef',
  },
  {
    account: '0x54A6a40b9EBaa560049ca3083Cdfa01EB9337263',
    farmName: 'THREE-BNB',
    tokenName: 'THREE Token',
    projectSite: 'http://three.com',
    lpAddress: '0x1234567890abcdef',
  },
  {
    account: '0x4a0501420124F3F81552D0d1d0A6B33dC7678c90',
    farmName: 'FOUR-BNB',
    tokenName: 'FOUR Token',
    projectSite: 'http://four.com',
    lpAddress: '0x1234567890abcdef',
  },
  {
    account: '0xF4b5B741D9a9A5F40A3F3495341A262B137B6387',
    farmName: 'FIVE-BNB',
    tokenName: 'FIVE Token',
    projectSite: 'http://five.com',
    lpAddress: '0x1234567890abcdef',
  },
  {
    account: '0xE43e2Bc66dD0D5E98A821dc2C33C7Ae49292861f',
    farmName: 'SIX-BNB',
    tokenName: 'SIX Token',
    projectSite: 'http://six.com',
    lpAddress: '0x1234567890abcdef',
  },
  {
    account: '0xd784f37613b7383e5ff774208C6b8036d6a05901',
    farmName: 'SEVEN-BNB',
    tokenName: 'SEVEN Token',
    projectSite: 'http://seven.com',
    lpAddress: '0x1234567890abcdef',
  },
  {
    account: '0xB0e01257Bc66cAFFd98405a08FAF1aCcCE354206',
    farmName: 'EIGHT-BNB',
    tokenName: 'EIGHT Token',
    projectSite: 'http://eight.com',
    lpAddress: '0x1234567890abcdef',
  },
  {
    account: '0xB9b4B2927fe18BC908217Fd35519C766AcFddE7A',
    farmName: 'NINE-BNB',
    tokenName: 'NINE Token',
    projectSite: 'http://nine.com',
    lpAddress: '0x1234567890abcdef',
  },
  {
    account: '0xb09E219b2DEb3D3665858a85A30917CE42049FeF',
    farmName: 'TEN-BNB',
    tokenName: 'TEN Token',
    projectSite: 'http://ten.com',
    lpAddress: '0x1234567890abcdef',
  },
  {
    account: '0x37CE833313473c7518C750fFF90b21073C07Fe0b',
    farmName: 'ELEVEN-BNB',
    tokenName: 'ELEVEN Token',
    projectSite: 'http://eleven.com',
    lpAddress: '0x1234567890abcdef',
  },
]

const UNKNOWN_BIDDER: FarmAuctionBidderConfig = {
  account: '',
  farmName: 'Unknown',
  tokenName: 'Unknown',
}

export const getBidderInfo = (account: string): FarmAuctionBidderConfig => {
  const matchingBidder = whitelistedBidders.find((bidder) => bidder.account === account)
  if (matchingBidder) {
    return matchingBidder
  }
  return { ...UNKNOWN_BIDDER, account }
}
