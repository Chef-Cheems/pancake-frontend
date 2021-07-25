import { useState, useEffect } from 'react'
import isEqual from 'lodash/isEqual'
import { useFarmAuctionContract } from 'hooks/useContract'
import { Auction, ConnectedBidder, Bidder } from 'config/constants/types'
import { getBidderInfo } from 'config/constants/farmAuctions'
import useLastUpdated from 'hooks/useLastUpdated'
import { sortAuctionBidders, processAuctionData } from '../helpers'

export const useCurrentFarmAuction = (account: string) => {
  const [currentAuction, setCurrentAuction] = useState<Auction | null>(null)
  const [bidders, setBidders] = useState<Bidder[] | null>(null)
  const [connectedUser, setConnectedUser] = useState<ConnectedBidder | null>(null)
  // Used to force-refresh bidders after successful bid
  const { lastUpdated, previousLastUpdated, setLastUpdated } = useLastUpdated()

  const farmAuctionContract = useFarmAuctionContract()
  // const farmAuctionContract = useMemo(
  //   () => new ethers.Contract('0x0411CDABe741aC67b579c43bf7900E789C9eFEdf', farmAuctionAbi, simpleRpcProvider),
  //   [],
  // )

  // Get latest auction id and its data
  useEffect(() => {
    const fetchCurrentAuction = async () => {
      try {
        const auctionId = await farmAuctionContract.currentAuctionId()
        const auctionData = await farmAuctionContract.auctions(auctionId)
        const processedAuctionData = await processAuctionData(auctionId.toNumber(), auctionData)
        setCurrentAuction(processedAuctionData)
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
        const sortedBidders = sortAuctionBidders(currentAuctionBidders)
        setBidders(sortedBidders)
      } catch (error) {
        console.error('Failed to fetch bidders', error)
      }
    }
    if (currentAuction && (!bidders || lastUpdated !== previousLastUpdated)) {
      fetchBidders()
    }
  }, [currentAuction, bidders, farmAuctionContract, lastUpdated, previousLastUpdated])

  // Check if connected wallet is whitelisted
  useEffect(() => {
    const checkAccount = async () => {
      try {
        const whitelistedStatus = await farmAuctionContract.isWhitelisted(account)
        setConnectedUser({
          account,
          isWhitelisted: whitelistedStatus,
        })
      } catch (error) {
        console.error('Failed to check if account is whitelisted', error)
      }
    }
    if (account && (!connectedUser || connectedUser.account !== account)) {
      checkAccount()
    }
    // Refresh UI if user logs out
    if (!account) {
      setConnectedUser(null)
    }
  }, [account, connectedUser, farmAuctionContract])

  // Attach bidder data to connectedUser object
  useEffect(() => {
    const getBidderData = () => {
      if (bidders && bidders.length > 0) {
        const bidderData = bidders.find((bidder) => bidder.account === account)
        if (bidderData) {
          return bidderData
        }
      }
      const bidderInfo = getBidderInfo(account)
      const defaultBidderData = {
        position: null,
        amount: '0',
        ...bidderInfo,
      }
      return defaultBidderData
    }
    if (connectedUser && connectedUser.isWhitelisted) {
      const bidderData = getBidderData()
      if (!isEqual(bidderData, connectedUser.bidderData)) {
        setConnectedUser({
          account,
          isWhitelisted: true,
          bidderData,
        })
      }
    }
  }, [account, connectedUser, bidders, lastUpdated, previousLastUpdated])

  return {
    currentAuction,
    bidders,
    connectedUser,
    refreshBidders: setLastUpdated,
  }
}
