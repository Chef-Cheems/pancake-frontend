import React from 'react'
import styled from 'styled-components'
import { Flex, Box, Card, CardBody, Text, Button, Image } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { TokenImage } from 'components/TokenImage'
import { WBNB } from 'config/constants/tokens'
import { NFT } from 'state/nftMarket/types'

const RoundedImage = styled(Image)`
  & > img {
    border-radius: ${({ theme }) => theme.radii.default};
  }
`

interface MainNFTCardProps {
  nft: NFT
}

const MainNFTCard: React.FC<MainNFTCardProps> = ({ nft }) => {
  const { t } = useTranslation()
  return (
    <Card mb="40px">
      <CardBody>
        <Flex>
          <Flex flex="2">
            <Box>
              <Text bold color="primary" mt="50px">
                Pancake Bunnies
              </Text>
              <Text fontSize="40px" bold mt="12px">
                {nft.name}
              </Text>
              <Text color="textSubtle" mt="48px">
                {t("Three guesses what's put that twinkle in those eyes! (Hint: it's CAKE)")}
              </Text>
              <Text color="textSubtle" mt="48px">
                {t('Lowest price')}
              </Text>
              <Flex alignItems="center" mt="8px">
                {/* @ts-ignore */}
                <TokenImage token={WBNB} width="32" height="32" mr="4px" />
                <Text fontSize="24px" bold mr="4px">
                  10.2938
                </Text>
                <Text color="textSubtle">(~2,312.23 USD)</Text>
              </Flex>
              <Button minWidth="168px" mt="24px">
                Buy
              </Button>
            </Box>
          </Flex>
          <Flex flex="1">
            {/* @ts-ignore */}
            <RoundedImage src={nft.images.ipfs} width={440} height={440} />
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  )
}

export default MainNFTCard
