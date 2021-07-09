import { LotteryTicket } from 'config/constants/types'
import { useEffect, useReducer } from 'react'
import { parseRetreivedNumber } from '../../helpers'
import generateTicketNumbers from './generateTicketNumbers'

export interface Ticket {
  id: number
  numbers: string[]
  duplicateWith: number[]
  isComplete: boolean
}

export interface TicketsState {
  tickets: Ticket[]
  allComplete: boolean
}

const getInitialState = ({
  amount,
  userCurrentTickets,
}: {
  amount: number
  userCurrentTickets: LotteryTicket[]
}): TicketsState => {
  // const randomTickets = generateTicketNumbers(amount, userCurrentTickets)
  // const randomTicketsAsStringArray = randomTickets.map((ticket) => parseRetreivedNumber(ticket.toString()).split(''))
  const randomTicketsAsStringArray = [
    ['9', '0', '0', '3', '0', '1'],
    ['9', '0', '1', '2', '8', '7'],
    ['9', '0', '2', '2', '9', '2'],
    ['9', '0', '3', '9', '3', '7'],
    ['9', '0', '4', '0', '7', '5'],
    ['9', '0', '5', '2', '0', '3'],
    ['9', '0', '6', '3', '1', '5'],
    ['9', '0', '7', '5', '6', '2'],
    ['9', '0', '8', '2', '2', '6'],
    ['9', '0', '9', '2', '8', '0'],
    ['9', '1', '0', '3', '9', '3'],
    ['9', '1', '1', '6', '3', '4'],
    ['9', '1', '2', '7', '2', '6'],
    ['9', '1', '3', '2', '2', '5'],
    ['9', '1', '4', '9', '9', '0'],
    ['9', '1', '5', '3', '8', '4'],
    ['9', '1', '6', '2', '6', '2'],
    ['9', '1', '7', '8', '5', '0'],
    ['9', '1', '8', '2', '2', '2'],
    ['9', '1', '9', '7', '9', '5'],
    ['9', '2', '0', '3', '7', '0'],
    ['9', '2', '1', '8', '9', '3'],
    ['9', '2', '2', '1', '8', '5'],
    ['9', '2', '3', '8', '9', '0'],
    ['9', '2', '4', '0', '9', '2'],
    ['9', '2', '5', '6', '7', '2'],
    ['9', '2', '6', '0', '7', '0'],
    ['9', '2', '7', '6', '5', '3'],
    ['9', '2', '8', '9', '3', '9'],
    ['9', '2', '9', '9', '9', '3'],
    ['9', '3', '0', '3', '7', '2'],
    ['9', '3', '1', '4', '2', '5'],
    ['9', '3', '2', '9', '2', '7'],
    ['9', '3', '3', '7', '6', '9'],
    ['9', '3', '4', '6', '6', '1'],
    ['9', '3', '5', '2', '0', '9'],
    ['9', '3', '6', '4', '6', '2'],
    ['9', '3', '7', '5', '4', '1'],
    ['9', '3', '8', '3', '9', '5'],
    ['9', '3', '9', '8', '6', '4'],
    ['9', '4', '0', '2', '9', '2'],
    ['9', '4', '1', '8', '3', '2'],
    ['9', '4', '2', '8', '0', '3'],
    ['9', '4', '3', '8', '1', '7'],
    ['9', '4', '4', '8', '2', '6'],
    ['9', '4', '5', '4', '8', '0'],
    ['9', '4', '6', '0', '6', '0'],
    ['9', '4', '7', '4', '6', '2'],
    ['9', '4', '8', '5', '0', '2'],
    ['9', '4', '9', '3', '2', '0'],
    ['9', '5', '0', '6', '2', '5'],
    ['9', '5', '1', '2', '8', '4'],
    ['9', '5', '2', '6', '2', '9'],
    ['9', '5', '3', '9', '2', '5'],
    ['9', '5', '4', '9', '7', '9'],
    ['9', '5', '5', '8', '3', '1'],
    ['9', '5', '6', '6', '0', '2'],
    ['9', '5', '7', '7', '8', '6'],
    ['9', '5', '8', '2', '7', '6'],
    ['9', '5', '9', '3', '0', '8'],
    ['9', '6', '0', '6', '1', '6'],
    ['9', '6', '1', '9', '6', '8'],
    ['9', '6', '2', '7', '9', '1'],
    ['9', '6', '3', '5', '1', '4'],
    ['9', '6', '4', '6', '8', '3'],
    ['9', '6', '5', '8', '2', '2'],
    ['9', '6', '6', '6', '1', '9'],
    ['9', '6', '7', '7', '2', '7'],
    ['9', '6', '8', '5', '9', '8'],
    ['9', '6', '9', '9', '1', '8'],
    ['9', '7', '0', '5', '5', '2'],
    ['9', '7', '1', '0', '9', '5'],
    ['9', '7', '2', '6', '5', '4'],
    ['9', '7', '3', '8', '9', '8'],
    ['9', '7', '4', '4', '4', '2'],
    ['9', '7', '5', '4', '2', '2'],
    ['9', '7', '6', '0', '1', '1'],
    ['9', '7', '7', '4', '8', '8'],
    ['9', '7', '8', '5', '9', '1'],
    ['9', '7', '9', '6', '2', '2'],
    ['9', '8', '0', '9', '8', '2'],
    ['9', '8', '1', '0', '0', '2'],
    ['9', '8', '2', '6', '2', '9'],
    ['9', '8', '3', '2', '5', '3'],
    ['9', '8', '4', '0', '7', '5'],
    ['9', '8', '5', '3', '8', '2'],
    ['9', '8', '6', '2', '2', '6'],
    ['9', '8', '7', '8', '3', '8'],
    ['9', '8', '8', '9', '5', '4'],
    ['9', '8', '9', '7', '9', '0'],
    ['9', '9', '0', '5', '2', '8'],
    ['9', '9', '1', '7', '9', '2'],
    ['9', '9', '2', '8', '3', '9'],
    ['9', '9', '3', '3', '6', '4'],
    ['9', '9', '4', '4', '5', '0'],
    ['9', '9', '5', '8', '8', '8'],
    ['9', '9', '6', '0', '9', '6'],
    ['9', '9', '7', '2', '1', '0'],
    ['9', '9', '8', '0', '8', '0'],
    ['9', '9', '9', '8', '5', '2'],
  ]
  const tickets = Array.from({ length: amount }, (_, i) => i + 1).map((index) => ({
    id: index,
    numbers: randomTicketsAsStringArray[index - 1],
    duplicateWith: [],
    isComplete: true,
  }))
  return {
    tickets,
    allComplete: true,
  }
}

