import React from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'
import { Button, Flex, Heading } from '@pancakeswap-libs/uikit'
import useI18n from 'hooks/useI18n'
import { useAchievements } from 'state/hooks'
import { addAchievement, addAchievements, clearAchievements, setAchievements } from 'state/achievements'
import { Achievement } from '../../../state/types'
import AchievementCard from './AchievementCard'

const Grid = styled.div`
  display: grid;
  grid-gap: 16px;
  grid-template-columns: 1fr;

  ${({ theme }) => theme.mediaQueries.sm} {
    grid-template-columns: repeat(2, 1fr);
  }
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 5px;
  margin: 5px 0;
`

const fakeAchivements: Achievement[] = [
  {
    id: '0',
    type: 'ifo',
    address: '0x001',
    title: 'First achivement',
    description: 'Description one',
    badge: '',
    points: 100,
  },
  {
    id: '1',
    type: 'ifo',
    address: '0x002',
    title: 'Second achivement',
    description: 'Description two',
    badge: '',
    points: 200,
  },
  {
    id: '2',
    type: 'ifo',
    address: '0x003',
    title: 'Third achivement',
    description: 'Description three',
    badge: '',
    points: 100,
  },
]

const AchievementsList = () => {
  const TranslateString = useI18n()
  const dispatch = useDispatch()
  const achievements = useAchievements()

  const addFakeAchivement = (id) => {
    dispatch(addAchievement(fakeAchivements[id]))
  }

  const addFakeAchivements = () => {
    dispatch(addAchievements(fakeAchivements))
  }

  const setFakeAchivements = () => {
    dispatch(setAchievements([fakeAchivements[0], fakeAchivements[2]]))
  }

  const clearFakeAchivements = () => {
    dispatch(clearAchievements())
  }

  const achInTheList = (id) => !!achievements.find((achievement) => achievement.id === id.toString())

  return (
    <>
      <p>Add/remove fake achivement</p>
      <ButtonContainer>
        <Button disabled={achInTheList(0)} onClick={() => addFakeAchivement(0)}>
          1
        </Button>
        <Button disabled={achInTheList(1)} onClick={() => addFakeAchivement(1)}>
          2
        </Button>
        <Button disabled={achInTheList(2)} onClick={() => addFakeAchivement(2)}>
          3
        </Button>
      </ButtonContainer>
      <ButtonContainer>
        <Button variant="danger" onClick={() => addFakeAchivements()}>
          addAchivements (broken)
        </Button>
      </ButtonContainer>
      <ButtonContainer>
        <Button variant="subtle" onClick={() => setFakeAchivements()}>
          set ([1st, 3rd])
        </Button>
        <Button variant="subtle" onClick={() => clearFakeAchivements()}>
          clear
        </Button>
      </ButtonContainer>
      <Grid>
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </Grid>
      {achievements.length === 0 && (
        <Flex alignItems="center" justifyContent="center" style={{ height: '64px' }}>
          <Heading as="h5" size="md" color="textDisabled">
            {TranslateString(999, 'No achievements yet!')}
          </Heading>
        </Flex>
      )}
    </>
  )
}

export default AchievementsList
