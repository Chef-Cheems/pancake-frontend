import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Auction, AuctionStatus } from 'config/constants/types'
import { useFarmAuctionContract } from 'hooks/useContract'
import { formatBigNumberToFixed } from 'utils/formatBalance'
import useLastUpdated from 'hooks/useLastUpdated'
import { sortAuctionBidders } from '../helpers'

interface ReclaimableAuction {
  id: number
  amount: string
  position: number
}

const useReclaimAuctionBid = (currentAuction: Auction): [ReclaimableAuction | null, () => void] => {
  const [nextAuctionIdToCheck, setNextAuctionIdToCheck] = useState(null)
  const [auctionToReclaim, setAuctionToReclaim] = useState<ReclaimableAuction | null>(null)
  // Used to check for next possible unclaimed bid when successfully claim the most recent one
  const { lastUpdated, setLastUpdated } = useLastUpdated()

  const { account } = useWeb3React()

  const farmAuctionContract = useFarmAuctionContract()

  const moveToPreviousAuctionId = (processedAuctionid: number) => {
    const previousAuctionId = processedAuctionid - 1
    if (previousAuctionId !== 0) {
      setNextAuctionIdToCheck(previousAuctionId)
    }
  }

  // TODO this doesn't work... Need not to just react to last Updated but also bump id to next one
  useEffect(() => {
    const checkIfAuctionIsClaimable = async (auctionIdToCheck: number) => {
      const { totalAmount, hasClaimed } = await farmAuctionContract.auctionsHistory(auctionIdToCheck, account)
      if (totalAmount.gt(0) && !hasClaimed) {
        const { topLeaderboard } = await farmAuctionContract.auctions(auctionIdToCheck)
        const auctionBidders = await farmAuctionContract.getBiddersPerAuction(auctionIdToCheck)
        const sortedBidders = sortAuctionBidders(auctionBidders)
        const winnerAddresses = sortedBidders.slice(0, topLeaderboard).map((bidder) => bidder.account)
        if (!winnerAddresses.includes(account)) {
          const accountBidderData = sortedBidders.find((bidder) => bidder.account === account)
          let position = accountBidderData?.position
          if (!position || position === topLeaderboard) {
            // Guard for case when bidder made same bid as last winner in topLeaderboard
            position = topLeaderboard + 1
          }
          setAuctionToReclaim({ id: auctionIdToCheck, amount: formatBigNumberToFixed(totalAmount, 0), position })
        } else {
          moveToPreviousAuctionId(auctionIdToCheck)
        }
      } else {
        moveToPreviousAuctionId(auctionIdToCheck)
      }
    }
    const firstOpenAuction = currentAuction && currentAuction.id === 1 && currentAuction.status !== AuctionStatus.Closed
    const skip = !currentAuction || firstOpenAuction || !account
    if (!skip) {
      const latestClosedAuctionId =
        currentAuction.status === AuctionStatus.Closed ? currentAuction.id : currentAuction.id - 1
      const auctionIdToCheck = nextAuctionIdToCheck ?? latestClosedAuctionId
      checkIfAuctionIsClaimable(auctionIdToCheck)
    }
  }, [account, currentAuction, nextAuctionIdToCheck, farmAuctionContract, lastUpdated])

  return [auctionToReclaim, setLastUpdated]
}

export default useReclaimAuctionBid
