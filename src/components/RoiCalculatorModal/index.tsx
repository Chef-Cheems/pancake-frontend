import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import {
  Modal,
  Text,
  LinkExternal,
  Button,
  Flex,
  Box,
  Grid,
  ButtonMenu,
  Checkbox,
  PencilIcon,
  BalanceInput,
  HelpIcon,
  CheckmarkIcon,
  ButtonMenuItem,
  Input,
  useTooltip,
} from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'contexts/Localization'
import { getBalanceNumber } from 'utils/formatBalance'
import { getInterestBreakdown, getPrincipalForInterest, getApy, getRoi } from 'utils/compoundApyHelpers'
import useActiveWeb3React from 'hooks/useActiveWeb3React'

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

const TopPart = styled(Box)`
  background: ${({ theme }) => theme.colors.gradients.bubblegum};
  padding: 24px;
`

const Footer = styled(Flex)`
  background: ${({ theme }) => theme.colors.dropdown};
`

const StyledModal = styled(Modal)`
  & > :nth-child(2) {
    padding: 0;
  }
`

const ScrollableContainer = styled.div`
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

const RoiInputContainer = styled(Flex)`
  position: relative;
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

const BulletList = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;

  li {
    margin: 0;
    padding: 0;
  }

  li::before {
    content: '•';
    margin-right: 4px;
  }

  li::marker {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.textSubtle};
  }
