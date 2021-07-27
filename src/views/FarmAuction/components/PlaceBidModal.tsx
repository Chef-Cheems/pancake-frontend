import React, { useState } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { Modal, Text, Flex, BalanceInput, Box, Button, PancakeRoundIcon } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { useWeb3React } from '@web3-react/core'
import { getBalanceAmount, getFullDisplayBalance } from 'utils/formatBalance'
import { getCakeAddress } from 'utils/addressHelpers'
import { ethersToBigNumber } from 'utils/bigNumber'
// import { usePriceCakeBusd } from 'state/farms/hooks'
import useTheme from 'hooks/useTheme'
import useTokenBalance, { FetchStatus } from 'hooks/useTokenBalance'
import useApproveConfirmTransaction from 'hooks/useApproveConfirmTransaction'
import { useCake, useFarmAuctionContract } from 'hooks/useContract'
import { DEFAULT_TOKEN_DECIMAL } from 'config'
import useToast from 'hooks/useToast'
import UnlockButton from 'components/UnlockButton'
import ApproveConfirmButtons, { ButtonArrangement } from 'views/Profile/components/ApproveConfirmButtons'
import { ConnectedBidder } from 'config/constants/types'

const StyledModal = styled(Modal)`
  min-width: 280px;
  max-width: 320px;
  & > div:nth-child(2) {
    padding: 0;
  }
`

const ExistingInfo = styled(Box)`
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.dropdown};
`

const InnerContent = styled(Box)`
  padding: 24px;
`

interface PlaceBidModalProps {
  onDismiss?: () => void
  // undefined initialBidAmount is passed only if auction is not loaded
  // in this case modal will not be possible to open
  initialBidAmount?: number
  connectedUser: ConnectedBidder
  refreshBidders: () => void
}

const PlaceBidModal: React.FC<PlaceBidModalProps> = ({
  onDismiss,
  initialBidAmount,
  connectedUser,
  refreshBidders,
}) => {
  const { account } = useWeb3React()
  const { t } = useTranslation()
  const { theme } = useTheme()

  const [bid, setBid] = useState('')
  const [isMultipleOfTen, setIsMultipleOfTen] = useState(false)
  const [isMoreThanInitialBidAmount, setIsMoreThanInitialBidAmount] = useState(false)

  const { balance: userCake, fetchStatus } = useTokenBalance(getCakeAddress())

  // const cakePriceBusd = usePriceCakeBusd()
  const farmAuctionContract = useFarmAuctionContract()
  const cakeContract = useCake()

  const { toastSuccess } = useToast()

  const cakePriceBusd = new BigNumber(12500000000000000000)

  const { bidderData } = connectedUser
  const isFirstBid = parseInt(bidderData.amount, 10) === 0
  const isInvalidFirstBid = isFirstBid && !isMoreThanInitialBidAmount

  const { isApproving, isApproved, isConfirmed, isConfirming, handleApprove, handleConfirm } =
    useApproveConfirmTransaction({
      onRequiresApproval: async () => {
        try {
          const response = await cakeContract.allowance(account, farmAuctionContract.address)
          const currentAllowance = ethersToBigNumber(response)
          return currentAllowance.gt(0)
        } catch (error) {
          return false
        }
      },
      onApprove: () => {
        return cakeContract.approve(farmAuctionContract.address, ethers.constants.MaxUint256)
      },
      onApproveSuccess: async () => {
        toastSuccess(t('Contract approved - you can now place your bid!'))
      },
      onConfirm: () => {
        const bidAmount = new BigNumber(bid).times(DEFAULT_TOKEN_DECIMAL).toString()
        return farmAuctionContract.bid(bidAmount)
      },
      onSuccess: async () => {
        refreshBidders()
        onDismiss()
        toastSuccess(t('Bid placed!'))
      },
    })

  const handleInputChange = (input: string) => {
    setIsMoreThanInitialBidAmount(parseFloat(input) >= initialBidAmount)
    setIsMultipleOfTen(parseFloat(input) % 10 === 0 && parseFloat(input) !== 0)
    setBid(input)
  }

  const setPercetageValue = (percentage) => {
    if (fetchStatus === FetchStatus.SUCCESS) {
      const valueToSet = getBalanceAmount(userCake.times(percentage))
      setIsMoreThanInitialBidAmount(valueToSet.gte(initialBidAmount))
      setIsMultipleOfTen(valueToSet.mod(10).isZero() && !valueToSet.isZero())
      setBid(valueToSet.toString())
    }
  }
  return (
    <StyledModal title={t('Place a Bid')} onDismiss={onDismiss} headerBackground={theme.colors.gradients.cardHeader}>
      <ExistingInfo>
        <Flex justifyContent="space-between">
          <Text>Your existing bid</Text>
          <Text>{bidderData.amount} CAKE</Text>
        </Flex>
        <Flex justifyContent="space-between">
          <Text>Your position</Text>
          <Text>{bidderData.position ? `#${bidderData.position}` : '-'}</Text>
        </Flex>
      </ExistingInfo>
      <InnerContent>
        <Flex justifyContent="space-between" alignItems="center" pb="8px">
          <Text>Bid a multiple of 10</Text>
          <Flex>
            <PancakeRoundIcon width="24px" height="24px" />
            <Text>CAKE</Text>
          </Flex>
        </Flex>
        {isFirstBid && <Text pb="8px">First bid must be {initialBidAmount} CAKE or more.</Text>}
        <BalanceInput
          isWarning={!isMultipleOfTen || isInvalidFirstBid}
          placeholder="0"
          value={bid}
          onUserInput={handleInputChange}
          currencyValue={
            cakePriceBusd.gt(0) &&
            `~${bid ? getFullDisplayBalance(cakePriceBusd.times(new BigNumber(bid))) : '0.00'} USD`
          }
        />
        <Flex justifyContent="space-between" mt="8px" mb="24px">
          <Button
            disabled={false}
            scale="xs"
            mx="2px"
            p="4px 16px"
            variant="tertiary"
            onClick={() => setPercetageValue(0.25)}
          >
            25%
          </Button>
          <Button
            disabled={false}
            scale="xs"
            mx="2px"
            p="4px 16px"
            variant="tertiary"
            onClick={() => setPercetageValue(0.5)}
          >
            50%
          </Button>
          <Button
            disabled={false}
            scale="xs"
            mx="2px"
            p="4px 16px"
            variant="tertiary"
            onClick={() => setPercetageValue(0.75)}
          >
            75%
          </Button>
          <Button
            disabled={false}
            scale="xs"
            mx="2px"
            p="4px 16px"
            variant="tertiary"
            onClick={() => setPercetageValue(1)}
          >
            MAX
          </Button>
        </Flex>
        <Flex flexDirection="column">
          {account ? (
            <ApproveConfirmButtons
              isApproveDisabled={isApproved}
              isApproving={isApproving}
              isConfirmDisabled={
                !isMultipleOfTen || getBalanceAmount(userCake).lt(bid) || isConfirmed || isInvalidFirstBid
              }
              isConfirming={isConfirming}
              onApprove={handleApprove}
              onConfirm={handleConfirm}
              buttonArrangement={ButtonArrangement.SEQUENTIAL}
            />
          ) : (
            <UnlockButton />
          )}
        </Flex>
        <Text color="textSubtle" small mt="24px">
          If your bid is unsuccessful, you’ll be able to reclaim your CAKE after the auction.
        </Text>
      </InnerContent>
    </StyledModal>
  )
}

export default PlaceBidModal
