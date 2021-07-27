import React, { useState } from 'react'
import styled from 'styled-components'
import { Text, Flex, Box, CardFooter, ExpandableLabel } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { Auction, AuctionStatus } from 'config/constants/types'
import { whitelistedBidders } from 'config/constants/farmAuctions'
import { CAKE_PER_WEEK_1X_FARM } from 'config'
import { FarmSchedule } from './AuctionSchedule'

const FooterInner = styled(Box)`
  background-color: ${({ theme }) => theme.colors.dropdown};
`

const AuctionFooter: React.FC<{ auction: Auction }> = ({ auction }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { t } = useTranslation()
  const { topLeaderboard, status } = auction

  const isLiveOrPendingAuction = status === AuctionStatus.Pending || status === AuctionStatus.Open

  return (
    <CardFooter p="0">
      {isExpanded && (
        <FooterInner>
          <Flex p="16px" flexDirection="column">
            {isLiveOrPendingAuction && (
              <Flex justifyContent="space-between" width="100%" pt="8px" px="8px">
                <Text color="textSubtle">Farms available</Text>
                <Text>
                  {topLeaderboard} (top {topLeaderboard} bidders)
                </Text>
              </Flex>
            )}
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
            <FarmSchedule auction={auction} />
          </Flex>
        </FooterInner>
      )}
      <Flex p="8px" alignItems="center" justifyContent="center">
        <ExpandableLabel expanded={isExpanded} onClick={() => setIsExpanded((prev) => !prev)}>
          {isExpanded ? t('Hide') : t('Details')}
        </ExpandableLabel>
      </Flex>
    </CardFooter>
  )
}

export default AuctionFooter
