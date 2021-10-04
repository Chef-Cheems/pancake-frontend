import React, { useEffect, useState } from 'react'
import { Flex, useTooltip } from '@pancakeswap/uikit'
import { useLoadingState } from 'state/nftMarket/hooks'
import CountdownCircle from './CountdownCircle'

const UpdateIndicator = () => {
  const [secondsRemaining, setSecondsRemaining] = useState(10)
  const { isUpdatingPancakeBunnies: isFetchingMorePancakeBunnies } = useLoadingState()
  const { tooltip, tooltipVisible, targetRef } = useTooltip('lolkek', { placement: 'auto' })

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1)
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    if (!isFetchingMorePancakeBunnies) {
      setSecondsRemaining(10)
    }
  }, [isFetchingMorePancakeBunnies])

  return (
    <Flex justifyContent="center" ref={targetRef}>
      <CountdownCircle secondsRemaining={secondsRemaining} isUpdating={isFetchingMorePancakeBunnies} />
      {tooltipVisible && tooltip}
    </Flex>
  )
}

export default UpdateIndicator
