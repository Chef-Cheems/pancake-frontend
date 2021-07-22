import { toDate, add, hoursToSeconds, intervalToDuration } from 'date-fns'
import { BSC_BLOCK_TIME, DEFAULT_TOKEN_DECIMAL } from 'config'
import { getBidderInfo } from 'config/constants/farmAuctions'
import { formatBigNumberToFixed } from 'utils/formatBalance'
import { simpleRpcProvider } from 'utils/providers'
import { AuctionsResponse, FarmAuctionContractStatus, GetBiddersPerAuctionResponse } from 'utils/types'
import { Auction, AuctionStatus } from 'config/constants/types'
import { ethersToBigNumber } from 'utils/bigNumber'

export const FORM_ADDRESS =
  'https://docs.google.com/forms/d/e/1FAIpQLScUkwbsMWwg7L5jjGjEcmv6RsoCNhFDkV3xEpRu2KcJrr47Sw/viewform'

export const sortAuctionBidders = (bidders: GetBiddersPerAuctionResponse[]) =>
  [...bidders]
    .sort((a, b) => {
      if (a.amount.lt(b.amount)) {
        return 1
      }
      if (a.amount.gt(b.amount)) {
        return -1
      }
      return 0
    })
    .map((bidder, index) => {
      const bidderInfo = getBidderInfo(bidder.account)
      return {
        ...bidderInfo,
        position: index + 1,
        account: bidder.account,
        amount: formatBigNumberToFixed(bidder.amount, 0),
      }
    })

// Determine if the auction is:
// - Live and biddable
// - Has been scheduled for specific future date
// - Not annoucned yet, i.e. we should show
const getAuctionStatus = (
  currentBlock: number,
  startBlock: number,
  endBlock: number,
  contractStatus: FarmAuctionContractStatus,
) => {
  if (contractStatus === FarmAuctionContractStatus.Pending && !startBlock && !endBlock) {
    return AuctionStatus.ToBeAnnounced
  }
  if (contractStatus === FarmAuctionContractStatus.Close) {
    return AuctionStatus.Closed
  }
  if (currentBlock >= endBlock) {
    return AuctionStatus.Finished
  }
  if (contractStatus === FarmAuctionContractStatus.Open && currentBlock < startBlock) {
    return AuctionStatus.Pending
  }
  if (contractStatus === FarmAuctionContractStatus.Open && currentBlock > startBlock) {
    return AuctionStatus.Open
  }
  return AuctionStatus.ToBeAnnounced
}

const getAuctionStartDate = async (currentBlock: number, startBlock: number) => {
  const blocksUntilStart = startBlock - currentBlock
  const secondsUntilStart = blocksUntilStart * BSC_BLOCK_TIME
  // if startBlock already happened we can get timestamp via .getBlock(startBlock)
  if (currentBlock > startBlock) {
    try {
      const { timestamp } = await simpleRpcProvider.getBlock(startBlock)
      return toDate(timestamp * 1000)
    } catch {
      add(new Date(), { seconds: secondsUntilStart })
    }
  }
  return add(new Date(), { seconds: secondsUntilStart })
}

export const processAuctionData = async (auctionId: number, auctionResponse: AuctionsResponse): Promise<Auction> => {
  const processedAuctionData = {
    ...auctionResponse,
    initialBidAmount: ethersToBigNumber(auctionResponse.initialBidAmount).div(DEFAULT_TOKEN_DECIMAL).toNumber(),
    startBlock: auctionResponse.startBlock.toNumber(),
    endBlock: auctionResponse.endBlock.toNumber(),
  }

  // Get all required datas and blocks
  const currentBlock = await simpleRpcProvider.getBlockNumber()
  const startDate = await getAuctionStartDate(currentBlock, processedAuctionData.startBlock)
  const secondsToEndBlock = (processedAuctionData.endBlock - processedAuctionData.startBlock) * BSC_BLOCK_TIME
  const endDate = add(startDate, { seconds: secondsToEndBlock })
  const farmStartDate = add(endDate, { hours: 12 })
  const blocksToFarmStartDate = hoursToSeconds(12) / BSC_BLOCK_TIME
  const farmStartBlock = processedAuctionData.endBlock + blocksToFarmStartDate
  const farmDurationInBlocks = hoursToSeconds(7 * 24) / BSC_BLOCK_TIME
  const farmEndBlock = farmStartBlock + farmDurationInBlocks
  const farmEndDate = add(farmStartDate, { weeks: 1 })

  const auctionStatus = getAuctionStatus(
    currentBlock,
    processedAuctionData.startBlock,
    processedAuctionData.endBlock,
    processedAuctionData.status,
  )

  return {
    id: auctionId,
    startDate,
    endDate,
    auctionDuration: intervalToDuration({ start: startDate, end: endDate }).hours,
    farmStartBlock,
    farmStartDate,
    farmEndBlock,
    farmEndDate,
    ...processedAuctionData,
    status: auctionStatus,
  }
}
