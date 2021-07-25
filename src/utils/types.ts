import ethers, { Contract, ContractFunction } from 'ethers'

export type MultiCallResponse<T> = T | null

// Predictions
export type PredictionsClaimableResponse = boolean

export interface PredictionsLedgerResponse {
  position: 0 | 1
  amount: ethers.BigNumber
  claimed: boolean
}

export type PredictionsRefundableResponse = boolean

export interface PredictionsRoundsResponse {
  epoch: ethers.BigNumber
  startBlock: ethers.BigNumber
  lockBlock: ethers.BigNumber
  endBlock: ethers.BigNumber
  lockPrice: ethers.BigNumber
  closePrice: ethers.BigNumber
  totalAmount: ethers.BigNumber
  bullAmount: ethers.BigNumber
  bearAmount: ethers.BigNumber
  rewardBaseCalAmount: ethers.BigNumber
  rewardAmount: ethers.BigNumber
  oracleCalled: boolean
}

export interface PredictionsContract extends Contract {
  claimable: ContractFunction<PredictionsClaimableResponse>
  ledger: ContractFunction<PredictionsLedgerResponse>
  refundable: ContractFunction<PredictionsRefundableResponse>
  rounds: ContractFunction<PredictionsRoundsResponse>
}

// Chainlink Orance
export type ChainLinkOracleLatestAnswerResponse = ethers.BigNumber

export interface ChainLinkOracleContract extends Contract {
  latestAnswer: ContractFunction<ChainLinkOracleLatestAnswerResponse>
}

// Farm Auction

type CurrentAuctionIdResponse = ethers.BigNumber

// Note: slightly different from AuctionStatus used thoughout UI
export enum FarmAuctionContractStatus {
  Pending,
  Open,
  Close,
}

export interface AuctionsResponse {
  status: FarmAuctionContractStatus
  startBlock: ethers.BigNumber
  endBlock: ethers.BigNumber
  initialBidAmount: ethers.BigNumber
  topLeaderboard: number
  leaderboardLimit: ethers.BigNumber
}

export interface GetBiddersPerAuctionResponse {
  account: string
  amount: ethers.BigNumber
}

type GetWhitelistedAddressesResponse = [
  {
    account: string
    lpToken: string
    token: string
  }[],
  ethers.BigNumber,
]

interface AuctionsHistoryResponse {
  totalAmount: ethers.BigNumber
  hasClaimed: boolean
}

export interface FarmAuctionContract extends Contract {
  currentAuctionId: ContractFunction<CurrentAuctionIdResponse>
  auctions: ContractFunction<AuctionsResponse>
  getBiddersPerAuction: ContractFunction<GetBiddersPerAuctionResponse[]>
  isWhitelisted: ContractFunction<boolean>
  getWhitelistedAddresses: ContractFunction<GetWhitelistedAddressesResponse>
  auctionsHistory: ContractFunction<AuctionsHistoryResponse>
}
