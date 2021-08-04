import React, { useRef, useEffect } from 'react'
import styled from 'styled-components'
import {
  Modal,
  Text,
  Button,
  Flex,
  Box,
  ButtonMenu,
  Checkbox,
  BalanceInput,
  HelpIcon,
  ButtonMenuItem,
  useTooltip,
  ArrowDownIcon,
} from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'contexts/Localization'
import { getBalanceNumber } from 'utils/formatBalance'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import RoiCalculatorFooter from './RoiCalculatorFooter'
import RoiCard from './RoiCard'
import useRoiCalculatorReducer from './useRoiCalculatorReducer'

interface RoiCalculatorModalProps {
  onDismiss?: () => void
  earningTokenPrice: number
  apr: number
  displayApr?: string
  linkLabel: string
  linkHref: string
  stakingTokenBalance: BigNumber
  stakingTokenSymbol: string
  stakingTokenPrice: number
  earningTokenSymbol?: string
  multiplier?: string
  roundingDecimals?: number
  autoCompoundFrequency?: number
  performanceFee?: number
  isFarm?: boolean
}

const StyledModal = styled(Modal)`
  max-width: 345px;
  & > :nth-child(2) {
    padding: 0;
  }
`

const ScrollableContainer = styled.div`
  padding: 24px;
  max-height: 500px;
  overflow-y: scroll;
  ${({ theme }) => theme.mediaQueries.sm} {
    max-height: none;
  }
`

const FullWidthButtonMenu = styled(ButtonMenu)<{ disabled?: boolean }>`
  width: 100%;

  & > button {
    width: 100%;
  }

  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`

const InvestmentInputContainer = styled.div`
  position: relative;

  & input {
    padding-right: 34px;
  }

  &:before {
    position: absolute;
    content: 'USD';
    color: ${({ theme }) => theme.colors.textSubtle};
    right: 16px;
    top: 21px;
  }
`

