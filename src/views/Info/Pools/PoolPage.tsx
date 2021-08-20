/* eslint-disable no-nested-ternary */
import React, { useMemo, useState } from 'react'
import { RouteComponentProps, Link } from 'react-router-dom'
import { format, fromUnixTime } from 'date-fns'
import {
  Text,
  Flex,
  Box,
  Button,
  Card,
  Breadcrumbs,
  Heading,
  Spinner,
  LinkExternal,
  useMatchBreakpoints,
  ButtonMenu,
  ButtonMenuItem,
  HelpIcon,
  useTooltip,
} from '@pancakeswap/uikit'
import styled from 'styled-components'
import Page from 'components/Layout/Page'
import { getBscscanLink } from 'utils/infoUtils'
import { CurrencyLogo, DoubleCurrencyLogo } from 'components/CurrencyLogo'
import { formatAmount } from 'utils/formatInfoNumbers'
import Percent from 'components/Percent'
import SaveIcon from 'components/SaveIcon'
import { usePoolDatas, usePoolChartData, usePoolTransactions } from 'state/info/hooks'
import LineChart from 'components/LineChart'
import BarChart from 'components/BarChart'
import TransactionTable from 'components/InfoTables/TransactionsTable'
import { useWatchlistPools } from 'state/user/hooks'
import { TabToggleGroup, TabToggle } from 'components/TabToggle'
import useTheme from 'hooks/useTheme'
import { useTranslation } from 'contexts/Localization'

const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-gap: 1em;
  margin-top: 16px;
  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
`

const TokenButton = styled(Flex)`
  padding: 8px 0px;
  margin-right: 16px;
  :hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const LockedTokensContainer = styled(Flex)`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background-color: ${({ theme }) => theme.colors.background};
  padding: 16px;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  border-radius: 16px;
  max-width: 280px;
`

enum ChartView {
  TVL,
  VOL,
  PRICE,
  DENSITY,
}

