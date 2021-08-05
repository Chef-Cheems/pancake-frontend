import React, { useRef, useEffect } from 'react'
import styled from 'styled-components'
import { Box, Flex, Text, Input, CheckmarkIcon, PencilIcon, IconButton } from '@pancakeswap/uikit'
import { getRoi } from 'utils/compoundApyHelpers'
import { useTranslation } from 'contexts/Localization'
import { CalculatorMode, RoiCalculatorReducerState } from './useRoiCalculatorReducer'

const MILLION = 1000000
const TRILLION = 1000000000000

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

const RoiInputContainer = styled(Box)`
  position: relative;
  & > input {
    padding-left: 28px;
    max-width: 70%;
  }
  &:before {
    position: absolute;
    content: '$';
    color: ${({ theme }) => theme.colors.textSubtle};
    left: 16px;
    top: 8px;
  }
`

const RoiDisplayContainer = styled(Flex)`
  max-width: 82%;
  margin-right: 8px;
`

const RoiDollarAmount = styled(Text)<{ fadeOut: boolean }>`
  position: relative;
  overflow-x: auto;
  &::-webkit-scrollbar {
    height: 0px;
  }

  ${({ fadeOut, theme }) =>
    fadeOut &&
    `
      &:after {
        background: linear-gradient(
          to right,
          ${theme.colors.background}00,
          ${theme.colors.background}E6
        );
        content: '';
        height: 100%;
        pointer-events: none;
        position: absolute;
        right: 0;
        top: 0;
        width: 40px;
      }
  `}
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
  calculatorState: RoiCalculatorReducerState
  setTargetRoi: (amount: string) => void
  setCalculatorMode: (mode: CalculatorMode) => void
}

const RoiCard: React.FC<RoiCardProps> = ({ earningTokenSymbol, calculatorState, setTargetRoi, setCalculatorMode }) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { targetRoiAsUSD, targetRoiAsTokens, roiUSD, roiTokens, roiPercentage } = calculatorState.data
  const { mode } = calculatorState.controls

  const { t } = useTranslation()

  useEffect(() => {
    if (mode === CalculatorMode.PRINCIPAL_BASED_ON_ROI && inputRef.current) {
      inputRef.current.focus()
    }
  }, [mode])

  const onEnterEditing = () => {
    setCalculatorMode(CalculatorMode.PRINCIPAL_BASED_ON_ROI)
  }

  const onExitRoiEditing = () => {
    setCalculatorMode(CalculatorMode.ROI_BASED_ON_PRINCIPAL)
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
        <Flex justifyContent="space-between" mt="4px" height="36px">
          {mode === CalculatorMode.PRINCIPAL_BASED_ON_ROI ? (
            <>
              <RoiInputContainer>
                <Input
                  ref={inputRef}
                  type="number"
                  inputMode="decimal"
                  pattern="\d*"
                  scale="sm"
                  value={targetRoiAsUSD}
                  placeholder="0.0"
                  onChange={handleExpectedRoiChange}
                />
              </RoiInputContainer>
              <IconButton scale="sm" variant="text" onClick={onExitRoiEditing}>
                <CheckmarkIcon color="primary" />
              </IconButton>
            </>
          ) : (
            <>
              <RoiDisplayContainer onClick={onEnterEditing}>
                {/* Dollar sign is separate cause its not supposed to scroll with a number if number is huge */}
                <Text fontSize="24px" bold>
                  $
                </Text>
                <RoiDollarAmount fontSize="24px" bold fadeOut={roiUSD > TRILLION}>
                  {roiUSD.toLocaleString('en', {
                    minimumFractionDigits: roiUSD > MILLION ? 0 : 2,
                    maximumFractionDigits: roiUSD > MILLION ? 0 : 2,
                  })}
                </RoiDollarAmount>
              </RoiDisplayContainer>
              <IconButton scale="sm" variant="text" onClick={onEnterEditing}>
                <PencilIcon color="primary" />
              </IconButton>
            </>
          )}
        </Flex>
        {mode === CalculatorMode.PRINCIPAL_BASED_ON_ROI ? (
          <Text fontSize="12px" color="textSubtle">
            ~ {targetRoiAsTokens.toNumber().toLocaleString()} {earningTokenSymbol}
          </Text>
        ) : (
          <Text fontSize="12px" color="textSubtle">
            ~ {roiTokens} {earningTokenSymbol} (
            {roiPercentage.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            %)
          </Text>
        )}
      </RoiCardInner>
    </RoiCardWrapper>
  )
}

export default RoiCard