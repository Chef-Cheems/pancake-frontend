import { useState, useEffect } from 'react'
import { toDate, add, hoursToSeconds } from 'date-fns'
import { ethers } from 'ethers'
import { useFarmAuctionContract } from 'hooks/useContract'
import { getBidderInfo } from 'config/constants/farmAuctions'
import { formatBigNumberToFixed } from 'utils/formatBalance'
import { simpleRpcProvider } from 'utils/providers'
import { BSC_BLOCK_TIME } from 'config'
import { Auction, AuctionStatus, Bidder } from 'config/constants/types'

const useAuctionHistory = (auctionId: number) => {
  const [auction, setAuction] = useState<Auction | null>(null)
  const [bidders, setBidders] = useState<Bidder[] | null>(null)
  const [loadingBidders, setLoadingBidders] = useState(false)

  const farmAuctionContract = useFarmAuctionContract()

  // Get auction data
  useEffect(() => {
    const fetchCurrentAuction = async () => {
      try {
        // do we need ethers here?
        const auctionData = await farmAuctionContract.auctions(ethers.BigNumber.from(auctionId))

        const processedAuctionData = {
          ...auctionData,
          startBlock: auctionData.startBlock.toNumber(),
          endBlock: auctionData.endBlock.toNumber(),
        }
        const { timestamp } = await simpleRpcProvider.getBlock(processedAuctionData.startBlock)
        const startDate = toDate(timestamp * 1000)
        const secondsToEndBlock = (processedAuctionData.endBlock - processedAuctionData.startBlock) * BSC_BLOCK_TIME
        const endDate = add(startDate, { seconds: secondsToEndBlock })

        const farmStartDate = add(endDate, { hours: 12 })
        const blocksToFarmStartDate = hoursToSeconds(12) / BSC_BLOCK_TIME
        const farmStartBlock = processedAuctionData.endBlock + blocksToFarmStartDate
        const farmDurationInBlocks = hoursToSeconds(7 * 24) / BSC_BLOCK_TIME
        const farmEndBlock = farmStartBlock + farmDurationInBlocks
        const farmEndDate = add(farmStartDate, { weeks: 1 })
        setAuction({
          id: auctionId,
          startDate,
          endDate,
          farmStartBlock,
          farmStartDate,
          farmEndBlock,
          farmEndDate,
          ...processedAuctionData,
          status: AuctionStatus.Close,
        })
      } catch (error) {
        console.error('Failed to fetch current auction', error)
      }
    }
    if (!auction) {
      fetchCurrentAuction()
    }
  }, [farmAuctionContract, auction, auctionId])

  // Fetch bidders for past auction
  useEffect(() => {
    const fetchBidders = async () => {
      try {
        const currentAuctionBidders = await farmAuctionContract.getBiddersPerAuction(auctionId)
        const sortedBidders = [...currentAuctionBidders]
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

        setBidders(sortedBidders)
      } catch (error) {
        console.error('Failed to fetch bidders', error)
      } finally {
        setLoadingBidders(false)
      }
    }
    if (auctionId && !loadingBidders && !bidders) {
      fetchBidders()
    }
  }, [farmAuctionContract, auctionId, loadingBidders, bidders])

  return { auction, bidders }
}
