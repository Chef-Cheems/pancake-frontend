import { useState, useEffect } from 'react'
import { toDate, add, hoursToSeconds } from 'date-fns'
import { useFarmAuctionContract } from 'hooks/useContract'
import { Auction, AuctionStatus, ConnectedBidder, Bidder } from 'config/constants/types'
import { getBidderInfo } from 'config/constants/farmAuctions'
import { formatBigNumberToFixed } from 'utils/formatBalance'
import { simpleRpcProvider } from 'utils/providers'
import { FarmAuctionContractStatus } from 'utils/types'
import { BSC_BLOCK_TIME } from 'config'
import useLastUpdated from 'hooks/useLastUpdated'

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
  if (contractStatus === FarmAuctionContractStatus.Close || currentBlock >= endBlock) {
    return AuctionStatus.Close
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

        const processedAuctionData = {
          ...auctionData,
          startBlock: auctionData.startBlock.toNumber(),
          endBlock: auctionData.endBlock.toNumber(),
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

        const auctionStatus = await getAuctionStatus(
          currentBlock,
          processedAuctionData.startBlock,
          processedAuctionData.endBlock,
          processedAuctionData.status,
        )

        setCurrentAuction({
          id: auctionId.toNumber(),
          startDate,
          endDate,
          farmStartBlock,
          farmStartDate,
          farmEndBlock,
          farmEndDate,
          ...processedAuctionData,
          status: auctionStatus,
        })
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
              amount: formatBigNumberToFixed(bidder.amount, 0),
            }
          })

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
    if (connectedUser && connectedUser.isWhitelisted && !connectedUser.bidderData) {
      const bidderData = getBidderData()
      setConnectedUser({
        account,
        isWhitelisted: true,
        bidderData,
      })
    }
  }, [account, connectedUser, bidders])

  return {
    currentAuction,
    bidders,
    connectedUser,
    refreshBidders: setLastUpdated,
  }
}
