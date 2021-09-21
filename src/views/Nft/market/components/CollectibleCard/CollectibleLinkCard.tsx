import React from 'react'
import { Link } from 'react-router-dom'
import { nftsBaseUrl, pancakeBunniesAddress } from 'views/Nft/market/constants'
import { StyledCollectibleCard } from './styles'
import CardBody from './CardBody'
import { CollectibleCardProps } from './types'

const CollectibleLinkCard: React.FC<CollectibleCardProps> = ({ nft, nftLocation, currentAskPrice, ...props }) => {
  // PancakeSquad and most other collections have unique page per token id
  let urlId = nft.tokenId
  if (nft.collectionAddress === pancakeBunniesAddress.toLowerCase()) {
    // PancakeBunnies is a special case because they are multiple same bunnies under each bunny id
    urlId = nft.attributes.find((attribute) => attribute.traitType === 'bunnyId')?.value
  }
  return (
    <StyledCollectibleCard {...props}>
      <Link to={`${nftsBaseUrl}/collections/${nft.collectionAddress}/${urlId}`}>
        <CardBody nft={nft} nftLocation={nftLocation} currentAskPrice={currentAskPrice} />
      </Link>
    </StyledCollectibleCard>
  )
}

export default CollectibleLinkCard
