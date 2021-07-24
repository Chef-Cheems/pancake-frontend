import { useState, useEffect } from 'react'
import { useFarmAuctionContract } from 'hooks/useContract'
import { WhitelistedAddress } from 'config/constants/types'

const useWhitelistedAddresses = () => {
  const [whitelistedAddresses, setWhitelistedAddresses] = useState<WhitelistedAddress[] | null>(null)
  const farmAuctionContract = useFarmAuctionContract()

  // TODO call countWhitelistedAddresses
  useEffect(() => {
    // TODO: fix when new contract is fixed out of bound thing
    const fetchWhielistedAddresses = async () => {
      try {
        const [addresses, nextCursor] = await farmAuctionContract.getWhitelistedAddresses(0, 12)
        setWhitelistedAddresses(addresses)
      } catch (error) {
        console.error('Failed to fetch list of whitelisted addresses', error)
      }
    }
    if (!whitelistedAddresses || whitelistedAddresses.length === 0) {
      fetchWhielistedAddresses()
    }
  }, [farmAuctionContract, whitelistedAddresses])

  return whitelistedAddresses
}

export default useWhitelistedAddresses
