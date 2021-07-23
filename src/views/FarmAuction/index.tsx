import React from 'react'
import styled from 'styled-components'
import { Button, Heading, Text, Flex, Link } from '@pancakeswap/uikit'
import { useWeb3React } from '@web3-react/core'
import { useTranslation } from 'contexts/Localization'
import PageHeader from 'components/PageHeader'
import PageSection from 'components/PageSection'
import useTheme from 'hooks/useTheme'
import FAQs from './components/FAQs'
import AuctionDetails from './components/AuctionDetail'
import AuctionLeaderboard from './components/AuctionLeaderboard'
import { FORM_ADDRESS } from './helpers'
import { useCurrentFarmAuction } from './useCurrentFarmAuction'

const StyledHeader = styled(PageHeader)`
  max-height: max-content;
  margin-bottom: -40px;
  padding-bottom: 20px;
  overflow: hidden;
  ${({ theme }) => theme.mediaQueries.md} {
    max-height: 392px;
  }
`

const Left = styled(Flex)`
  flex-direction: column;
  flex: 1;
`

const Right = styled(Flex)`
  align-items: center;
  justify-content: center;
  padding-left: 24px;
  flex: 0.5;
  & img {
    height: 50%;
    width: 50%;
  }

  ${({ theme }) => theme.mediaQueries.xs} {
    & img {
      height: auto;
      width: auto;
    }
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    & img {
      height: 90%;
      margin-top: -15%;
    }
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    & img {
      margin-top: -25%;
    }
  }
`

const FarmAuction = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { account } = useWeb3React()

  // const { toastSuccess } = useToast()
  // const cakeContract = useCake()

  const { currentAuction, bidders, connectedUser } = useCurrentFarmAuction(account)

  const FAQS_BG = 'linear-gradient(180deg, #CBD7EF 0%, #9A9FD0 100%)'

  return (
    <>
      <StyledHeader>
        <Flex flexDirection={['column-reverse', 'row']}>
          <Left>
            <Heading as="h1" scale="xxl" mb="24px">
              {t('Community Farm Auction')}
            </Heading>
            <Text bold fontSize="16px" color="textSubtle" mb="24px">
              {t('Each week, qualifying projects can bid CAKE for the right to host a 7-day Farm on PancakeSwap.')}
            </Text>
            <Link external href={FORM_ADDRESS}>
              <Button>
                <Text color="white" bold fontSize="16px" mr="4px">
                  {t('Apply for a Farm/Pool')}
                </Text>
              </Button>
            </Link>
          </Left>
          <Right>
            <img src="/images/decorations/auction-bunny.png" alt="auction bunny" />
          </Right>
        </Flex>
      </StyledHeader>
      <>
        <PageSection
          innerProps={{ style: { margin: '0', width: '100%' } }}
          background={theme.colors.background}
          p="24px 0"
          index={2}
          concaveDivider
          concaveBackgroundLight={theme.colors.background}
          curvePosition="top"
        >
          <Flex width="100%" alignItems="flex-start" flexDirection={['column', null, null, 'row']}>
            <AuctionDetails auction={currentAuction} connectedUser={connectedUser} />
            <AuctionLeaderboard auction={currentAuction} bidders={bidders} />
          </Flex>
        </PageSection>
        <PageSection p="24px 0" background={FAQS_BG} index={3} hasCurvedDivider={false}>
          <FAQs />
        </PageSection>
      </>
    </>
  )
}

export default FarmAuction
