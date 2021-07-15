import React from 'react'
import { Flex, useModal, CalculateIcon, Skeleton, FlexProps, Button } from '@pancakeswap/uikit'
import { BASE_EXCHANGE_URL } from 'config'
import RoiCalculatorModal from 'components/RoiCalculatorModal'
import Balance from 'components/Balance'
import { Pool } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import { getAprData } from 'views/Pools/helpers'
import { getAddress } from 'utils/addressHelpers'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from 'utils/bigNumber'

interface AprProps extends FlexProps {
  pool: Pool
  stakedBalance: BigNumber
  showIcon: boolean
  performanceFee?: number
}

const Apr: React.FC<AprProps> = ({ pool, showIcon, stakedBalance, performanceFee = 0, ...props }) => {
  const { stakingToken, earningToken, isFinished, earningTokenPrice, stakingTokenPrice, userData, apr } = pool
  const { t } = useTranslation()

  const { apr: earningsPercentageToDisplay, roundingDecimals, autoCompoundFrequency } = getAprData(pool, performanceFee)

  const stakingTokenBalance = userData?.stakingTokenBalance ? new BigNumber(userData.stakingTokenBalance) : BIG_ZERO

  const apyModalLink =
    stakingToken.address && `${BASE_EXCHANGE_URL}/#/swap?outputCurrency=${getAddress(stakingToken.address)}`

  const [onPresentApyModal] = useModal(
    <RoiCalculatorModal
      earningTokenPrice={earningTokenPrice}
      stakingTokenPrice={stakingTokenPrice}
      stakingTokenBalance={stakedBalance.plus(stakingTokenBalance)}
      apr={apr}
      stakingTokenSymbol={stakingToken.symbol}
      linkLabel={t('Get %symbol%', { symbol: stakingToken.symbol })}
      linkHref={apyModalLink || BASE_EXCHANGE_URL}
      earningTokenSymbol={earningToken.symbol}
      roundingDecimals={roundingDecimals}
      autoCompoundFrequency={autoCompoundFrequency}
      performanceFee={performanceFee}
    />,
  )

  const openRoiModal = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    onPresentApyModal()
  }

  return (
    <Flex alignItems="center" justifyContent="space-between" {...props}>
      {earningsPercentageToDisplay || isFinished ? (
        <>
          <Balance
            onClick={openRoiModal}
            fontSize="16px"
            isDisabled={isFinished}
            value={isFinished ? 0 : earningsPercentageToDisplay}
            decimals={2}
            unit="%"
          />
          {!isFinished && showIcon && (
            <Button onClick={openRoiModal} variant="text" width="20px" height="20px" padding="0px" marginLeft="4px">
              <CalculateIcon color="textSubtle" width="20px" />
            </Button>
          )}
        </>
      ) : (
        <Skeleton width="80px" height="16px" />
      )}
    </Flex>
  )
}

export default Apr
