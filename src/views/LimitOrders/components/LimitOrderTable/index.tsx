import { useState, useCallback, memo, useMemo } from 'react'
import { Flex, Card } from '@pancakeswap/uikit'
import useGelatoLimitOrders from '../../hooks/useGelatoLitmitOrders'

import OrderTab from './OrderTab'
import { ORDER_CATEGORY } from '../../types'

import CompactLimitOrderTable from './CompactLimitOrderTable'
import NoOrdersMessage from './NoOrdersMessage'
import LoadingTable from './LoadingTable'
import SpaciousLimitOrderTable from './SpaciousLimitOrderTable'

const OrderTable: React.FC<{ isCompact: boolean; orderCategory: ORDER_CATEGORY }> = memo(
  ({ orderCategory, isCompact }) => {
    const orders = useGelatoLimitOrders(orderCategory)

    const sortedOrders = useMemo(
      () => orders.sort((a, b) => parseInt(b.createdAt, 10) - parseInt(a.createdAt, 10)),
      [orders],
    )

    if (!sortedOrders) return <LoadingTable />

    if (!sortedOrders?.length) {
      return <NoOrdersMessage orderCategory={orderCategory} />
    }

    return isCompact ? (
      <CompactLimitOrderTable orders={sortedOrders} />
    ) : (
      <SpaciousLimitOrderTable orders={sortedOrders} />
    )
  },
)

const LimitOrderTable: React.FC<{ isCompact: boolean }> = ({ isCompact }) => {
  const [activeTab, setIndex] = useState<ORDER_CATEGORY>(ORDER_CATEGORY.Open)
  const handleClick = useCallback((tabType: ORDER_CATEGORY) => setIndex(tabType), [])

  return (
    <Flex flex="1" justifyContent="center" mb="24px">
      <Card style={{ width: '100%', height: 'max-content' }}>
        <OrderTab onItemClick={handleClick} activeIndex={activeTab} />
        <OrderTable orderCategory={activeTab} isCompact={isCompact} />
      </Card>
    </Flex>
  )
}

export default memo(LimitOrderTable)