const PoolPage: React.FC<RouteComponentProps<{ address: string }>> = ({
  match: {
    params: { address: routeAddress },
  },
}) => {
  const { theme } = useTheme()
  const { isXs, isSm } = useMatchBreakpoints()
  const { t } = useTranslation()
  const [showWeeklyData, setShowWeeklyData] = useState(0)
  const { tooltip, tooltipVisible, targetRef } = useTooltip(
    t(`Based on last 7 days' performance. Does not account for impermanent loss`),
    {},
  )

  // In case somebody pastes checksummed address into url (since GraphQL expects lowercase address)
  const address = routeAddress.toLowerCase()

  const currentDate = format(new Date(), 'MMM d, yyyy')

  // token data
  const poolData = usePoolDatas([address])[0]
  const chartData = usePoolChartData(address)
  const transactions = usePoolTransactions(address)

  const [view, setView] = useState(ChartView.VOL)
  const [latestValue, setLatestValue] = useState<number | undefined>()
  const [valueLabel, setValueLabel] = useState<string | undefined>()

  const formattedTvlData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: fromUnixTime(day.date),
          value: day.totalValueLockedUSD,
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

  // watchlist
  const [savedPools, addSavedPool] = useWatchlistPools()

  return (
    <Page symbol={poolData ? `${poolData?.token0.symbol} / ${poolData?.token1.symbol}` : null}>
      {poolData ? (
        <>
          <Flex justifyContent="space-between" mb="16px" flexDirection={['column', 'column', 'row']}>
            <Breadcrumbs mb="32px">
              <Link to="/">
                <Text color="primary">{t('Home')}</Text>
              </Link>
              <Link to="/pools">
                <Text color="primary">{t('Pools')}</Text>
              </Link>
              <Flex>
                <Text mr="8px">{`${poolData.token0.symbol} / ${poolData.token1.symbol}`}</Text>
              </Flex>
            </Breadcrumbs>
            <Flex justifyContent={[null, null, 'flex-end']} mt={['8px', '8px', 0]}>
              <LinkExternal mr="8px" href={getBscscanLink(address, 'address')}>
                {t('View on BscScan')}
              </LinkExternal>
              <SaveIcon fill={savedPools.includes(address)} onClick={() => addSavedPool(address)} />
            </Flex>
          </Flex>
          <Flex flexDirection="column">
            <Flex alignItems="center" mb={['8px', null]}>
              <DoubleCurrencyLogo address0={poolData.token0.address} address1={poolData.token1.address} size={32} />
              <Text
                ml="38px"
                bold
                fontSize={isXs || isSm ? '24px' : '40px'}
              >{`${poolData.token0.symbol} / ${poolData.token1.symbol}`}</Text>
            </Flex>
            <Flex justifyContent="space-between" flexDirection={['column', 'column', 'column', 'row']}>
              <Flex flexDirection={['column', 'column', 'row']} mb={['8px', '8px', null]}>
                <Link to={`/info/token/${poolData.token0.address}`}>
                  <TokenButton>
                    <CurrencyLogo address={poolData.token0.address} size="24px" />
                    <Text fontSize="16px" ml="4px" style={{ whiteSpace: 'nowrap' }} width="fit-content">
                      {`1 ${poolData.token0.symbol} =  ${formatAmount(poolData.token1Price, {
                        notation: 'standard',
                        displayThreshold: 0.001,
                        tokenPrecision: true,
                      })} ${poolData.token1.symbol}`}
                    </Text>
                  </TokenButton>
                </Link>
                <Link to={`/info/token/${poolData.token1.address}`}>
                  <TokenButton ml={[null, null, '10px']}>
                    <CurrencyLogo address={poolData.token1.address} size="24px" />
                    <Text fontSize="16px" ml="4px" style={{ whiteSpace: 'nowrap' }} width="fit-content">
                      {`1 ${poolData.token1.symbol} =  ${formatAmount(poolData.token0Price, {
                        notation: 'standard',
                        displayThreshold: 0.001,
                        tokenPrecision: true,
                      })} ${poolData.token0.symbol}`}
                    </Text>
                  </TokenButton>
                </Link>
              </Flex>
              <Flex>
                <a
                  href={`https://exchange.pancakeswap.finance/#/add/${poolData.token0.address}/${poolData.token1.address}`}
                >
                  <Button mr="8px" variant="secondary">
                    {t('Add Liquidity')}
                  </Button>
                </a>
                <a
                  href={`https://exchange.pancakeswap.finance/#/swap?inputCurrency=${poolData.token0.address}&outputCurrency=${poolData.token1.address}`}
                >
                  <Button>{t('Trade')}</Button>
                </a>
              </Flex>
            </Flex>
          </Flex>
          <ContentLayout>
            <Box>
              <Card>
                <Box p="24px">
                  <Flex justifyContent="space-between">
                    <Flex flex="1" flexDirection="column">
                      <Text color="secondary" bold fontSize="12px" textTransform="uppercase">
                        {t('Liquidity')}
                      </Text>
                      <Text fontSize="24px" bold>
                        ${formatAmount(poolData.tvlUSD)}
                      </Text>
                      <Percent value={poolData.tvlUSDChange} />
                    </Flex>
                    <Flex flex="1" flexDirection="column">
                      <Text color="secondary" bold fontSize="12px" textTransform="uppercase">
                        {t('LP reward APR')}
                      </Text>
                      <Text fontSize="24px" bold>
                        {formatAmount(poolData.lpApr7d)}%
                      </Text>
                      <Flex alignItems="center">
                        <span ref={targetRef}>
                          <HelpIcon color="textSubtle" />
                        </span>
                        <Text ml="4px" fontSize="12px" color="textSubtle">
                          {t('7D performance')}
                        </Text>
                        {tooltipVisible && tooltip}
                      </Flex>
                    </Flex>
                  </Flex>
                  <Text color="secondary" bold mt="24px" fontSize="12px" textTransform="uppercase">
                    {t('Total Tokens Locked')}
                  </Text>
                  <LockedTokensContainer>
                    <Flex justifyContent="space-between">
                      <Flex>
                        <CurrencyLogo address={poolData.token0.address} size="24px" />
                        <Text small color="textSubtle" ml="8px">
                          {poolData.token0.symbol}
                        </Text>
                      </Flex>
                      <Text small>{formatAmount(poolData.tvlToken0)}</Text>
                    </Flex>
                    <Flex justifyContent="space-between">
                      <Flex>
                        <CurrencyLogo address={poolData.token1.address} size="24px" />
                        <Text small color="textSubtle" ml="8px">
                          {poolData.token1.symbol}
                        </Text>
                      </Flex>
                      <Text small>{formatAmount(poolData.tvlToken1)}</Text>
                    </Flex>
                  </LockedTokensContainer>
                </Box>
              </Card>
              <Card mt="16px">
                <Flex flexDirection="column" p="24px">
                  <ButtonMenu
                    activeIndex={showWeeklyData}
                    onItemClick={(index) => setShowWeeklyData(index)}
                    scale="sm"
                    variant="subtle"
                  >
                    <ButtonMenuItem width="100%">{t('24H')}</ButtonMenuItem>
                    <ButtonMenuItem width="100%">{t('7D')}</ButtonMenuItem>
                  </ButtonMenu>
                  <Flex mt="24px">
                    <Flex flex="1" flexDirection="column">
                      <Text color="secondary" fontSize="12px" bold textTransform="uppercase">
                        {showWeeklyData ? t('Volume 7D') : t('Volume 24H')}
                      </Text>
                      <Text fontSize="24px" bold>
                        ${showWeeklyData ? formatAmount(poolData.volumeUSDWeek) : formatAmount(poolData.volumeUSD)}
                      </Text>
                      <Percent value={showWeeklyData ? poolData.volumeUSDChangeWeek : poolData.volumeUSDChange} />
                    </Flex>
                    <Flex flex="1" flexDirection="column">
                      <Text color="secondary" fontSize="12px" bold textTransform="uppercase">
                        {showWeeklyData ? t('LP reward fees 7D') : t('LP reward fees 24H')}
                      </Text>
                      <Text fontSize="24px" bold>
                        ${showWeeklyData ? formatAmount(poolData.lpFees7d) : formatAmount(poolData.lpFees24h)}
                      </Text>
                      <Text color="textSubtle" fontSize="12px">
                        {t('out of %totalFees% total fees', {
                          totalFees: showWeeklyData
                            ? formatAmount(poolData.totalFees7d)
                            : formatAmount(poolData.totalFees24h),
                        })}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Card>
            </Box>
            <Card>
              <TabToggleGroup>
                <TabToggle isActive={view === ChartView.VOL} onClick={() => setView(ChartView.VOL)}>
                  <Text>{t('Volume')}</Text>
                </TabToggle>
                <TabToggle isActive={view === ChartView.TVL} onClick={() => setView(ChartView.TVL)}>
                  <Text>{t('Liquidity')}</Text>
                </TabToggle>
              </TabToggleGroup>
              <Flex flexDirection="column" px="24px" pt="24px">
                <Text fontSize="24px" bold>
                  $
                  {latestValue
                    ? formatAmount(latestValue)
                    : view === ChartView.VOL
                    ? formatAmount(formattedVolumeData[formattedVolumeData.length - 1]?.value)
                    : view === ChartView.DENSITY
                    ? ''
                    : formatAmount(formattedTvlData[formattedTvlData.length - 1]?.value)}
                </Text>

                <Text small>{valueLabel || currentDate}</Text>
              </Flex>

              <Box px="24px">
                {view === ChartView.TVL ? (
                  <LineChart
                    data={formattedTvlData}
                    setLabel={setValueLabel}
                    color={theme.colors.primary}
                    height="335px"
                    chartHeight="335px"
                    setValue={setLatestValue}
                    value={latestValue}
                    label={valueLabel}
                  />
                ) : (
                  <BarChart
                    data={formattedVolumeData}
                    color={theme.colors.primary}
                    height="335px"
                    chartHeight="335px"
                    setValue={setLatestValue}
                    setLabel={setValueLabel}
                    value={latestValue}
                    label={valueLabel}
                  />
                )}
              </Box>
            </Card>
          </ContentLayout>
          <Heading mb="16px" mt="40px" scale="lg">
            {t('Transactions')}
          </Heading>
          <TransactionTable transactions={transactions} />
        </>
      ) : (
        <Flex mt="80px" justifyContent="center">
          <Spinner />
        </Flex>
      )}
    </Page>
  )
}

export default PoolPage
