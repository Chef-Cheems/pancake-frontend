import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Auction, AuctionStatus, Bidder } from 'config/constants/types'
import { useFarmAuctionContract } from 'hooks/useContract'
import { processAuctionData, sortAuctionBidders } from '../helpers'

interface WonAuction {
  auction: Auction
  bidderData: Bidder
}

const useCongratulateAuctionWinner = (currentAuction: Auction, bidders: Bidder[]): WonAuction => {
  const [wonAuction, setWonAuction] = useState<WonAuction | null>(null)

  const { account } = useWeb3React()

  const farmAuctionContract = useFarmAuctionContract()

  // TODO Rewrite for new contract

  useEffect(() => {
    const checkIfWonPreviousAuction = async (previousAuctionId: number) => {
      const auctionData = await farmAuctionContract.auctions(previousAuctionId)
      const auctionBidders = await farmAuctionContract.getBiddersPerAuction(previousAuctionId)
      const sortedBidders = sortAuctionBidders(auctionBidders)
      const winnerAddresses = sortedBidders.slice(0, auctionData.topLeaderboard).map((bidder) => bidder.account)
      if (winnerAddresses.includes(account)) {
        const processedAuctionData = await processAuctionData(previousAuctionId, auctionData)
        const accountBidderData = sortedBidders.find((bidder) => bidder.account === account)
        setWonAuction({
          auction: processedAuctionData,
          bidderData: accountBidderData,
        })
      }
    }
    const winnerAddresses = bidders.slice(0, currentAuction.topLeaderboard).map((bidder) => bidder.account)
    const isLastAuctionClosed =
      currentAuction.status === AuctionStatus.Closed || currentAuction.status === AuctionStatus.Finished
    if (isLastAuctionClosed && winnerAddresses.includes(account)) {
      // TODO guard for 6 -> 5 position?
      const accountBidderData = bidders.find((bidder) => bidder.account === account)
      setWonAuction({
        auction: currentAuction,
        bidderData: accountBidderData,
      })
    } else {
      checkIfWonPreviousAuction(currentAuction.id - 1)
    }
  }, [currentAuction, bidders, account, farmAuctionContract])

  return wonAuction
}

export default useCongratulateAuctionWinner
