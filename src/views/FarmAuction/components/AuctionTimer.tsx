import React from 'react'
import styled from 'styled-components'
import { isAfter, differenceInSeconds } from 'date-fns'
import { Text, Flex, PocketWatchIcon, Skeleton } from '@pancakeswap/uikit'
import { Auction, AuctionStatus } from 'config/constants/types'
import getTimePeriods from 'utils/getTimePeriods'
import { useTranslation } from 'contexts/Localization'

const AuctionCountDown = styled(Flex)`
  align-items: flex-end;
  margin: 0 16px 0 16px;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.textSubtle};
`

const AuctionTimer: React.FC<{ auction: Auction }> = ({ auction }) => {
  const { t } = useTranslation()
  if (!auction) {
    return (
      <Flex justifyContent="center" alignItems="center" mb="48px">
        <Skeleton width="256px" height="40px" />
      </Flex>
    )
  }
  if (auction.status === AuctionStatus.ToBeAnnounced || auction.status === AuctionStatus.Close) {
    return null
  }
  const { startDate, endDate } = auction
  const timerUntil = isAfter(startDate, new Date()) ? startDate : endDate
  const timerTitle = timerUntil === endDate ? t('Ending in') : t('Next auction')
  const secondsRemaining = differenceInSeconds(timerUntil, new Date())
  const { days, hours, minutes } = getTimePeriods(secondsRemaining)
  return (
    <Flex justifyContent="center" alignItems="center" mb="48px">
      <Text bold>{timerTitle}</Text>
      <AuctionCountDown>
        {days !== 0 && (
          <>
            <Text verticalAlign="baseline" lineHeight="28px" fontSize="24px" bold color="secondary" mr="4px">
              {days}
            </Text>
            <Text verticalAlign="baseline" bold mr="4px">
              d
            </Text>
          </>
        )}
        <Text verticalAlign="baseline" lineHeight="28px" fontSize="24px" bold color="secondary" mr="4px">
          {hours}
        </Text>
        <Text verticalAlign="baseline" bold mr="4px">
          h
        </Text>
        <Text verticalAlign="baseline" lineHeight="28px" fontSize="24px" bold color="secondary" mr="4px">
          {minutes}
        </Text>
        <Text verticalAlign="baseline" bold>
          m
        </Text>
      </AuctionCountDown>
      <PocketWatchIcon height="40px" width="40px" />
    </Flex>
  )
}

export default AuctionTimer
