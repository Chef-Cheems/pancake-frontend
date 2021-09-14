import React from 'react'
import { ethers } from 'ethers'
import { Box, Button, Text, useModal } from '@pancakeswap/uikit'
import BuyModal from '../components/BuyModal'

const tempNFTtoBuy = {
  collection: {
    address: '0x60935f36e4631f73f0f407e68642144e07ac7f5e',
    name: 'Pancake Bunnies',
  },
  token: {
    id: '122',
    name: 'Baller',
    imageUrl: '/images/nfts/baller-sm.png',
  },
  price: ethers.BigNumber.from(1),
}

const BuyModalDemo = () => {
  const [onPresentModal] = useModal(<BuyModal nftToBuy={tempNFTtoBuy} />)
  return (
    <Box p="24px">
      <Text bold>Buy NFT</Text>
      <Text>
        Collection: {tempNFTtoBuy.collection.name} ({tempNFTtoBuy.collection.address})
      </Text>
      <Text>
        Name: {tempNFTtoBuy.token.name} ({tempNFTtoBuy.token.id})
      </Text>
      <Text>Price: {tempNFTtoBuy.price.toNumber()}</Text>
      <Button onClick={onPresentModal}>Buy NFT</Button>
    </Box>
  )
}

export default BuyModalDemo