const RoiCalculatorModal: React.FC<RoiCalculatorModalProps> = ({
  onDismiss,
  earningTokenPrice,
  apr,
  displayApr,
  linkLabel,
  linkHref,
  stakingTokenBalance,
  stakingTokenSymbol,
  stakingTokenPrice,
  multiplier,
  earningTokenSymbol = 'CAKE',
  roundingDecimals = 2,
  autoCompoundFrequency = 0,
  performanceFee = 0,
  isFarm = false,
}) => {
  const { t } = useTranslation()
  const { account } = useActiveWeb3React()
  const balanceInputRef = useRef<HTMLInputElement | null>(null)

  const {
    state,
    setInvestmentUSDValue,
    setStakingDuration,
    toggleCompounding,
    setCompoundingFrequency,
    setCalculatorMode,
    setTargetRoi,
  } = useRoiCalculatorReducer(stakingTokenPrice, earningTokenPrice, apr, autoCompoundFrequency, performanceFee)

  const { compounding, activeCompoundingIndex, stakingDuration } = state.controls
  const { stakingTokenUSDValue, stakingTokenAmount } = state.data
  console.log('stakingTokenUSDValue', stakingTokenUSDValue)

  // Auto-focus input on opening modal
  useEffect(() => {
    if (balanceInputRef.current) {
      balanceInputRef.current.focus()
    }
  }, [])

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    isFarm
      ? t('“My Balance” here includes both LP Tokens in your wallet, and LP Tokens already staked in this farm.')
      : t(
          '“My Balance” here includes both %assetSymbol% in your wallet, and %assetSymbol% already staked in this pool.',
          { assetSymbol: stakingTokenSymbol },
        ),
    { placement: 'top-end', tooltipOffset: [20, 10] },
  )

  return (
    <StyledModal title={t('ROI Calculator')} onDismiss={onDismiss}>
      <ScrollableContainer>
        <Flex flexDirection="column" mb="8px">
          <Text color="secondary" bold fontSize="12px" textTransform="uppercase">
            {stakingTokenSymbol} {t('Token value')}
          </Text>
          <InvestmentInputContainer>
            <BalanceInput
              currencyValue={`${
                stakingTokenAmount.gt(0) ? stakingTokenAmount.toFixed(10) : '0.0'
              } ${stakingTokenSymbol}`}
              innerRef={balanceInputRef}
              placeholder="0.0"
              value={stakingTokenUSDValue}
              onUserInput={setInvestmentUSDValue}
            />
          </InvestmentInputContainer>
          <Flex justifyContent="space-between" mt="8px">
            <Button
              scale="xs"
              p="4px 16px"
              width="68px"
              variant="tertiary"
              onClick={() => setInvestmentUSDValue('100')}
            >
              $100
            </Button>
            <Button
              scale="xs"
              p="4px 16px"
              width="68px"
              variant="tertiary"
              onClick={() => setInvestmentUSDValue('1000')}
            >
              $1000
            </Button>
            <Button
              disabled={stakingTokenBalance.lte(0) || !account}
              scale="xs"
              p="4px 16px"
              width="128px"
              variant="tertiary"
              onClick={() =>
                setInvestmentUSDValue(getBalanceNumber(stakingTokenBalance.times(stakingTokenPrice)).toString())
              }
            >
              {t('My Balance').toLocaleUpperCase()}
            </Button>
            <span ref={targetRef}>
              <HelpIcon width="16px" height="16px" color="textSubtle" />
            </span>
            {tooltipVisible && tooltip}
          </Flex>
          <Text mt="24px" color="secondary" bold fontSize="12px" textTransform="uppercase">
            {t('Staked for')}
          </Text>
          <FullWidthButtonMenu activeIndex={stakingDuration} onItemClick={setStakingDuration} scale="sm">
            <ButtonMenuItem variant="tertiary">{t('1D')}</ButtonMenuItem>
            <ButtonMenuItem variant="tertiary">{t('7D')}</ButtonMenuItem>
            <ButtonMenuItem variant="tertiary">{t('30D')}</ButtonMenuItem>
            <ButtonMenuItem variant="tertiary">{t('1Y')}</ButtonMenuItem>
          </FullWidthButtonMenu>
          {autoCompoundFrequency === 0 && (
            <>
              <Text mt="24px" color="secondary" bold fontSize="12px" textTransform="uppercase">
                {t('Compounding every')}
              </Text>
              <Flex alignItems="center">
                <Flex flex="1">
                  <Checkbox scale="sm" checked={compounding} onChange={toggleCompounding} />
                </Flex>
                <Flex flex="6">
                  <FullWidthButtonMenu
                    disabled={!compounding}
                    activeIndex={activeCompoundingIndex}
                    onItemClick={setCompoundingFrequency}
                    scale="sm"
                  >
                    <ButtonMenuItem>{t('12H')}</ButtonMenuItem>
                    <ButtonMenuItem>{t('1D')}</ButtonMenuItem>
                    <ButtonMenuItem>{t('7D')}</ButtonMenuItem>
                    <ButtonMenuItem>{t('30D')}</ButtonMenuItem>
                  </FullWidthButtonMenu>
                </Flex>
              </Flex>
            </>
          )}
        </Flex>
        <Flex justifyContent="center" my="24px">
          <ArrowDownIcon />
        </Flex>
        <Flex>
          <RoiCard
            earningTokenSymbol={earningTokenSymbol}
            calculatorData={state.data}
            setTargetRoi={setTargetRoi}
            setCalculatorMode={setCalculatorMode}
          />
        </Flex>
      </ScrollableContainer>
      <RoiCalculatorFooter
        isFarm={isFarm}
        apr={apr}
        displayApr={displayApr}
        roundingDecimals={roundingDecimals}
        autoCompoundFrequency={autoCompoundFrequency}
        multiplier={multiplier}
        linkLabel={linkLabel}
        linkHref={linkHref}
        performanceFee={performanceFee}
      />
    </StyledModal>
  )
}

export default RoiCalculatorModal
