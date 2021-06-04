import React from 'react'
import styled from 'styled-components'
import { CardHeader, Card, CardBody, Text, CardFooter, Box, Flex } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'

const Grid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
`

const YourHistoryCard = () => {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>{t('Rounds')}</CardHeader>
      <CardBody>
        <Grid>
          <Text bold fontSize="12px" color="secondary">
            #
          </Text>
          <Text bold fontSize="12px" color="secondary" textTransform="uppercase">
            {t('Date')}
          </Text>
          <Text bold fontSize="12px" color="secondary" textTransform="uppercase">
            {t('Your Tickets')}
          </Text>
        </Grid>
        <Grid>
          <Text bold fontSize="12px" color="secondary">
            234
          </Text>
          <Text bold fontSize="12px" color="secondary" textTransform="uppercase">
            some date
          </Text>
          <Text bold fontSize="12px" color="secondary" textTransform="uppercase">
            12 and an icon
          </Text>
          <Text bold fontSize="12px" color="secondary" textTransform="uppercase">
            chevron
          </Text>
          <Text bold fontSize="12px" color="secondary">
            234
          </Text>
          <Text bold fontSize="12px" color="secondary" textTransform="uppercase">
            some date
          </Text>
          <Text bold fontSize="12px" color="secondary" textTransform="uppercase">
            12 and an icon
          </Text>
          <Text bold fontSize="12px" color="secondary" textTransform="uppercase">
            chevron
          </Text>
        </Grid>
      </CardBody>
      <CardFooter>
        <Flex flexDirection="column" justifyContent="center" alignItems="center">
          <Text fontSize="12px" color="textSubtle">
            {t('Only showing data for Lottery V2')}
          </Text>
        </Flex>
      </CardFooter>
    </Card>
  )
}

export default YourHistoryCard
