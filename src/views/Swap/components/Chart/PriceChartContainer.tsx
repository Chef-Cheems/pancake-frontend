import useTheme from 'hooks/useTheme'
import React, { useState } from 'react'
import { useFetchPairPrices, useSwapActionHandlers } from 'state/swap/hooks'
import { PairDataTimeWindowEnum } from 'state/swap/types'
import { DEFAULT_INPUT_ADDRESS } from './constants'
import PriceChart from './PriceChart'

const PriceChartContainer = ({
  inputCurrencyId,
  inputCurrency,
  outputCurrency,
  outputCurrencyId,
  isChartExpanded,
  setIsChartExpanded,
}) => {
  const [timeWindow, setTimeWindow] = useState<PairDataTimeWindowEnum>(0)
  const token0Address =
    inputCurrencyId && inputCurrencyId !== 'BNB' ? String(inputCurrencyId).toLowerCase() : DEFAULT_INPUT_ADDRESS
  const token1Address = outputCurrencyId ? String(outputCurrencyId).toLowerCase() : ''

  const { pairPrices, pairId } = useFetchPairPrices({ token0Address, token1Address, timeWindow })
  const { onSwitchTokens } = useSwapActionHandlers()
  const { isDark } = useTheme()
  const showPriceChart = (!pairPrices || pairPrices.length > 0) && pairId !== null

  return (
    showPriceChart && (
      <PriceChart
        lineChartData={pairPrices}
        timeWindow={timeWindow}
        setTimeWindow={setTimeWindow}
        inputCurrency={inputCurrency}
        outputCurrency={outputCurrency}
        onSwitchTokens={onSwitchTokens}
        isDark={isDark}
        isChartExpanded={isChartExpanded}
        setIsChartExpanded={setIsChartExpanded}
      />
    )
  )
}

export default PriceChartContainer