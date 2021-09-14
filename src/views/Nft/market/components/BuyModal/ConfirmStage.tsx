import React from 'react'
import { Flex, Text, Button } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'

interface ConfirmStageProps {
  isConfirmed: boolean
  isConfirming: boolean
  handleConfirm: () => void
}

// Shown in case user wants to pay with BNB
// or if user wants to pay with WBNB and it is already approved
const ConfirmStage: React.FC<ConfirmStageProps> = ({ isConfirmed, isConfirming }) => {
  const { t } = useTranslation()
  console.debug('Confirmed', isConfirmed)
  return (
    <Flex p="16px" flexDirection="column">
      <Flex alignItems="center">
        <Text fontSize="20px" bold color="secondary">
          {t('Confirm')}
        </Text>
      </Flex>
      <Text small color="textSubtle">
        {t('Please confirm the transaction in your wallet')}
      </Text>
      <Button disabled={isConfirming} variant="secondary">
        {t('Confirm')}
      </Button>
    </Flex>
  )
}

export default ConfirmStage
