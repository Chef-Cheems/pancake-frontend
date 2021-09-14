import React from 'react'
import { Flex, Text, Button, Spinner } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { StepIndicator } from './styles'

interface ApproveAndConfirmStageProps {
  isApproved: boolean
  isApproving: boolean
  isConfirmed: boolean
  isConfirming: boolean
  handleApprove: () => void
  handleConfirm: () => void
}

// Shown if user wants to pay with WBNB and contract isn't approved yet
const ApproveAndConfirmStage: React.FC<ApproveAndConfirmStageProps> = ({
  isApproved,
  isApproving,
  isConfirmed,
  isConfirming,
  handleApprove,
}) => {
  const { t } = useTranslation()
  console.debug('Confirmed', isConfirmed)

  return (
    <Flex p="16px" flexDirection="column">
      <Flex mb="8px" alignItems="center">
        <Flex flexDirection="column" flex="2">
          <Flex alignItems="center">
            <StepIndicator success={isApproved}>
              <Text fontSize="20px" bold color="invertedContrast">
                1
              </Text>
            </StepIndicator>
            <Text fontSize="20px" color={isApproved ? 'success' : 'secondary'} bold>
              {isApproved ? t('Enabled') : t('Enable')}
            </Text>
          </Flex>
          {!isApproved && (
            <Text mt="8px" maxWidth="275px" small color="textSubtle">
              {t('Please enable WBNB spending in your wallet')}
            </Text>
          )}
        </Flex>
        <Flex flex="0 0 64px" width="64px">
          {isApproving && <Spinner size={64} />}
        </Flex>
      </Flex>
      {!isApproved && (
        <Button variant="secondary" disabled={isApproving} onClick={handleApprove}>
          {isApproving ? `${t('Enabling')}...` : t('Start')}
        </Button>
      )}
      <Flex alignItems="center" mt="16px">
        <StepIndicator success={!!0} disabled={!isApproved}>
          <Text fontSize="20px" bold color={!isApproved ? 'textDisabled' : 'invertedContrast'}>
            2
          </Text>
        </StepIndicator>
        <Text fontSize="20px" bold color={isApproved ? 'secondary' : 'textDisabled'}>
          {t('Confirm')}
        </Text>
      </Flex>
      <Text small color={isApproved ? 'textSubtle' : 'textDisabled'}>
        {t('Please confirm the transaction in your wallet')}
      </Text>
      <Button disabled={!isApproved || isConfirming} variant="secondary">
        {isConfirming ? t('Confirm') : t('Confirming')}
      </Button>
    </Flex>
  )
}

export default ApproveAndConfirmStage
