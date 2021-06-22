import { useEffect, useState } from 'react'
import { request, gql } from 'graphql-request'
import BigNumber from 'bignumber.js'
import { BLOCK_SUBGRAPH, STREAMING_FAST } from 'config/constants/endpoints'
import { Farm } from 'state/types'
import { ChainId } from '@pancakeswap-libs/sdk'

const GET_BLOCK = (timestamp: string) => {
  return gql`query getBlock {
        blocks(first: 1, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${timestamp + 600} }) {
          number
        }
    }`
}

const FARMS_AT_BLOCK = (block: number | null, farms: string[]) => {
  const blockString = block ? `block: {number: ${block}}` : ``
  const addressesString = `["${farms.join('","')}"]`
  return `pairs(
      where: { id_in: ${addressesString} }
      ${blockString}
    ) {
      id
      volumeUSD
      reserveUSD
    }`
}

export const FARMS_BULK = (block24: number, farms: string[]) => {
  return gql`
      query farmsBulk {
        now: ${FARMS_AT_BLOCK(null, farms)}
        oneDayAgo: ${FARMS_AT_BLOCK(block24, farms)}
      }
    `
}

interface BlockResponse {
  blocks: {
    number: number
  }[]
}

interface SingleFarmResponse {
  id: string
  reserveUSD: string
  volumeUSD: string
}

interface FarmsResponse {
  now: SingleFarmResponse[]
  oneDayAgo: SingleFarmResponse[]
}

interface VolumeMap {
  [key: string]: BigNumber
}

const getYesterdayTimestamp = () => {
  const yesterdayMs = new Date().getTime() - 24 * 60 * 60 * 1000
  const yesterdayUnix = new Date(yesterdayMs).getTime() / 1000
  return Math.floor(yesterdayUnix).toString()
}

enum FetchState {
  idle = 'idle',
  loading = 'loading',
  fetched = 'fetched',
  error = 'error',
}

const LP_HOLDERS_FEE = 0.0017

const useFarmVolumes = (farms: Farm[]) => {
  const [lpAprs, setLpAprs] = useState<VolumeMap>()
  const [fetchState, setFetchState] = useState<FetchState>(FetchState.idle)

  const allPublicDataLoaded = farms.every((farm) => !!farm.multiplier)
  console.log('HOOK', farms.length, allPublicDataLoaded)
  useEffect(() => {
    const fetchFarmsLPAprs = async (): Promise<void> => {
      setFetchState(FetchState.loading)
      const t24 = getYesterdayTimestamp()
      const lowerCaseAddresses = farms.map((farm) => farm.lpAddresses[ChainId.MAINNET].toLowerCase())
      console.log({ lowerCaseAddresses })
      try {
        const { blocks } = await request<BlockResponse>(BLOCK_SUBGRAPH, GET_BLOCK(t24))
        const { now, oneDayAgo } = await request<FarmsResponse>(
          STREAMING_FAST,
          FARMS_BULK(blocks[0].number, lowerCaseAddresses),
        )
        const volumeMap = now.reduce((volumeData, farm, index) => {
          const volume24h = new BigNumber(farm.volumeUSD).minus(new BigNumber(oneDayAgo[index].volumeUSD))
          const lpFees24h = volume24h.times(LP_HOLDERS_FEE)
          const lpFees365days = lpFees24h.times(365)
          const liquidity = new BigNumber(farm.reserveUSD)
          const lpApr = liquidity.dividedBy(lpFees365days)
          return {
            ...volumeData,
            [farm.id]: lpApr,
          }
        }, {})
        setLpAprs(volumeMap)
        setFetchState(FetchState.fetched)
      } catch (error) {
        console.error('Failed to fetch LP APR data', error)
        setFetchState(FetchState.error)
      }
    }
    if (fetchState !== FetchState.loading && fetchState !== FetchState.fetched && allPublicDataLoaded) {
      fetchFarmsLPAprs()
    }
  }, [farms, allPublicDataLoaded, fetchState])
  console.log('lpaprs', lpAprs && Object.keys(lpAprs).length)

  return lpAprs
}

export default useFarmVolumes
