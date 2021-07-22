import React from 'react'
import styled from 'styled-components'
import { format } from 'date-fns'
import {
  Text,
  Heading,
  Card,
  CardHeader,
  CardBody,
  Flex,
  Box,
  Spinner,
  Skeleton,
  Tag,
  Button,
  CheckmarkCircleIcon,
} from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { Auction, ConnectedUser } from '../useCurrentFarmAuction'

const AuctionDetailsCard = styled(Card)`
  flex: 1;
`

const ScheduleInner = styled(Flex)`
  flex-direction: column;
  padding: 16px;
  border-radius: ${({ theme }) => theme.radii.default};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px ${({ theme }) => theme.colors.cardBorder} solid;
`

interface AuctionDetailsProps {
  auction: Auction
  connectedUser: ConnectedUser
}

const AuctionDetails: React.FC<AuctionDetailsProps> = ({ auction, connectedUser }) => {
  const { t } = useTranslation()

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

  const { startBlock, endBlock, startDate, endDate } = auction
  const { bidderData, isWhitelisted } = connectedUser

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
  if (connectedUser && !isWhitelisted) {
    bidSection = <Text>Why cant I bid for a farm?</Text>
  }
  if (connectedUser && isWhitelisted && bidderData) {
    bidSection = (
      <>
        <Tag outline variant="success" startIcon={<CheckmarkCircleIcon />}>
          Connected as {bidderData.tokenName}
        </Tag>
        <Flex justifyContent="space-between" width="100%" pt="24px" px="8px">
          <Text color="textSubtle">Your existing bid</Text>
          <Text>{bidderData.amount} CAKE</Text>
        </Flex>
        <Flex justifyContent="space-between" width="100%" pt="8px" px="8px">
          <Text color="textSubtle">Your position</Text>
          <Text>#{bidderData.position}</Text>
        </Flex>
        <Button my="24px" width="100%">
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
        <Text fontSize="12px" bold color="secondary" textTransform="uppercase" mb="8px">
          {t('Auction Schedule')}
        </Text>
        <ScheduleInner>
          <Flex justifyContent="space-between" mb="8px">
            <Text color="textSubtle">{t('Auction duration')}</Text>
            <Text> {t('%numHours% hours', { numHours: '~24' })}</Text>
          </Flex>
          <Flex justifyContent="space-between" mb="8px">
            <Text color="textSubtle">{t('Start')}</Text>
            <Box>
              <Text>{format(startDate, 'MMMM dd yyyy hh:mm aa')}</Text>
              <Text textAlign="right">Block {startBlock}</Text>
            </Box>
          </Flex>
          <Flex justifyContent="space-between">
            <Text color="textSubtle">{t('End')}</Text>
            <Box>
              <Text>{format(endDate, 'MMMM dd yyyy hh:mm aa')}</Text>
              <Text textAlign="right">Block {endBlock}</Text>
            </Box>
          </Flex>
        </ScheduleInner>
        <Flex mt="24px" flexDirection="column" justifyContent="center" alignItems="center">
          {bidSection}
        </Flex>
      </CardBody>
    </AuctionDetailsCard>
  )
}

export default AuctionDetails
