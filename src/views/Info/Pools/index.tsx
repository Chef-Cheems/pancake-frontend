import React, { useMemo } from 'react'
import { Text, Heading, Card } from '@pancakeswap/uikit'
import Page from 'components/layout/Page'
import PoolTable from 'components/InfoTables/PoolsTable'
import { useAllPoolData, usePoolDatas } from 'state/info/hooks'
import { notEmpty } from 'utils/infoUtils'
import { useWatchlistPools } from 'state/user/hooks'
import { useTranslation } from 'contexts/Localization'

const PoolsOverview: React.FC = () => {
  const { t } = useTranslation()

  // get all the pool datas that exist
  const allPoolData = useAllPoolData()
  const poolDatas = useMemo(() => {
    return Object.values(allPoolData)
      .map((p) => p.data)
      .filter(notEmpty)
  }, [allPoolData])

  const [savedPools] = useWatchlistPools()
  const watchlistPools = usePoolDatas(savedPools)

  return (
    <Page>
      <Heading scale="lg" mb="16px">
        {t('Your Watchlist')}
      </Heading>
      <Card>
        {watchlistPools.length > 0 ? (
          <PoolTable poolDatas={watchlistPools} />
        ) : (
          <Text px="24px" py="16px">
            {t('Saved pools will appear here')}
          </Text>
        )}
      </Card>
      <Heading scale="lg" mt="40px" mb="16px">
        {t('All Pools')}
      </Heading>
      <PoolTable poolDatas={poolDatas} />
    </Page>
  )
}

export default PoolsOverview