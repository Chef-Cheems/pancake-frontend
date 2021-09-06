import React from 'react'
import styled from 'styled-components'
import { Flex } from '@pancakeswap/uikit'
import Page from 'components/Layout/Page'
import Nfts from 'config/constants/nfts/pancakeBunnies'
import MainNFTCard from './MainNFTCard'
import ManageCard from './ManageCard'
import OwnersTable from './OnwersTable'

const twinkles = Nfts.find((nft) => nft.id === 7)

const TwoRowContainer = styled(Flex)`
  gap: 22px;
  & :first-child {
    flex: 1;
  }
  & :last-child {
    flex: 2;
  }
`

const IndividualNFTPage = () => {
  return (
    <Page>
      {/* @ts-ignore */}
      <MainNFTCard nft={twinkles} />
      <TwoRowContainer>
        {/* @ts-ignore */}
        <ManageCard nft={twinkles} />
        <OwnersTable />
      </TwoRowContainer>
    </Page>
  )
}

export default IndividualNFTPage