const reducer = (state: TicketsState, action: any) => {
  switch (action.type) {
    case 'updateTicket': {
      const tickets = [...state.tickets]
      const { ticketId, newNumbers } = action.payload

      const newDuplicates = state.tickets.filter(
        (ticket) => ticket.id !== ticketId && ticket.isComplete && ticket.numbers.join('') === newNumbers.join(''),
      )

      // If ticket was duplicate but not duplicate anymore with this update
      // go through previously considered duplicates and remove id of this ticket
      // from their duplicateWith array
      const prevDuplicates = tickets[ticketId - 1].duplicateWith
      prevDuplicates.forEach((prevTicketId) => {
        if (!newDuplicates.map(({ id }) => id).includes(prevTicketId)) {
          const dupsToUpdate = [...tickets[prevTicketId - 1].duplicateWith]
          const indexToRemvoe = dupsToUpdate.findIndex((id) => id === ticketId)
          dupsToUpdate.splice(indexToRemvoe, 1)
          tickets[prevTicketId - 1] = {
            ...tickets[prevTicketId - 1],
            duplicateWith: dupsToUpdate,
          }
        }
      })

      // If found duplicates - update their duplicateWith array
      if (newDuplicates.length !== 0) {
        newDuplicates.forEach((duplicate) => {
          tickets[duplicate.id - 1] = {
            ...duplicate,
            duplicateWith: [...duplicate.duplicateWith, ticketId],
          }
        })
      }

      const updatedTicket = {
        id: ticketId,
        numbers: newNumbers,
        duplicateWith: newDuplicates.map((ticket) => ticket.id),
        isComplete: newNumbers.join('').length === 6,
      }
      tickets[ticketId - 1] = updatedTicket

      // Check if all tickets are filled
      const allComplete = tickets.every((ticket) => ticket.isComplete)

      return {
        tickets,
        allComplete,
      }
    }
    case 'reset':
      return getInitialState({ amount: action.payload.amount, userCurrentTickets: action.payload.userCurrentTickets })
    default:
      throw new Error()
  }
}

export type UpdateTicketAction = (ticketId: number, newNumbers: string[]) => void

export const useTicketsReducer = (
  amount: number,
  userCurrentTickets: LotteryTicket[],
): [UpdateTicketAction, () => void, Ticket[], boolean, () => number[]] => {
  const [state, dispatch] = useReducer(reducer, { amount, userCurrentTickets }, getInitialState)

  useEffect(() => {
    dispatch({ type: 'reset', payload: { amount, userCurrentTickets } })
  }, [amount, userCurrentTickets])

  const updateTicket = (ticketId: number, newNumbers: string[]) => {
    dispatch({ type: 'updateTicket', payload: { ticketId, newNumbers } })
  }

  const randomize = () => {
    dispatch({ type: 'reset', payload: { amount, userCurrentTickets } })
  }

  const getTicketsForPurchase = () => {
    return state.tickets.map((ticket) => {
      const reversedTicket = [...ticket.numbers].map((num) => parseInt(num, 10)).reverse()
      reversedTicket.unshift(1)
      const ticketAsNumber = parseInt(reversedTicket.join(''), 10)
      return ticketAsNumber
    })
  }

  return [updateTicket, randomize, state.tickets, state.allComplete, getTicketsForPurchase]
}
