import React from 'react'
import { Flex, ArrowDownIcon, ArrowUpIcon } from '@pancakeswap/uikit'
import styled, { keyframes } from 'styled-components'
import { CalculatorMode, RoiCalculatorReducerState } from './useRoiCalculatorReducer'

const rotate = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.35);
  }
  100% {
    transform: scale(1);
  }
`

const ArrowContainer = styled(Flex)`
  & > svg {
    animation: 0.35s ${rotate} linear;
  }
`

interface AnimatedArrowProps {
  mode: CalculatorMode
  calculatorData: RoiCalculatorReducerState['data']
}

const AnimatedArrow: React.FC<AnimatedArrowProps> = ({ mode, calculatorData }) => {
  const { roiUSD, roiTokens, roiPercentage } = calculatorData
  const key = `${roiUSD}${roiTokens}${roiPercentage}`
  return (
    <ArrowContainer justifyContent="center" my="24px" key={key}>
      {mode === CalculatorMode.ROI_BASED_ON_PRINCIPAL ? <ArrowDownIcon /> : <ArrowUpIcon />}
    </ArrowContainer>
  )
}

export default AnimatedArrow
