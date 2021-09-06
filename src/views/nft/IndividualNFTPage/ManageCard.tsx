import React from 'react'
import styled from 'styled-components'
import { Box, Flex, Grid, Text, Image, CogIcon, SellIcon, WalletFilledIcon, CameraIcon } from '@pancakeswap/uikit'
import { NFT } from 'state/nftMarket/types'
import ExpandableCard from './ExpandableCard'

const RoundedImage = styled(Image)`
  & > img {
    border-radius: ${({ theme }) => theme.radii.default};
  }
`

const Category = ({ title, icon, color, nft }) => {
  return (
    <Flex flexDirection="column">
      <Grid gridTemplateColumns="32px 1fr">
        {icon}
        <Text display="inline" bold color={color}>
          {title}
        </Text>
      </Grid>
      <Flex>
        {/* @ts-ignore */}
        <RoundedImage src={nft.images.ipfs} width={64} height={64} mx="16px" />
        <Box>
          <Flex justifyContent="space-between" alignItems="center">
            <Text bold>Twinkle</Text>
            <Text fontSize="12px" color="textSubtle" textAlign="right">
              Pancake Bunnies
            </Text>
          </Flex>
          <Flex justifyContent="space-between">
            <Text small color="textSubtle">
              Lowest Price
            </Text>
            <Text small textAlign="right">
              10.2938
            </Text>
          </Flex>
          <Text small color="textDisabled">
            Not for sale
          </Text>
        </Box>
      </Flex>
    </Flex>
  )
}

interface ManageCardProps {
  nft: NFT
}

const ManageCard: React.FC<ManageCardProps> = ({ nft }) => {
  const selling = (
    <Category
      title="Selling"
      color="failure"
      icon={<SellIcon color="failure" width="24px" height="24px" />}
      nft={nft}
    />
  )
  const inWallet = (
    <Category
      title="In Wallet"
      color="secondary"
      icon={<WalletFilledIcon color="secondary" width="24px" height="24px" />}
      nft={nft}
    />
  )
  const profilePic = (
    <Category
      title="Profile Pic"
      color="textSubtle"
      icon={<CameraIcon color="textSubtle" width="24px" height="24px" />}
      nft={nft}
    />
  )
  const content = (
    <>
      {selling}
      {inWallet}
      {profilePic}
    </>
  )
  return <ExpandableCard title="Manage Yours" icon={<CogIcon width="24px" height="24px" />} content={content} />
}

export default ManageCard
