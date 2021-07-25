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
  Spinner,
  useTooltip,
} from '@pancakeswap/uikit'
import { getBscScanLink } from 'utils'
import EllipsisMenu, { OptionProps } from 'components/EllipsisMenu/EllipsisMenu'
import { useTranslation } from 'contexts/Localization'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { Auction, Bidder } from 'config/constants/types'

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
  topLeaderboard: number
  bidder: Bidder
  cakePriceBusd: BigNumber
}

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ topLeaderboard, bidder, cakePriceBusd }) => {
  const { t } = useTranslation()
  const isTopPosition = bidder.position <= topLeaderboard
  const { tooltip, targetRef, tooltipVisible } = useTooltip(
    <Text>
      {t('Top %num% bidders at the end of the auction will successfully create a community farm.', {
        num: topLeaderboard,
      })}
    </Text>,
    { placement: 'bottom' },
  )
  return (
    <>
      <GridCell isTopPosition={isTopPosition}>
        <Flex pl="24px" ref={targetRef}>
          {isTopPosition && <PrizeIcon color="warning" height="24px" width="24px" />}
          <Text bold={isTopPosition} textTransform="uppercase" ml="8px">
            #{bidder.position}
          </Text>
          {tooltipVisible && isTopPosition && tooltip}
        </Flex>
      </GridCell>
      <GridCell isTopPosition={isTopPosition}>
        <Flex flexDirection="column">
          <Flex>
            <Text bold={isTopPosition} textTransform="uppercase" mr="4px">
              {bidder.farmName}
            </Text>
            <Text>(1x)</Text>
          </Flex>
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

const AuctionLeaderboardTable: React.FC<{ auction: Auction; bidders: Bidder[]; noBidsText: string }> = ({
  auction,
  bidders,
  noBidsText,
}) => {
  const [visibleBidders, setVisibleBidders] = useState(10)
  const cakePriceBusd = usePriceCakeBusd()

  const totalBidders = bidders.length

  if (totalBidders === 0) {
    return (
      <Flex justifyContent="center" alignItems="center" flexDirection="column" my="24px">
        <Text mb="8px">{noBidsText}</Text>
        <BunnyPlaceholderIcon height="64px" width="64px" />
      </Flex>
    )
  }
  return (
    <Box>
      <LeaderboardContainer>
        <Text color="secondary" bold fontSize="12px" textTransform="uppercase" pl="24px" py="16px">
          Position
        </Text>
        <Text color="secondary" bold fontSize="12px" textTransform="uppercase" py="16px">
          Farm
        </Text>
        <Text color="secondary" bold fontSize="12px" textTransform="uppercase" textAlign="right" pr="24px" py="16px">
          Total bid
        </Text>
        <Box />
        {/* Rows */}
        {bidders.slice(0, visibleBidders).map((bidder) => (
          <LeaderboardRow
            key={bidder.account}
            bidder={bidder}
            topLeaderboard={auction.topLeaderboard}
            cakePriceBusd={cakePriceBusd}
          />
        ))}
      </LeaderboardContainer>
      <Flex mt="16px" flexDirection="column" justifyContent="center" alignItems="center">
        {visibleBidders <= 10 && totalBidders > 10 && (
          <Text color="textSubtle">Showing top 10 bids only. See all whitelisted bidders</Text>
        )}
        {visibleBidders < totalBidders && (
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
  )
}

export default AuctionLeaderboardTable
