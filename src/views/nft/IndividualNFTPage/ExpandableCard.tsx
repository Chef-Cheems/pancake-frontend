import React from 'react'
import { Grid, Text, Card, CardBody, ChevronUpIcon, IconButton } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'

interface ExpandableCardProps {
  icon: React.ReactNode
  title: string
  content: React.ReactNode
}

const ExpandableCard: React.FC<ExpandableCardProps> = ({ icon, title, content }) => {
  const { theme } = useTheme()
  return (
    <Card>
      <Grid
        gridTemplateColumns="1fr 8fr 1fr"
        alignItems="center"
        height="72px"
        px="24px"
        borderBottom={`1px solid ${theme.colors.cardBorder}`}
      >
        {icon}
        <Text bold>{title}</Text>
        <IconButton onClick={() => null} variant="text" maxWidth="32px">
          <ChevronUpIcon width="24px" height="24px" />
        </IconButton>
      </Grid>
      <CardBody>{content}</CardBody>
    </Card>
  )
}

export default ExpandableCard