`

const compoundingIndexToFrequency = {
  0: 2,
  1: 1,
  2: 0.142857142, // once every 7 days
  3: 0.033333333, // once every 30 days
}

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
  const [stakeDuration, setStakeDuration] = useState(3)
  const [stakingTokenUSDValue, setStakingTokenUSDValue] = useState('')
  const [compoundingFrequency, setCompoundingFrequency] = useState(1)
  const [isEditingRoi, setIsEditingRoi] = useState(false)
  const [showBasedOnExpectedRoi, setShowBasedOnExpectedRow] = useState(false)
  const [expectedRoi, setExpectedRoi] = useState('')
  const [compound, setCompound] = useState(true)
  const balanceInputRef = useRef<HTMLInputElement | null>(null)

  const stakingTokensAmount = new BigNumber(stakingTokenUSDValue).div(stakingTokenPrice)

  useEffect(() => {
    if (balanceInputRef.current) {
      balanceInputRef.current.focus()
    }
  }, [])

  const {
    targetRef: myBalanceRef,
    tooltip: myBalanceTooltip,
    tooltipVisible: myBalanceTooltipVisible,
  } = useTooltip(
    isFarm
      ? t('“My Balance” here includes both LP Tokens in your wallet, and LP Tokens already staked in this farm.')
      : t(
          '“My Balance” here includes both %assetSymbol% in your wallet, and %assetSymbol% already staked in this pool.',
          { assetSymbol: stakingTokenSymbol },
        ),
    { placement: 'top-end', tooltipOffset: [20, 10] },
  )

  const {
    targetRef: multiplierRef,
    tooltip: multiplierTooltip,
    tooltipVisible: multiplierTooltipVisible,
  } = useTooltip(
    <>
      <Text>
        The Multiplier represents the proportion of CAKE rewards each farm receives, as a proportion of the CAKE
        produced each block.
      </Text>
      <Text>For example, if a 1x farm received 1 CAKE per block, a 40x farm would receive 40 CAKE per block.</Text>
      <Text>This amount is already included in all APR calculations for the farm.</Text>
    </>,
    { placement: 'top-end', tooltipOffset: [20, 10] },
  )

  const manualCompoundFrequency = compound ? compoundingFrequency : 0
  const interestBreakdown = getInterestBreakdown({
    investmentAmount: parseFloat(stakingTokenUSDValue),
    apr,
    earningTokenPrice,
    compoundFrequency: autoCompoundFrequency > 0 ? autoCompoundFrequency : manualCompoundFrequency,
    performanceFee,
  })

  const handleChangeCompoundingFrequency = (index: number) => {
    setCompoundingFrequency(compoundingIndexToFrequency[index])
  }

  const setInvestmentUSDValue = (amount: string) => {
    setStakingTokenUSDValue(amount)
  }

  const handleExpectedRoiChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExpectedRoi(event.currentTarget.value)
  }

  const handleBalanceInputChange = (value) => {
    setShowBasedOnExpectedRow(false)
    setStakingTokenUSDValue(value)
  }

  const onExitRoiEditing = () => {
    setShowBasedOnExpectedRow(true)
    setIsEditingRoi(false)
  }

  const activeCompoundingEveryIndex = parseInt(
    Object.keys(compoundingIndexToFrequency).find((key) => compoundingIndexToFrequency[key] === compoundingFrequency),
    10,
  )

  const principalForExpectedRoi = getPrincipalForInterest(expectedRoi, apr, compoundingFrequency)

  const roi = getRoiData({
    investment: parseFloat(stakingTokenUSDValue),
    interest: interestBreakdown[stakeDuration],
    tokenPrice: earningTokenPrice,
    isEditingRoi,
    expectedRoi,
    showBasedOnExpectedRoi,
  })

  useEffect(() => {
    if (showBasedOnExpectedRoi) {
      setStakingTokenUSDValue(principalForExpectedRoi[stakeDuration].toFixed(2))
    }
  }, [stakeDuration, showBasedOnExpectedRoi, principalForExpectedRoi])

  return (
    <StyledModal title={t('ROI Calculator')} onDismiss={onDismiss}>
      <TopPart>
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
                  value={expectedRoi}
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
                  $ {roi.usd}
                </Text>
                <Text color="textSubtle">
                  ({roi.percentage}
                  %)
                </Text>
              </Flex>
              <PencilIcon color="primary" onClick={() => setIsEditingRoi(true)} />{' '}
            </>
          )}
        </Flex>
        <Text fontSize="12px" color="textSubtle">
          ~ {roi.token} {earningTokenSymbol}
        </Text>
      </TopPart>

      <ScrollableContainer>
        <Flex p="24px" flexDirection="column">
          <Text color="secondary" bold fontSize="12px" textTransform="uppercase">
            {stakingTokenSymbol} {t('Token value')}
          </Text>
          <InvestmentInputContainer>
            <BalanceInput
              currencyValue={`${
                stakingTokensAmount.gt(0) ? stakingTokensAmount.toFixed(10) : '0.0'
              } ${stakingTokenSymbol}`}
              innerRef={balanceInputRef}
              placeholder="0.0"
              value={stakingTokenUSDValue}
              onUserInput={handleBalanceInputChange}
            />
          </InvestmentInputContainer>
          <Flex justifyContent="space-between" mt="8px">
            <Button scale="xs" mx="2px" p="4px 16px" variant="tertiary" onClick={() => setInvestmentUSDValue('100')}>
              $100
            </Button>
            <Button scale="xs" mx="2px" p="4px 16px" variant="tertiary" onClick={() => setInvestmentUSDValue('1000')}>
              $1000
            </Button>
            <Button
              disabled={stakingTokenBalance.lte(0) || !account}
              scale="xs"
              mx="2px"
              p="4px 16px"
              variant="tertiary"
              onClick={() =>
                setInvestmentUSDValue(getBalanceNumber(stakingTokenBalance.times(stakingTokenPrice)).toString())
              }
            >
              {t('My Balance').toLocaleUpperCase()}
            </Button>
            <span ref={myBalanceRef}>
              <HelpIcon width="16px" height="16px" color="textSubtle" />
            </span>
            {myBalanceTooltipVisible && myBalanceTooltip}
          </Flex>
          <Text mt="24px" color="secondary" bold fontSize="12px" textTransform="uppercase">
            {t('Staked for')}
          </Text>
          <FullWidthButtonMenu activeIndex={stakeDuration} onItemClick={setStakeDuration} scale="sm">
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
                  <Checkbox scale="sm" checked={compound} onChange={() => setCompound((prev) => !prev)} />
                </Flex>
                <Flex flex="6">
                  <FullWidthButtonMenu
                    disabled={!compound}
                    activeIndex={compound ? activeCompoundingEveryIndex : -1}
                    onItemClick={handleChangeCompoundingFrequency}
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

        <Footer p="24px" flexDirection="column" maxWidth="320px">
          <Grid gridTemplateColumns="2.5fr 1fr" gridTemplateRows="repeat(4, auto)">
            {isFarm && (
              <>
                <Text color="textSubtle" small>
                  {t('APR (incl. LP rewards)')}
                </Text>
                <Text small textAlign="right">
                  {displayApr}%
                </Text>
              </>
            )}
            <Text color="textSubtle" small>
              {isFarm ? t('Base APR (yield only)') : t('APR')}
            </Text>
            <Text small textAlign="right">
              {apr.toFixed(roundingDecimals)}%
            </Text>
            <Text color="textSubtle" small>
              {t('APY (%compoundTimes%x daily compound)', {
                compoundTimes: autoCompoundFrequency > 0 ? autoCompoundFrequency : 1,
              })}
            </Text>
            <Text small textAlign="right">
              {getApy(apr, autoCompoundFrequency > 0 ? autoCompoundFrequency : 1, 365, performanceFee)}%
            </Text>
            {isFarm && (
              <>
                <Text color="textSubtle" small>
                  {t('Farm Multiplier')}
                </Text>
                <Flex justifyContent="flex-end" alignItems="flex-end">
                  <Text small textAlign="right" mr="4px">
                    {multiplier}
                  </Text>
                  <span ref={multiplierRef}>
                    <HelpIcon color="textSubtle" width="16px" height="16px" />
                  </span>
                  {multiplierTooltipVisible && multiplierTooltip}
                </Flex>
              </>
            )}
          </Grid>
          <BulletList>
            <li>
              <Text fontSize="12px" textAlign="center" color="textSubtle" display="inline">
                {t('Calculated based on current rates.')}
              </Text>
            </li>
            {isFarm && (
              <li>
                <Text fontSize="12px" textAlign="center" color="textSubtle" display="inline">
                  {t('LP rewards: 0.17% trading fees, distributed proportionally among LP token holders.')}
                </Text>
              </li>
            )}
            <li>
              <Text fontSize="12px" textAlign="center" color="textSubtle" display="inline">
                {t(
                  'All figures are estimates provided for your convenience only, and by no means represent guaranteed returns.',
                )}
              </Text>
            </li>
            {performanceFee > 0 && (
              <li>
                <Text mt="14px" fontSize="12px" textAlign="center" color="textSubtle" display="inline">
                  {t('All estimated rates take into account this pool’s %fee%% performance fee', {
                    fee: performanceFee,
                  })}
                </Text>
              </li>
            )}
          </BulletList>
          <Flex justifyContent="center">
            <LinkExternal href={linkHref}>{linkLabel}</LinkExternal>
          </Flex>
        </Footer>
      </ScrollableContainer>
    </StyledModal>
  )
}

export default RoiCalculatorModal
