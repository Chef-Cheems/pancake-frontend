import React from 'react'
import styled from 'styled-components'
import { Swiper, SwiperSlide } from 'swiper/react'
import SwiperCore, { Pagination } from 'swiper'
import { Box, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import pancakeBunnies from 'config/constants/nfts/pancakeBunnies'
import { CollectibleCard } from '../components/CollectibleCard'
import { Collectible } from '../components/CollectibleCard/types'

import 'swiper/swiper-bundle.css'

SwiperCore.use([Pagination])

// tmp
const exampleBunnies: Collectible[] = [...Array(12).keys()].map((i) => ({
  name: 'Pancake Bunnies',
  cost: 0.02,
  lowestCost: 0.002,
  nft: pancakeBunnies[i],
  status: 'selling',
}))

const StyledSwiper = styled.div`
  .swiper-wrapper {
    align-items: center;
    display: flex;
  }

  .swiper-slide {
    width: 365px;
  }

  .swiper-pagination-bullet-active {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`

const MoreFromThisCollection: React.FC = () => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  return (
    <Box pt="56px" pb="32px" mb="52px">
      <Text bold>{t('More from this collection')}</Text>
      {isMobile ? (
        <StyledSwiper>
          <Swiper spaceBetween={16} slidesPerView={1.5}>
            {exampleBunnies.map((bunny) => (
              <SwiperSlide>
                <CollectibleCard collectible={bunny} />
              </SwiperSlide>
            ))}
          </Swiper>
        </StyledSwiper>
      ) : (
        <StyledSwiper>
          <Swiper
            spaceBetween={16}
            slidesPerView={4}
            slidesPerGroup={4}
            initialSlide={4}
            pagination={{
              clickable: true,
            }}
          >
            {exampleBunnies.map((bunny) => (
              <SwiperSlide>
                <CollectibleCard collectible={bunny} />
              </SwiperSlide>
            ))}
          </Swiper>
        </StyledSwiper>
      )}
    </Box>
  )
}

export default MoreFromThisCollection
