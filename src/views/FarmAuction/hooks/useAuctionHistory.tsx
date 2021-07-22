import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useFarmAuctionContract } from 'hooks/useContract'
import { Auction, Bidder } from 'config/constants/types'
import { processAuctionData, sortAuctionBidders } from '../helpers'

interface AuctionHistoryMap {
  [key: number]: {
    auction: Auction
    bidders: Bidder[]
  }
}

const useAuctionHistory = (auctionId: number) => {
  const [auctionHistory, setAuctionHistory] = useState<AuctionHistoryMap>({})

  const farmAuctionContract = useFarmAuctionContract()

  // Get auction data
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        // TODO do we need ethers here?
        const auctionData = await farmAuctionContract.auctions(ethers.BigNumber.from(auctionId))
        const processedAuctionData = await processAuctionData(auctionId, auctionData)

        const auctionBidders = await farmAuctionContract.getBiddersPerAuction(auctionId)
        const sortedBidders = sortAuctionBidders(auctionBidders)
        setAuctionHistory((prev) => ({
          ...prev,
          [auctionId]: { auction: processedAuctionData, bidders: sortedBidders },
        }))
      } catch (error) {
        console.error('Failed to fetch auction history', error)
      }
    }
    if (!auctionHistory[auctionId] && auctionId > 0) {
      fetchAuction()
    }
  }, [farmAuctionContract, auctionHistory, auctionId])

  return auctionHistory
}

export default useAuctionHistory
