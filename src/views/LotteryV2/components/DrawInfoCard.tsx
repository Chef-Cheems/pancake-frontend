import React from 'react'
import styled from 'styled-components'
import { Card, CardHeader, CardBody, Flex, Heading, Text } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { useLottery } from 'state/hooks'

const DrawInfoCard = () => {
  const { t } = useTranslation()
  const {
    currentLotteryId,
    currentRound: { endTime },
  } = useLottery()

  const endDate = new Date(parseInt(endTime, 10) * 1000)

  console.log(endDate.toLocaleTimeString())

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
      <Flex>
        <Heading>{t('Prize Pot')}</Heading>
      </Flex>
      <CardBody>ss</CardBody>
    </Card>
  )
}

export default DrawInfoCard
