import React, { useState } from 'react'
import styled from 'styled-components'
import { Box, Flex, Text, Input, CheckmarkIcon, PencilIcon } from '@pancakeswap/uikit'
import { getRoi } from 'utils/compoundApyHelpers'
import { useTranslation } from 'contexts/Localization'
import { CalculatorMode, RoiCalculatorReducerState } from './useRoiCalculatorReducer'

const RoiCardWrapper = styled(Box)`
  background: linear-gradient(180deg, #53dee9, #7645d9);
  padding: 1px;
  width: 100%;
  border-radius: ${({ theme }) => theme.radii.default};
`

const RoiCardInner = styled(Box)`
  height: 120px;
  padding: 24px;
  border-radius: ${({ theme }) => theme.radii.default};
  background: ${({ theme }) => theme.colors.gradients.bubblegum};
`

const RoiInputContainer = styled(Flex)`
  margin: 8px 0;
  position: relative;
  max-width: 80%;
  & > input {
    padding-left: 28px;
  }
  &:before {
    position: absolute;
    content: '$';
    color: ${({ theme }) => theme.colors.textSubtle};
    left: 16px;
    top: 8px;
  }
`

const getRoiData = ({ investment, interest, tokenPrice, isEditingRoi, expectedRoi, showBasedOnExpectedRoi }) => {
  if (isEditingRoi) {
    const expectedTokenRoi = parseFloat(expectedRoi) / tokenPrice
    return {
      usd: 0,
      percentage: 0,
      token: Number.isNaN(expectedTokenRoi) ? 0 : expectedTokenRoi,
    }
  }
  if (showBasedOnExpectedRoi) {
    const tokenRoi = expectedRoi / tokenPrice
    const percentage = getRoi({
      amountEarned: expectedRoi,
      amountInvested: investment,
    })
    return {
      usd: expectedRoi ?? '0.00',
      percentage: percentage ? percentage.toFixed(2) : '0.00',
      token: tokenRoi ? tokenRoi.toFixed(3) : '0.000',
    }
  }
  if (Number.isNaN(interest)) {
    return {
      usd: 0,
      percentage: 0,
      token: 0,
    }
  }
  return {
    usd: (interest * tokenPrice).toFixed(2),
    percentage: getRoi({
      amountEarned: interest * tokenPrice,
      amountInvested: investment,
    }).toFixed(2),
    token: interest,
  }
}

interface RoiCardProps {
  earningTokenSymbol: string
  calculatorData: RoiCalculatorReducerState['data']
  setTargetRoi: (amount: string) => void
  setCalculatorMode: (mode: CalculatorMode) => void
}

const RoiCard: React.FC<RoiCardProps> = ({ earningTokenSymbol, calculatorData, setTargetRoi, setCalculatorMode }) => {
  const [isEditingRoi, setIsEditingRoi] = useState(false)
  const { targetRoi, roiUSD, roiTokens, roiPercentage } = calculatorData

  const { t } = useTranslation()

  const onEnterEditing = () => {
    setCalculatorMode(CalculatorMode.PRINCIPAL_BASED_ON_ROI)
    setIsEditingRoi(true)
  }

  const onExitRoiEditing = () => {
    // TODO eh?
    setCalculatorMode(CalculatorMode.ROI_BASED_ON_PRINCIPAL)
    setIsEditingRoi(false)
  }
  const handleExpectedRoiChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTargetRoi(event.currentTarget.value)
  }
  return (
    <RoiCardWrapper>
      <RoiCardInner>
        <Text fontSize="12px" color="secondary" bold textTransform="uppercase">
          {t('ROI at current rates')}
        </Text>
        <Flex justifyContent="space-between">
          {isEditingRoi ? (
            <>
              <RoiInputContainer>
                <Input
                  type="number"
                  inputMode="decimal"
                  pattern="\d*"
                  scale="sm"
                  value={targetRoi}
                  placeholder="0.0"
                  onChange={handleExpectedRoiChange}
                />
              </RoiInputContainer>
              <CheckmarkIcon color="primary" onClick={onExitRoiEditing} />
            </>
          ) : (
            <>
              <Flex alignItems="center">
                <Text fontSize="24px" bold mr="8px">
                  $ {roiUSD.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text color="textSubtle">
                  ({roiPercentage.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  %)
                </Text>
              </Flex>
              <PencilIcon color="primary" onClick={onEnterEditing} />
            </>
          )}
        </Flex>
        <Text fontSize="12px" color="textSubtle">
          ~ {roiTokens} {earningTokenSymbol}
        </Text>
      </RoiCardInner>
    </RoiCardWrapper>
  )
}

export default RoiCard
