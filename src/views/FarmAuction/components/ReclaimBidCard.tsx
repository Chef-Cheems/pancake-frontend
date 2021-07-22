import React from 'react'
import styled from 'styled-components'
import { Text, Heading, Card, CardHeader, CardBody, Flex, Spinner, Button } from '@pancakeswap/uikit'
import { Auction } from 'config/constants/types'
import { useTranslation } from 'contexts/Localization'
import useApproveConfirmTransaction from 'hooks/useApproveConfirmTransaction'
import { useCake, useFarmAuctionContract } from 'hooks/useContract'
import { ethersToBigNumber } from 'utils/bigNumber'
import { useWeb3React } from '@web3-react/core'
import UnlockButton from 'components/UnlockButton'
import useToast from 'hooks/useToast'
import { ethers } from 'ethers'
import ApproveConfirmButtons, { ButtonArrangement } from 'views/Profile/components/ApproveConfirmButtons'
import useReclaimAuctionBid from '../hooks/useReclaimAuctionBid'

const StyledReclaimBidCard = styled(Card)`
  margin-top: 16px;
  flex: 1;
`

const ReclaimBidCard: React.FC<{ auction: Auction }> = ({ auction }) => {
  const { t } = useTranslation()
  const { account } = useWeb3React()

  const [reclaimableAuction, loading, allChecked, checkForNextReclaimableAuction, checkAllAuctions] =
    useReclaimAuctionBid(auction)

  const cakeContract = useCake()
  const farmAuctionContract = useFarmAuctionContract()

  const { toastSuccess } = useToast()

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
        return farmAuctionContract.claimAuction(reclaimableAuction.id)
      },
      onSuccess: async () => {
        checkForNextReclaimableAuction(reclaimableAuction.id)
        toastSuccess(t('Bid placed!'))
      },
    })

  let cardBody = null

  if (!auction || loading) {
    cardBody = (
      <Flex justifyContent="center" alignItems="center" flexDirection="column">
        <Spinner />
        <Text mt="8px">Checking your recent activity...</Text>
      </Flex>
    )
  } else if (!reclaimableAuction) {
    cardBody = (
      <Flex justifyContent="center" alignItems="center" flexDirection="column">
        <Text textAlign="center">
          {allChecked ? t('You have no unclaimed bids.') : t('You have no recent unclaimed bids.')}
        </Text>
        {!allChecked && (
          <Button variant="text" onClick={checkAllAuctions}>
            Check all auction
          </Button>
        )}
      </Flex>
    )
  } else {
    cardBody = (
      <>
        <Text mb="16px">Your bid in Auction #{reclaimableAuction.id} was unsuccessful.</Text>
        <Text bold mb="16px">
          Reclaim your CAKE now.
        </Text>
        <Flex justifyContent="space-between" mb="8px">
          <Text color="textSubtle">Your total bid</Text>
          <Text>{reclaimableAuction.amount} CAKE</Text>
        </Flex>
        <Flex justifyContent="space-between" mb="24px">
          <Text color="textSubtle">Your position</Text>
          <Text>#{reclaimableAuction.position}</Text>
        </Flex>
        {account ? (
          <ApproveConfirmButtons
            isApproveDisabled={isApproved}
            isApproving={isApproving}
            isConfirmDisabled={isConfirmed}
            isConfirming={isConfirming}
            onApprove={handleApprove}
            onConfirm={handleConfirm}
            buttonArrangement={ButtonArrangement.SEQUENTIAL}
            confirmLabel={t('Reclaim')}
          />
        ) : (
          <UnlockButton />
        )}
      </>
    )
  }

  return (
    <StyledReclaimBidCard mb={['24px', null, null, '0']}>
      <CardHeader>
        <Heading>{t('Reclaim Bid')}</Heading>
      </CardHeader>
      <CardBody>{cardBody}</CardBody>
    </StyledReclaimBidCard>
  )
}

export default ReclaimBidCard
