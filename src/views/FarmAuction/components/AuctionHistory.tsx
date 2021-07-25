import React, { useState } from 'react'
import { format } from 'date-fns'
import styled from 'styled-components'
import {
  Text,
  Flex,
  Box,
  Input,
  ArrowBackIcon,
  ArrowForwardIcon,
  ArrowLastIcon,
  IconButton,
  BunnyPlaceholderIcon,
  Spinner,
} from '@pancakeswap/uikit'
import useAuctionHistory from '../hooks/useAuctionHistory'
import AuctionLeaderboardTable from './AuctionLeaderboard/AuctionLeaderboardTable'

interface AuctionHistoryProps {
  mostRecentClosedAuctionId: number
}

const StyledIconButton = styled(IconButton)`
  width: 32px;

  :disabled {
    background: none;

    svg {
      fill: ${({ theme }) => theme.colors.textDisabled};

      path {
        fill: ${({ theme }) => theme.colors.textDisabled};
      }
    }
  }
`

const AuctionHistory: React.FC<AuctionHistoryProps> = ({ mostRecentClosedAuctionId }) => {
  const [historyAuctionId, setHistoryAuctionId] = useState(
    mostRecentClosedAuctionId ? mostRecentClosedAuctionId.toString() : '0',
  )
  const historyAuctionIdAsInt = parseInt(historyAuctionId, 10)

  const auctionHistory = useAuctionHistory(historyAuctionIdAsInt)
  const selectedAuction = Object.values(auctionHistory).find(
    (auctionData) => auctionData.auction.id === historyAuctionIdAsInt,
  )

  let auctionTable = selectedAuction ? (
    <AuctionLeaderboardTable
      auction={selectedAuction.auction}
      bidders={selectedAuction.bidders}
      noBidsText="No bids were placed in this auction"
    />
  ) : (
    <Flex justifyContent="center" alignItems="center" p="24px" height="250px">
      <Spinner />
    </Flex>
  )

  if (Number.isNaN(historyAuctionIdAsInt)) {
    auctionTable = (
      <Flex flexDirection="column" justifyContent="center" alignItems="center" p="24px" height="250px">
        <Text mb="8px">Please specify an auction ID</Text>
        <BunnyPlaceholderIcon height="64px" width="64px" />
      </Flex>
    )
  }

  const endDate = selectedAuction ? format(selectedAuction.auction.endDate, 'MMM. dd yyyy, hh:mm aa') : null

  const handleHistoryAuctionChange = (event) => {
    const {
      target: { value },
    } = event
    if (value) {
      let newAuctionId = value
      if (parseInt(value, 10) <= 0) {
        newAuctionId = ''
      }
      if (parseInt(value, 10) >= mostRecentClosedAuctionId) {
        newAuctionId = mostRecentClosedAuctionId.toString()
      }
      setHistoryAuctionId(newAuctionId)
    } else {
      setHistoryAuctionId('')
    }
  }

  const handleArrowPress = (auctionId: number) => {
    if (auctionId) {
      setHistoryAuctionId(auctionId.toString())
    } else {
      // auctionId is NaN when the input is empty, the only button press that will trigger this func is 'forward one'
      setHistoryAuctionId('1')
    }
  }
  return (
    <Box py="24px">
      <Flex px="24px" justifyContent="space-between" alignItems="center">
        <Flex flex="3" alignItems="center">
          <Text bold fontSize="20px" mr="8px">
            Auction #
          </Text>
          <Box width="62px" mr="16px">
            <Input
              disabled={!mostRecentClosedAuctionId}
              type="input"
              value={historyAuctionId}
              onChange={handleHistoryAuctionChange}
            />
          </Box>
          <StyledIconButton
            disabled={!historyAuctionIdAsInt || historyAuctionIdAsInt <= 1}
            variant="text"
            scale="sm"
            mr="12px"
            onClick={() => handleArrowPress(historyAuctionIdAsInt - 1)}
          >
            <ArrowBackIcon />
          </StyledIconButton>
          <StyledIconButton
            disabled={historyAuctionIdAsInt >= mostRecentClosedAuctionId}
            variant="text"
            scale="sm"
            mr="12px"
            onClick={() => handleArrowPress(historyAuctionIdAsInt + 1)}
          >
            <ArrowForwardIcon />
          </StyledIconButton>
          <StyledIconButton
            disabled={historyAuctionIdAsInt >= mostRecentClosedAuctionId}
            variant="text"
            scale="sm"
            onClick={() => handleArrowPress(mostRecentClosedAuctionId)}
          >
            <ArrowLastIcon />
          </StyledIconButton>
        </Flex>
        <Flex flex="2" justifyContent="flex-end">
          {endDate && <Text>Ended {endDate}</Text>}
        </Flex>
      </Flex>
      {mostRecentClosedAuctionId ? (
        auctionTable
      ) : (
        <Flex flexDirection="column" justifyContent="center" alignItems="center" p="24px" height="250px">
          <Text mb="8px">No history yet</Text>
          <BunnyPlaceholderIcon height="64px" width="64px" />
        </Flex>
      )}
    </Box>
  )
}

export default AuctionHistory
