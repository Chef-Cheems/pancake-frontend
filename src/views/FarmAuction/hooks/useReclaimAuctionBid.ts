import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Auction, AuctionStatus } from 'config/constants/types'
import { useFarmAuctionContract } from 'hooks/useContract'
import { formatBigNumberToFixed } from 'utils/formatBalance'
import { sortAuctionBidders } from '../helpers'

interface ReclaimableAuction {
  id: number
  amount: string
  position: number
}

const INITIAL_AUCTIONS_TO_CHECK = 1

const useReclaimAuctionBid = (
  currentAuction: Auction,
): [ReclaimableAuction | null, boolean, boolean, (processedAuctionid: number) => void, () => void] => {
  const [nextAuctionIdToCheck, setNextAuctionIdToCheck] = useState(null)
  const [auctionsToCheck, setAuctionsToCheck] = useState(INITIAL_AUCTIONS_TO_CHECK)
  const [auctionToReclaim, setAuctionToReclaim] = useState<ReclaimableAuction | null>(null)
  const [loading, setLoading] = useState(false)
  const [allChecked, setAllChecked] = useState(false)

  const { account } = useWeb3React()

  const farmAuctionContract = useFarmAuctionContract()

  const moveToPreviousAuctionId = (processedAuctionid: number) => {
    const previousAuctionId = processedAuctionid - 1
    if (previousAuctionId !== 0) {
      setNextAuctionIdToCheck(previousAuctionId)
    } else {
      setLoading(false)
      setAllChecked(true)
    }
  }

  const checkAllAuctions = () => {
    setAuctionsToCheck(currentAuction.id - 1)
  }

  // Reset checking if account was switched
  useEffect(() => {
    if (currentAuction) {
      const latestClosedAuctionId =
        currentAuction.status === AuctionStatus.Closed ? currentAuction.id : currentAuction.id - 1
      setAllChecked(false)
      setAuctionToReclaim(null)
      setAuctionsToCheck(INITIAL_AUCTIONS_TO_CHECK)
      setNextAuctionIdToCheck(latestClosedAuctionId)
    }
  }, [currentAuction, account])

  useEffect(() => {
    const checkIfAuctionIsClaimable = async (auctionIdToCheck: number) => {
      setLoading(true)
      try {
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
            setLoading(false)
            setAuctionToReclaim({ id: auctionIdToCheck, amount: formatBigNumberToFixed(totalAmount, 0), position })
          } else {
            moveToPreviousAuctionId(auctionIdToCheck)
          }
        } else {
          moveToPreviousAuctionId(auctionIdToCheck)
        }
      } catch (error) {
        setLoading(false)
        console.error('Failed to check for unclaim bids', error)
      }
    }
    const firstOpenAuction = currentAuction && currentAuction.id === 1 && currentAuction.status !== AuctionStatus.Closed
    const skip = !currentAuction || firstOpenAuction || !account
    if (!skip) {
      const latestClosedAuctionId =
        currentAuction.status === AuctionStatus.Closed ? currentAuction.id : currentAuction.id - 1
      const auctionIdToCheck = nextAuctionIdToCheck ?? latestClosedAuctionId
      const lastAuctionToCheck = currentAuction.id - auctionsToCheck
      if (auctionIdToCheck >= lastAuctionToCheck) {
        checkIfAuctionIsClaimable(auctionIdToCheck)
      } else {
        setLoading(false)
      }
    }
  }, [account, currentAuction, nextAuctionIdToCheck, farmAuctionContract, auctionsToCheck])

  return [auctionToReclaim, loading, allChecked, moveToPreviousAuctionId, checkAllAuctions]
}

export default useReclaimAuctionBid
