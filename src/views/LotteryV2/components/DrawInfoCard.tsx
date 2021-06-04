import React from 'react'
import styled from 'styled-components'
import { Card, CardHeader, CardBody, Flex, Heading, Text, Skeleton, Button, useModal } from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'contexts/Localization'
import { useLottery, usePriceCakeBusd } from 'state/hooks'
import { getBalanceNumber, getFullDisplayBalance } from 'utils/formatBalance'
import Balance from 'components/Balance'
import BuyTicketsModal from './BuyTicketsModal'
import ViewTicketsModal from './ViewTicketsModal'

const DrawInfoCard = () => {
  const { t } = useTranslation()
  const {
    currentLotteryId,
    currentRound: { endTime, amountCollectedInCake, userData },
  } = useLottery()
  const [onPresentBuyTicketsModal] = useModal(<BuyTicketsModal />)
  const [onPresentViewTicketsModal] = useModal(<ViewTicketsModal roundId={currentLotteryId} />)

  // TODO: Re-enebale in prod
  //   const cakePriceBusd = usePriceCakeBusd()
  const cakePriceBusd = new BigNumber(20.55)
  const prizeInBusd = amountCollectedInCake.times(cakePriceBusd)
  const endDate = new Date(parseInt(endTime, 10) * 1000)

  const userTicketCount = userData?.tickets?.length || 0

  return (
    <Card>
      <CardHeader p="16px 24px">
        <Flex justifyContent="space-between">
          <Heading>{t('Next Draw')}</Heading>
          <Text>
            #{currentLotteryId} | {endDate.toLocaleString()}
          </Text>
        </Flex>
      </CardHeader>
      <CardBody>
        <Flex>
          <Heading>{t('Prize Pot')}</Heading>
          <Flex flexDirection="column">
            {prizeInBusd.gt(0) ? (
              <Balance
                lineHeight="1"
                color="secondary"
                fontSize="40px"
                bold
                prefix="~$"
                value={getBalanceNumber(prizeInBusd)}
                decimals={0}
              />
            ) : (
              <Skeleton my="7px" height={40} width={160} />
            )}
            {prizeInBusd.gt(0) ? (
              <Balance
                color="textSubtle"
                fontSize="14px"
                value={getBalanceNumber(amountCollectedInCake)}
                unit=" CAKE"
                decimals={0}
              />
            ) : (
              <Skeleton my="2px" height={14} width={90} />
            )}
          </Flex>
        </Flex>
        <Flex>
          <Heading mr="32px">{t('Your tickets')}</Heading>
          <Flex flexDirection="column">
            <Flex>
              <Text display="inline">{t('You have')} </Text>
              {!userData.isLoading ? (
                <Text display="inline" bold mx="4px">
                  {userTicketCount} {t('tickets')}
                </Text>
              ) : (
                <Skeleton mx="4px" height={20} width={40} />
              )}
              <Text display="inline"> {t('this round')}</Text>
            </Flex>
            {!userData.isLoading && userTicketCount > 0 && (
              <Button
                onClick={onPresentViewTicketsModal}
                height="auto"
                width="fit-content"
                p="0"
                variant="text"
                scale="sm"
              >
                {t('View your tickets')}
              </Button>
            )}
          </Flex>
          <Button onClick={onPresentBuyTicketsModal}>{t('Buy Tickets')}</Button>
        </Flex>
      </CardBody>

      <CardBody>ss</CardBody>
    </Card>
  )
}

export default DrawInfoCard
