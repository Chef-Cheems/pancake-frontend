import React from 'react'
import { Link } from 'react-router-dom'
import { StyledCollectibleCard } from './styles'
import CardBody from './CardBody'
import { CollectibleCardProps } from './types'
import { nftsBaseUrl, pancakeBunniesAddress } from '../../constants'

const CollectibleLinkCard: React.FC<CollectibleCardProps> = ({ nft, nftLocation, currentAskPrice, ...props }) => {
  // TODO: adjust this when we decided on structure of non-PancakeBunny NFTs
  const urlId = nft.collectionAddress === pancakeBunniesAddress.toLowerCase() ? nft.attributes[0].value : 'nftTokenId'
  return (
    <StyledCollectibleCard {...props}>
      <Link to={`${nftsBaseUrl}/collections/${nft.collectionAddress}/${urlId}`}>
        <CardBody nft={nft} nftLocation={nftLocation} currentAskPrice={currentAskPrice} />
      </Link>
    </StyledCollectibleCard>
  )
}

export default CollectibleLinkCard
