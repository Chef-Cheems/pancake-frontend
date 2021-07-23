import React, { useState } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import {
  Text,
  Card,
  Flex,
  Box,
  PrizeIcon,
  OpenNewIcon,
  BunnyPlaceholderIcon,
  Skeleton,
  Button,
} from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { usePriceCakeBusd } from 'state/farms/hooks'
import EllipsisMenu, { OptionProps } from 'components/EllipsisMenu/EllipsisMenu'
import { getBscScanLink } from 'utils'
import { TabToggleGroup, TabToggle } from './TabToggle'
import { Auction, Bidder } from '../useCurrentFarmAuction'

const AuctionLeaderboardCard = styled(Card)`
  overflow: visible;
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
  auction: Auction
  bidders: Bidder[]
}

enum Tabs {
  Latest,
  Archive,
}

const EllipsisMenuA: React.FC<{ bidder: Bidder }> = ({ bidder }) => {
  const { t } = useTranslation()
  const handleSortOptionChange = (option: OptionProps) => {
    window.open(option.value, '_blank').focus()
  }

  const { projectSite, lpAddress, account } = bidder

  const options = []
  if (projectSite) {
    options.push({
      label: t('Project Site'),
      value: projectSite,
      icon: <OpenNewIcon />,
    })
  }
  if (lpAddress) {
    options.push({
      label: t('LP Info'),
      value: `http://pancakeswap.info/pool/${lpAddress}`,
      icon: <OpenNewIcon />,
    })
  }
  options.push({
    label: t('Bidder Address'),
    value: getBscScanLink(account, 'address'),
    icon: <OpenNewIcon />,
  })
  return <EllipsisMenu options={options} onChange={handleSortOptionChange} />
}

interface LeaderboardRowProps {
  isTopPosition: boolean
  bidder: Bidder
  cakePriceBusd: BigNumber
}

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ isTopPosition, bidder, cakePriceBusd }) => {
  return (
    <>
      <GridCell isTopPosition={isTopPosition}>
        <Flex pl="24px">
          {isTopPosition && <PrizeIcon color="warning" height="24px" width="24px" />}
          <Text bold={isTopPosition} textTransform="uppercase" ml="8px">
            #{bidder.position}
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
        <Flex flexDirection="column" width="100%" justifyContent="flex-end">
          <Text bold textTransform="uppercase" width="100%" textAlign="right" pr="24px">
            {bidder.amount} CAKE
          </Text>
          {cakePriceBusd.gt(0) ? (
            <Text fontSize="12px" color="textSubtle" textAlign="right" pr="24px">
              {cakePriceBusd.times(bidder.amount).toNumber().toFixed(2)}
            </Text>
          ) : (
            <Flex justifyContent="flex-end" pr="24px">
              <Skeleton width="64px" />
            </Flex>
          )}
        </Flex>
      </GridCell>
      <GridCell isTopPosition={isTopPosition}>
        <EllipsisMenuA bidder={bidder} />
      </GridCell>
    </>
  )
}

const CurrentAuctionCard: React.FC<AuctionLeaderboardProps> = ({ auction, bidders }) => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState(Tabs.Latest)
  const [visibleBidders, setVisibleBidders] = useState(10)
  const cakePriceBusd = usePriceCakeBusd()

  if (!auction || !bidders) {
    return (
      <AuctionLeaderboardCard>
        <TabToggleGroup>
          <TabToggle isActive={activeTab === Tabs.Latest} onClick={() => setActiveTab(Tabs.Latest)}>
            {t('Latest')}
          </TabToggle>
          <TabToggle isActive={activeTab === Tabs.Archive} onClick={() => setActiveTab(Tabs.Archive)}>
            Archive
          </TabToggle>
        </TabToggleGroup>
        <Text bold fontSize="20px" p="24px">
          Auction ???
        </Text>
        <Flex justifyContent="center" alignItems="center" flexDirection="column">
          <Text>Loading</Text>
        </Flex>
      </AuctionLeaderboardCard>
    )
  }
  const { id } = auction
  const totalBidders = bidders.length

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
        Auction #{id}
      </Text>
      {bidders.length > 0 ? (
        <Box>
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
            {bidders.slice(0, visibleBidders).map((bidder) => (
              <LeaderboardRow
                key={bidder.account}
                bidder={bidder}
                isTopPosition={bidder.position <= auction.topLeaderboard}
                cakePriceBusd={cakePriceBusd}
              />
            ))}
          </LeaderboardContainer>
          <Flex mt="16px" flexDirection="column" justifyContent="center" alignItems="center">
            {visibleBidders <= 10 && (
              <Text color="textSubtle">Showing top 10 bids only. See all whitelisted bidders</Text>
            )}
            {visibleBidders !== totalBidders && (
              <Button
                mt="16px"
                variant="text"
                onClick={() =>
                  setVisibleBidders((prev) => {
                    if (totalBidders - prev > 10) {
                      return prev + 10
                    }
                    return totalBidders
                  })
                }
              >
                Show more
              </Button>
            )}
          </Flex>
        </Box>
      ) : (
        <Flex justifyContent="center" alignItems="center" flexDirection="column" mb="24px">
          <Text>No bids yet</Text>
          <BunnyPlaceholderIcon height="64px" width="64px" />
        </Flex>
      )}
    </AuctionLeaderboardCard>
  )
}

export default CurrentAuctionCard
