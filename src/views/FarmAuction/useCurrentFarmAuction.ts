import { useState, useEffect } from 'react'
import { toDate, add } from 'date-fns'
import { ethers } from 'ethers'
import { useFarmAuctionContract } from 'hooks/useContract'
import { FarmAuctionBidderConfig } from 'config/constants/types'
import { getBidderInfo } from 'config/constants/farmAuctions'
import { formatBigNumberToFixed } from 'utils/formatBalance'
import { simpleRpcProvider } from 'utils/providers'
import { BSC_BLOCK_TIME } from 'config'

enum Status {
  Pending,
  Open,
  Close,
}

export interface Auction {
  id: number
  status: Status //
  startBlock: number //
  startDate: Date
  endBlock: number //
  endDate: Date
  initialBidAmount: ethers.BigNumber //
  topLeaderboard: number //
  leaderboardLimit: ethers.BigNumber //
}

export interface Bidder extends FarmAuctionBidderConfig {
  position: number
  amount: string
}

export interface ConnectedUser {
  isWhitelisted: boolean
  bidderData?: Bidder
}

export const useCurrentFarmAuction = (account: string) => {
  const [currentAuction, setCurrentAuction] = useState<Auction | null>(null)
  const [bidders, setBidders] = useState<Bidder[]>([])
  const [connectedUser, setConnectedUser] = useState<ConnectedUser | null>(null)

  const farmAuctionContract = useFarmAuctionContract()

  // Get latest auction id and its data
  useEffect(() => {
    const fetchCurrentAuction = async () => {
      try {
        // const auctionId = await farmAuctionContract.currentAuctionId()
        const auctionId = ethers.BigNumber.from(2)
        const auctionData = await farmAuctionContract.auctions(auctionId)

        const processedAuctionData = {
          ...auctionData,
          startBlock: auctionData.startBlock.toNumber(),
          endBlock: auctionData.endBlock.toNumber(),
        }
        const { timestamp } = await simpleRpcProvider.getBlock(processedAuctionData.startBlock)
        const startDate = toDate(timestamp * 1000)
        const secondsToEndBlock = (processedAuctionData.endBlock - processedAuctionData.startBlock) * BSC_BLOCK_TIME
        const endDate = add(startDate, { seconds: secondsToEndBlock })
        setCurrentAuction({ id: auctionId.toNumber(), startDate, endDate, ...processedAuctionData })
      } catch (error) {
        console.error('Failed to fetch current auction', error)
      }
    }
    if (!currentAuction) {
      fetchCurrentAuction()
    }
  }, [farmAuctionContract, currentAuction])

  // Fetch bidders for current auction
  useEffect(() => {
    const fetchBidders = async () => {
      try {
        const currentAuctionBidders = await farmAuctionContract.getBiddersPerAuction(currentAuction.id)
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
              amount: formatBigNumberToFixed(bidder.amount, 3),
            }
          })

        setBidders(sortedBidders)
      } catch (error) {
        console.error('Failed to fetch bidders', error)
      }
    }
    if (currentAuction) {
      fetchBidders()
    }
  }, [currentAuction, farmAuctionContract])

  // Check if connected wallet is whitelisted
  useEffect(() => {
    const checkAccount = async () => {
      try {
        const whitelistedStatus = await farmAuctionContract.isWhitelisted(account)
        setConnectedUser({
          isWhitelisted: whitelistedStatus,
        })
      } catch (error) {
        console.error('Failed to check if account is whitelisted', error)
      }
    }
    if (account) {
      checkAccount()
    }
  }, [account, farmAuctionContract])

  // Attach bidder data to connectedUser object
  useEffect(() => {
    if (connectedUser && connectedUser.isWhitelisted && bidders.length > 0) {
      const bidderData = bidders.find((bidder) => bidder.account === account)
      setConnectedUser({
        isWhitelisted: true,
        bidderData,
      })
    }
  }, [account, connectedUser, bidders])

  return {
    currentAuction,
    bidders,
    connectedUser,
  }
}
