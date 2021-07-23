import React, { useEffect, useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import {
  Modal,
  Text,
  Flex,
  HelpIcon,
  BalanceInput,
  Ticket,
  Box,
  useTooltip,
  Skeleton,
  Button,
  ArrowForwardIcon,
  PancakeRoundIcon,
} from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { useWeb3React } from '@web3-react/core'
import { getBalanceAmount, getFullDisplayBalance } from 'utils/formatBalance'
import { getCakeAddress } from 'utils/addressHelpers'
import { BIG_ZERO, ethersToBigNumber } from 'utils/bigNumber'
import { useAppDispatch } from 'state'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { useLottery } from 'state/lottery/hooks'
import { fetchUserTicketsAndLotteries } from 'state/lottery'
import useTheme from 'hooks/useTheme'
import useTokenBalance, { FetchStatus } from 'hooks/useTokenBalance'
import useApproveConfirmTransaction from 'hooks/useApproveConfirmTransaction'
import { useCake, useFarmAuctionContract } from 'hooks/useContract'
import { DEFAULT_TOKEN_DECIMAL } from 'config'
import useToast from 'hooks/useToast'
import UnlockButton from 'components/UnlockButton'
import ApproveConfirmButtons, { ButtonArrangement } from 'views/Profile/components/ApproveConfirmButtons'
import { ConnectedUser } from '../useCurrentFarmAuction'

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
  connectedUser: ConnectedUser
}

const PlaceBidModal: React.FC<PlaceBidModalProps> = ({ onDismiss, connectedUser }) => {
  const { account } = useWeb3React()
  const { t } = useTranslation()
  const { theme } = useTheme()

  const [bid, setBid] = useState('')
  const [isMultipleOfTen, setIsMultipleOfTen] = useState(false)

  const { balance: userCake, fetchStatus } = useTokenBalance(getCakeAddress())

  // const cakePriceBusd = usePriceCakeBusd()
  const farmAuctionContract = useFarmAuctionContract()
  const cakeContract = useCake()

  const { toastSuccess } = useToast()

  const cakePriceBusd = new BigNumber(12500000000000000000)

  const { bidderData } = connectedUser

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
        console.log('Confirming bid', bid)
        return farmAuctionContract.bid(bidAmount)
      },
      onSuccess: async () => {
        onDismiss()
        toastSuccess(t('Bid placed!'))
      },
    })

  const handleInputChange = (input: string) => {
    setIsMultipleOfTen(parseFloat(input) % 10 === 0)
    setBid(input)
  }

  const setPercetageValue = (percentage) => {
    if (fetchStatus === FetchStatus.SUCCESS) {
      const valueToSet = getBalanceAmount(userCake.times(percentage))
      setIsMultipleOfTen(valueToSet.mod(10).isZero())
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
          <Text>#{bidderData.position}</Text>
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
        <BalanceInput
          isWarning={!isMultipleOfTen}
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
              isConfirmDisabled={!isMultipleOfTen || getBalanceAmount(userCake).lt(bid)}
              isConfirming={isConfirming}
              onApprove={handleApprove}
              onConfirm={handleConfirm}
              buttonArrangement={ButtonArrangement.SEQUENTIAL}
            />
          ) : (
            <UnlockButton />
          )}
        </Flex>
        <Text color="textSubtle" small>
          If your bid is unsuccessful, you’ll be able to reclaim your CAKE after the auction.
        </Text>
      </InnerContent>
    </StyledModal>
  )
}

export default PlaceBidModal
