import React, { useState } from 'react'
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
  CardFooter,
  ExpandableLabel,
  useModal,
} from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { whitelistedBidders } from 'config/constants/farmAuctions'
import { Auction, ConnectedUser } from '../useCurrentFarmAuction'
import PlaceBidModal from './PlaceBidModal'

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

const FooterInner = styled(Box)`
  background-color: ${({ theme }) => theme.colors.dropdown};
`

interface AuctionDetailsProps {
  auction: Auction
  connectedUser: ConnectedUser
}

const CAKE_PER_DAY_1X_FARM = 1514
const CAKE_PER_WEEK_1X_FARM = CAKE_PER_DAY_1X_FARM * 7

const AuctionDetails: React.FC<AuctionDetailsProps> = ({ auction, connectedUser }) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  const [onPresentPlaceBid] = useModal(<PlaceBidModal connectedUser={connectedUser} />)

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

  const {
    startBlock,
    endBlock,
    startDate,
    endDate,
    topLeaderboard,
    farmStartBlock,
    farmEndBlock,
    farmStartDate,
    farmEndDate,
  } = auction
  const { bidderData, isWhitelisted } = connectedUser

  console.log(auction.status)

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
        {bidderData.position && (
          <Flex justifyContent="space-between" width="100%" pt="8px" px="8px">
            <Text color="textSubtle">Your position</Text>
            <Text>#{bidderData.position}</Text>
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
      <CardFooter p="0">
        {isExpanded && (
          <FooterInner>
            <Flex p="16px" flexDirection="column">
              <Flex justifyContent="space-between" width="100%" pt="8px" px="8px">
                <Text color="textSubtle">Farms available</Text>
                <Text>
                  {topLeaderboard} (top {topLeaderboard} bidders)
                </Text>
              </Flex>
              <Flex justifyContent="space-between" width="100%" pt="8px" px="8px">
                <Text color="textSubtle">Weekly CAKE rewards per farm</Text>
                <Text>{CAKE_PER_WEEK_1X_FARM.toLocaleString()}</Text>
              </Flex>
              <Flex justifyContent="space-between" width="100%" pt="8px" px="8px">
                <Text color="textSubtle">Multiplier per farm</Text>
                <Text>1x</Text>
              </Flex>
              <Flex justifyContent="space-between" width="100%" pt="8px" px="8px">
                <Text color="textSubtle">Total whitelisted bidders</Text>
                <Text>{whitelistedBidders.length}</Text>
              </Flex>
              <Flex flexDirection="column" mt="24px">
                <Text textTransform="uppercase" color="secondary" bold fontSize="12px" mb="8px">
                  Farm schedule
                </Text>
                <ScheduleInner>
                  <Flex justifyContent="space-between" mb="8px">
                    <Text color="textSubtle">{t('Farm duration')}</Text>
                    <Text>7 days</Text>
                  </Flex>
                  <Flex justifyContent="space-between" mb="8px">
                    <Text color="textSubtle">{t('Start')}</Text>
                    <Box>
                      <Text>{format(farmStartDate, 'MMMM dd yyyy hh:mm aa')}</Text>
                      <Text textAlign="right">Block {farmStartBlock}</Text>
                    </Box>
                  </Flex>
                  <Flex justifyContent="space-between">
                    <Text color="textSubtle">{t('End')}</Text>
                    <Box>
                      <Text>{format(farmEndDate, 'MMMM dd yyyy hh:mm aa')}</Text>
                      <Text textAlign="right">Block {farmEndBlock}</Text>
                    </Box>
                  </Flex>
                </ScheduleInner>
              </Flex>
            </Flex>
          </FooterInner>
        )}
        <Flex p="8px" alignItems="center" justifyContent="center">
          <ExpandableLabel expanded={isExpanded} onClick={() => setIsExpanded((prev) => !prev)}>
            {isExpanded ? t('Hide') : t('Details')}
          </ExpandableLabel>
        </Flex>
      </CardFooter>
    </AuctionDetailsCard>
  )
}

export default AuctionDetails
