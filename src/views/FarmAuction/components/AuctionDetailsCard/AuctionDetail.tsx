import React from 'react'
import styled from 'styled-components'
import {
  Text,
  Heading,
  Card,
  CardHeader,
  CardBody,
  Flex,
  Spinner,
  Skeleton,
  Tag,
  Button,
  CheckmarkCircleIcon,
  useModal,
} from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { Auction, AuctionStatus, ConnectedBidder } from 'config/constants/types'
import PlaceBidModal from '../PlaceBidModal'
import { AuctionSchedule } from './AuctionSchedule'
import CannotBidMessage from './CannotBidMessage'
import AuctionFooter from './AuctionFooter'

const AuctionDetailsCard = styled(Card)`
  flex: 1;
`

interface AuctionDetailsProps {
  auction: Auction
  connectedUser: ConnectedBidder
  refreshBidders: () => void
}

const AuctionDetails: React.FC<AuctionDetailsProps> = ({ auction, connectedUser, refreshBidders }) => {
  const { t } = useTranslation()

  const [onPresentPlaceBid] = useModal(<PlaceBidModal connectedUser={connectedUser} refreshBidders={refreshBidders} />)

  if (!auction) {
    return (
      <AuctionDetailsCard mr={[null, null, null, '24px']} mb={['24px', null, null, '0']}>
        <CardHeader>
          <Heading>{t('Current Auction')}</Heading>
        </CardHeader>
        <CardBody>
          <Flex justifyContent="center" alignItems="center" height="100%">
            <Spinner />
          </Flex>
        </CardBody>
      </AuctionDetailsCard>
    )
  }

  const notConnectedOrNotWhitelisted = !connectedUser || (connectedUser && !connectedUser.isWhitelisted)
  const whitelistedAndReadyToBid = !notConnectedOrNotWhitelisted && connectedUser.bidderData

  let bidSection = (
    <>
      <Skeleton width="200px" height="28px" />
      <Flex justifyContent="space-between" width="100%" pt="24px" px="8px">
        <Skeleton width="120px" height="24px" />
        <Skeleton width="86px" height="24px" />
      </Flex>
      <Flex justifyContent="space-between" width="100%" pt="8px" px="8px">
        <Skeleton width="96px" height="24px" />
        <Skeleton width="42px" height="24px" />
      </Flex>
    </>
  )
  if (notConnectedOrNotWhitelisted || auction.status !== AuctionStatus.Open) {
    bidSection = <CannotBidMessage />
  }
  if (whitelistedAndReadyToBid && auction.status === AuctionStatus.Open) {
    bidSection = (
      <>
        <Tag outline variant="success" startIcon={<CheckmarkCircleIcon />}>
          Connected as {connectedUser.bidderData.tokenName}
        </Tag>
        <Flex justifyContent="space-between" width="100%" pt="24px" px="8px">
          <Text color="textSubtle">Your existing bid</Text>
          <Text>{connectedUser.bidderData.amount} CAKE</Text>
        </Flex>
        {connectedUser.bidderData.position && (
          <Flex justifyContent="space-between" width="100%" pt="8px" px="8px">
            <Text color="textSubtle">Your position</Text>
            <Text>#{connectedUser.bidderData.position}</Text>
          </Flex>
        )}
        <Button my="24px" width="100%" onClick={onPresentPlaceBid}>
          Place bid
        </Button>
        <Text color="textSubtle" small>
          If your bid is unsuccessful, you’ll be able to reclaim your CAKE after the auction.
        </Text>
      </>
    )
  }
  return (
    <AuctionDetailsCard mr={[null, null, null, '24px']} mb={['24px', null, null, '0']}>
      <CardHeader>
        <Heading>{t('Current Auction')}</Heading>
      </CardHeader>
      <CardBody>
        <AuctionSchedule auction={auction} />
        <Flex mt="24px" flexDirection="column" justifyContent="center" alignItems="center">
          {bidSection}
        </Flex>
      </CardBody>
      <AuctionFooter auction={auction} />
    </AuctionDetailsCard>
  )
}

export default AuctionDetails
