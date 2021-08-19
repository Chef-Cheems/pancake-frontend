import React, { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { Flex, Box, Text, Heading, Card } from '@pancakeswap/uikit'
import { format, fromUnixTime } from 'date-fns'
import { useTranslation } from 'contexts/Localization'
import Page from 'components/layout/Page'
import LineChart from 'components/LineChart'
import TokenTable from 'components/InfoTables/TokensTable'
import PoolTable from 'components/InfoTables/PoolsTable'
import { notEmpty } from 'utils/infoUtils'
import { formatAmount } from 'utils/formatInfoNumbers'
import useTheme from 'hooks/useTheme'
import BarChart from 'components/BarChart'
import {
  useAllPoolData,
  useAllTokenData,
  useProtocolChartData,
  useProtocolData,
  useProtocolTransactions,
} from 'state/info/hooks'
import TransactionTable from 'components/InfoTables/TransactionsTable'

export const ChartCardsContainer = styled(Flex)`
  justify-content: space-between;
  flex-direction: column;
  width: 100%;
  padding: 0;
  gap: 1em;

  & > * {
    width: 100%;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: row;
  } ;
`

const Overview: React.FC = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [liquidityHover, setLiquidityHover] = useState<number | undefined>()
  const [liquidityDateHover, setLiquidityDateHover] = useState<string | undefined>()
  const [volumeHover, setVolumeHover] = useState<number | undefined>()
  const [volumeDateHover, setVolumeDateHover] = useState<string | undefined>()

  const [protocolData] = useProtocolData()
  const [chartData] = useProtocolChartData()
  const [transactions] = useProtocolTransactions()

  const currentDate = format(new Date(), 'MMM d, yyyy')

  // TODO: Why its not coming from chart data?
  // if hover value undefined, reset to current day value
  useEffect(() => {
    if (volumeHover == null && protocolData) {
      setVolumeHover(protocolData.volumeUSD)
    }
  }, [protocolData, volumeHover])
  useEffect(() => {
    if (liquidityHover == null && protocolData) {
      setLiquidityHover(protocolData.liquidityUSD)
    }
  }, [liquidityHover, protocolData])

  const formattedLiquidityData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: fromUnixTime(day.date),
          value: day.liquidityUSD,
        }
      })
    }
    return []
  }, [chartData])

  const formattedVolumeData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: fromUnixTime(day.date),
          value: day.volumeUSD,
        }
      })
    }
    return []
  }, [chartData])

  const allTokens = useAllTokenData()

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens)
      .map((token) => token.data)
      .filter(notEmpty)
  }, [allTokens])

  const allPoolData = useAllPoolData()
  const poolDatas = useMemo(() => {
    return Object.values(allPoolData)
      .map((pool) => pool.data)
      .filter(notEmpty)
  }, [allPoolData])

  return (
    <Page>
      <Heading scale="lg" mb="16px">
        {t('PancakeSwap Info & Analytics')}
      </Heading>
      <ChartCardsContainer>
        <Card>
          <Box p={['16px', '16px', '24px']}>
            <Box>
              <Text bold color="secondary">
                {t('Liquidity')}
              </Text>
              <Text bold fontSize="24px">
                ${formatAmount(liquidityHover)}
              </Text>
              <Text>{liquidityDateHover ?? currentDate}</Text>
            </Box>
            <LineChart
              data={formattedLiquidityData}
              color={theme.colors.secondary}
              setValue={setLiquidityHover}
              setLabel={setLiquidityDateHover}
            />
          </Box>
        </Card>
        <Card>
          <Box p={['16px', '16px', '24px']}>
            <Box>
              <Text bold color="secondary">
                {t('Volume 24H')}
              </Text>
              <Text bold fontSize="24px">
                ${formatAmount(volumeHover)}
              </Text>
              <Text>{volumeDateHover ?? currentDate}</Text>
            </Box>
            <BarChart
              data={formattedVolumeData}
              color={theme.colors.primary}
              setValue={setVolumeHover}
              setLabel={setVolumeDateHover}
            />
          </Box>
        </Card>
      </ChartCardsContainer>
      <Heading scale="lg" mt="40px" mb="16px">
        {t('Top Tokens')}
      </Heading>
      <TokenTable tokenDatas={formattedTokens} />
      <Heading scale="lg" mt="40px" mb="16px">
        {t('Top Pools')}
      </Heading>
      <PoolTable poolDatas={poolDatas} />
      <Heading scale="lg" mt="40px" mb="16px">
        {t('Transactions')}
      </Heading>
      <TransactionTable transactions={transactions} />
    </Page>
  )
}

export default Overview
