import React from 'react'
import styled from 'styled-components'
import { Flex } from '@pancakeswap/uikit'
import { useParams } from 'react-router-dom'
import Page from 'components/Layout/Page'
import { useCollectionByAddress, useNftsFromCollection } from 'state/nftMarket/hooks'
import MainNFTCard from './MainNFTCard'
import ManageCard from './ManageCard'
import PropertiesCard from './PropertiesCard'
import DetailsCard from './DetailsCard'
import MoreFromThisCollection from './MoreFromThisCollection'
import ForSaleTableCard from './ForSaleTableCard'
import { twinkleForSale, userCollectibles, collectiblesForSale } from './tmp'

const TwoColumnsContainer = styled(Flex)`
  gap: 22px;
  align-items: flex-start;
  & > div:first-child {
    flex: 1;
    gap: 20px;
  }
  & > div:last-child {
    flex: 2;
  }
`

const IndividualNFTPage: React.FC = () => {
  const { collectionAddress, bunnyId } = useParams<{ collectionAddress: string; bunnyId: string }>()
  const collection = useCollectionByAddress(collectionAddress)
  const nfts = useNftsFromCollection(collectionAddress)
  const nftByBunnyId = nfts[bunnyId]
  console.log('STUFF')
  console.log('Baller NFT', nftByBunnyId)
  console.log('Baller tokens', nftByBunnyId.tokens)
  return (
    <Page>
      <MainNFTCard nft={nftByBunnyId} lowestCost="1" />
      <TwoColumnsContainer flexDirection={['column', 'column', 'row']}>
        <Flex flexDirection="column" width="100%">
          <ManageCard userCollectibles={userCollectibles} />
          <PropertiesCard collectible={twinkleForSale} />
          <DetailsCard collectible={twinkleForSale} />
        </Flex>
        <ForSaleTableCard collectiblesForSale={collectiblesForSale} totalForSale={450} />
      </TwoColumnsContainer>
      <MoreFromThisCollection />
    </Page>
  )
}

export default IndividualNFTPage
