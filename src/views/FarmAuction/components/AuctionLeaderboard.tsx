import React, { useState } from 'react'
import styled from 'styled-components'
import {
  Text,
  Heading,
  Card,
  CardHeader,
  CardBody,
  Flex,
  Box,
  PrizeIcon,
  EllipsisIcon,
  BunnyPlaceholderIcon,
  Skeleton,
} from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { TabToggleGroup, TabToggle } from './TabToggle'

const AuctionLeaderboardCard = styled(Card)`
  flex: 2;
`

const LeaderboardContainer = styled.div`
  display: grid;
  grid-template-columns: 5fr 5fr 5fr 1fr;
`

const GridCell = styled(Flex)<{ isTopPosition }>`
  height: 65px;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};

  ${({ theme, isTopPosition }) =>
    isTopPosition &&
    `
    background-color: ${theme.colors.warning}2D;
  `}
`

interface AuctionLeaderboardProps {
  auction: any
  bidders: any
}

enum Tabs {
  Latest,
  Archive,
}

const LeaderboardRow = ({ position, isTopPosition, bidder, cakePriceBusd }) => {
  return (
    <>
      <GridCell isTopPosition={isTopPosition}>
        <Flex pl="24px">
          {isTopPosition && <PrizeIcon color="warning" height="24px" width="24px" />}
          <Text bold={isTopPosition} textTransform="uppercase" ml="8px">
            #{position}
          </Text>
        </Flex>
      </GridCell>
      <GridCell isTopPosition={isTopPosition}>
        <Flex flexDirection="column">
          <Text bold={isTopPosition} textTransform="uppercase">
            {bidder.farmName} (1x)
          </Text>
          <Text fontSize="12px" color="textSubtle">
            {bidder.tokenName}
          </Text>
        </Flex>
      </GridCell>
      <GridCell isTopPosition={isTopPosition}>
        <Flex flexDirection="column">
          <Text bold textTransform="uppercase" width="100%" textAlign="right" pr="24px">
            {bidder.amount} CAKE
          </Text>
          {cakePriceBusd.gt(0) ? (
            <Text fontSize="12px" color="textSubtle">
              {cakePriceBusd.times(bidder.amount).toNumber().toFixed(2)}
            </Text>
          ) : (
            <Skeleton width="64px" />
          )}
        </Flex>
      </GridCell>
      <GridCell isTopPosition={isTopPosition}>
        <EllipsisIcon />
      </GridCell>
    </>
  )
}

const CurrentAuctionCard: React.FC<AuctionLeaderboardProps> = ({ auction, bidders }) => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState(Tabs.Latest)
  const cakePriceBusd = usePriceCakeBusd()

  if (!auction) {
    return (
      <AuctionLeaderboardCard>
        <TabToggleGroup>
          <TabToggle isActive={activeTab === Tabs.Latest} onClick={() => setActiveTab(Tabs.Latest)}>
            Latest
          </TabToggle>
          <TabToggle isActive={activeTab === Tabs.Archive} onClick={() => setActiveTab(Tabs.Archive)}>
            Archive
          </TabToggle>
        </TabToggleGroup>
        <Text bold fontSize="20px" p="24px">
          Auction #1
        </Text>
        <Flex justifyContent="center" alignItems="center" flexDirection="column">
          <Text>Loading</Text>
        </Flex>
      </AuctionLeaderboardCard>
    )
  }
  // const { startBlock, endBlock, startDate, endDate } = auction

  return (
    <AuctionLeaderboardCard>
      <TabToggleGroup>
        <TabToggle isActive={activeTab === Tabs.Latest} onClick={() => setActiveTab(Tabs.Latest)}>
          Latest
        </TabToggle>
        <TabToggle isActive={activeTab === Tabs.Archive} onClick={() => setActiveTab(Tabs.Archive)}>
          Archive
        </TabToggle>
      </TabToggleGroup>
      <Text bold fontSize="20px" p="24px">
        Auction #1
      </Text>
      {bidders.length > 0 ? (
        <LeaderboardContainer>
          <Text color="secondary" bold fontSize="12px" textTransform="uppercase" pl="24px">
            Position
          </Text>
          <Text color="secondary" bold fontSize="12px" textTransform="uppercase">
            Farm
          </Text>
          <Text color="secondary" bold fontSize="12px" textTransform="uppercase" textAlign="right" pr="24px">
            Total bid
          </Text>
          <Box />
          {/* Rows */}
          {bidders.map((bidder) => (
            <LeaderboardRow
              key={bidder.account}
              bidder={bidder}
              position={bidder.position}
              isTopPosition={bidder.position <= auction.topLeaderboard}
              cakePriceBusd={cakePriceBusd}
            />
          ))}
        </LeaderboardContainer>
      ) : (
        <Flex justifyContent="center" alignItems="center" flexDirection="column">
          <Text>No bids yet</Text>
          <BunnyPlaceholderIcon height="64px" width="64px" />
        </Flex>
      )}
    </AuctionLeaderboardCard>
  )
}

export default CurrentAuctionCard
