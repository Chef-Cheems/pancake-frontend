import React from 'react'
import styled from 'styled-components'
import { format } from 'date-fns'
import { Text, Flex, Box } from '@pancakeswap/uikit'
import { Auction, AuctionStatus } from 'config/constants/types'
import { useTranslation } from 'contexts/Localization'

const ScheduleInner = styled(Flex)`
  flex-direction: column;
  padding: 16px;
  border-radius: ${({ theme }) => theme.radii.default};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px ${({ theme }) => theme.colors.cardBorder} solid;
`

interface ScheduleProps {
  auction: Auction
}

export const AuctionSchedule: React.FC<ScheduleProps> = ({ auction }) => {
  const { startBlock, endBlock, startDate, endDate, status } = auction
  const { t } = useTranslation()

  return (
    <>
      <Text fontSize="12px" bold color="secondary" textTransform="uppercase" mb="8px">
        {t('Auction Schedule')}
      </Text>
      <ScheduleInner>
        {status !== AuctionStatus.ToBeAnnounced && (
          <Flex justifyContent="space-between" mb="8px">
            <Text color="textSubtle">{t('Auction duration')}</Text>
            <Text>{t('%numHours% hours', { numHours: '~24' })}</Text>
          </Flex>
        )}
        <Flex justifyContent="space-between" mb="8px">
          <Text color="textSubtle">{t('Start')}</Text>
          {status === AuctionStatus.ToBeAnnounced ? (
            <Text>{t('To be announced')}</Text>
          ) : (
            <Box>
              <Text>{format(startDate, 'MMMM dd yyyy hh:mm aa')}</Text>
              <Text textAlign="right">Block {startBlock}</Text>
            </Box>
          )}
        </Flex>
        <Flex justifyContent="space-between">
          <Text color="textSubtle">{t('End')}</Text>
          {status === AuctionStatus.ToBeAnnounced ? (
            <Text>{t('To be announced')}</Text>
          ) : (
            <Box>
              <Text>{format(endDate, 'MMMM dd yyyy hh:mm aa')}</Text>
              <Text textAlign="right">Block {endBlock}</Text>
            </Box>
          )}
        </Flex>
      </ScheduleInner>
    </>
  )
}

export const FarmSchedule: React.FC<ScheduleProps> = ({ auction }) => {
  const { status, farmStartBlock, farmEndBlock, farmStartDate, farmEndDate } = auction
  const { t } = useTranslation()
  return (
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
          {status === AuctionStatus.ToBeAnnounced ? (
            <Text>{t('To be announced')}</Text>
          ) : (
            <Box>
              <Text>{format(farmStartDate, 'MMMM dd yyyy hh:mm aa')}</Text>
              <Text textAlign="right">Block {farmStartBlock}</Text>
            </Box>
          )}
        </Flex>
        <Flex justifyContent="space-between">
          <Text color="textSubtle">{t('End')}</Text>
          {status === AuctionStatus.ToBeAnnounced ? (
            <Text>{t('To be announced')}</Text>
          ) : (
            <Box>
              <Text>{format(farmEndDate, 'MMMM dd yyyy hh:mm aa')}</Text>
              <Text textAlign="right">Block {farmEndBlock}</Text>
            </Box>
          )}
        </Flex>
      </ScheduleInner>
    </Flex>
  )
}
