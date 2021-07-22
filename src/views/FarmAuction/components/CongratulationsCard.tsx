import React from 'react'
import styled from 'styled-components'
import { Text, Heading, Card, CardHeader, CardBody, Flex } from '@pancakeswap/uikit'
import { Auction, Bidder } from 'config/constants/types'
import { useTranslation } from 'contexts/Localization'
import { CAKE_PER_WEEK_1X_FARM } from 'config'
import { whitelistedBidders } from 'config/constants/farmAuctions'
import useCongratulateAuctionWinner from '../hooks/useCongratulateAuctionWinner'
import { FarmSchedule } from './AuctionDetailsCard/AuctionSchedule'

const StyledReclaimBidCard = styled(Card)`
  margin-top: 16px;
  flex: 1;
`

const CongratulationsCard: React.FC<{ currentAuction: Auction; bidders: Bidder[] }> = ({ currentAuction, bidders }) => {
  const { t } = useTranslation()
  const wonAuction = useCongratulateAuctionWinner(currentAuction, bidders)

  if (!wonAuction) {
    return null
  }

  const { auction, bidderData } = wonAuction
  return (
    <StyledReclaimBidCard mb={['24px', null, null, '0']}>
      <CardHeader>
        <Heading>{t('Congratulations!')}</Heading>
      </CardHeader>
      <CardBody>
        <Text mb="16px">Your bid in Auction #{auction.id} was successful.</Text>
        <Text>Your Farm will be launched as follows:</Text>
        <Flex flexDirection="column" mb="24px">
          <Flex justifyContent="space-between" width="100%" pt="8px">
            <Text color="textSubtle">Weekly CAKE rewards per farm</Text>
            <Text>{CAKE_PER_WEEK_1X_FARM.toLocaleString()}</Text>
          </Flex>
          <Flex justifyContent="space-between" width="100%" pt="8px">
            <Text color="textSubtle">Multiplier per farm</Text>
            <Text>1x</Text>
          </Flex>
          <Flex justifyContent="space-between" width="100%" pt="8px">
            <Text color="textSubtle">Total whitelisted bidders</Text>
            <Text>{whitelistedBidders.length}</Text>
          </Flex>
          <FarmSchedule auction={auction} showForClosedAuction />
        </Flex>

        <Flex justifyContent="space-between" mb="8px">
          <Text color="textSubtle">Your total bid</Text>
          <Text>{bidderData.amount} CAKE</Text>
        </Flex>
        <Flex justifyContent="space-between">
          <Text color="textSubtle">Your position</Text>
          <Text>#{bidderData.position}</Text>
        </Flex>
      </CardBody>
    </StyledReclaimBidCard>
  )
}

export default CongratulationsCard
