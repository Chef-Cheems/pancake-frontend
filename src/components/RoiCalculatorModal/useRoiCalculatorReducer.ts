import BigNumber from 'bignumber.js'
import { useEffect, useReducer } from 'react'
import { BIG_ZERO } from 'utils/bigNumber'
import { getInterestBreakdown, getPrincipalForInterest, getRoi } from 'utils/compoundApyHelpers'

const compoundingIndexToFrequency = {
  0: 1,
  1: 0.142857142,
  2: 0.071428571, // once every 7 days
  3: 0.033333333, // once every 30 days
}

export enum CalculatorMode {
  ROI_BASED_ON_PRINCIPAL,
  PRINCIPAL_BASED_ON_ROI,
}

export interface RoiCalculatorReducerState {
  controls: {
    compounding: boolean
    compoundingFrequency: number
    activeCompoundingIndex: number // index of active button in ButtonMenu
    stakingDuration: number // index of active button in ButtonMenu
    mode: CalculatorMode
  }
  data: {
    principalAsToken: string // Used as value for Inputs
    principalAsUSD: string // Used as value for Inputs
    targetRoiAsUSD: string
    targetRoiAsTokens: BigNumber
    interestBreakdown: number[]
    roiUSD: number
    roiTokens: number
    roiPercentage: number
  }
}

const initialState: RoiCalculatorReducerState = {
  controls: {
    compounding: true,
    compoundingFrequency: 1, // how many compoound in a day , e.g. 1 = once a day, 0.071 - once per 2 weeks
    activeCompoundingIndex: 0, // active compounding selected in
    stakingDuration: 3,
    mode: CalculatorMode.ROI_BASED_ON_PRINCIPAL,
  },
  data: {
    principalAsToken: '',
    principalAsUSD: '',
    targetRoiAsUSD: '',
    targetRoiAsTokens: BIG_ZERO,
    interestBreakdown: [0, 0, 0, 0],
    roiUSD: 0,
    roiTokens: 0,
    roiPercentage: 0,
  },
}

const roiCalculatorReducer = (
  state: RoiCalculatorReducerState,
  action: { type: string; payload?: any },
): RoiCalculatorReducerState => {
  switch (action.type) {
    case 'setStakingDuration': {
      const controls = { ...state.controls, stakingDuration: action.payload }
      return {
        ...state,
        controls,
      }
    }
    case 'toggleCompounding': {
      const toggledCompounding = !state.controls.compounding
      const controls = { ...state.controls, compounding: toggledCompounding }
      return {
        ...state,
        controls,
      }
    }
    case 'setCompoundingFrequency': {
      const { index, autoCompoundFrequency } = action.payload
      if (autoCompoundFrequency) {
        return {
          ...state,
          controls: {
            ...state.controls,
            compoundingFrequency: autoCompoundFrequency,
          },
        }
      }
      const compoundingFrequency = compoundingIndexToFrequency[index]
      const controls = { ...state.controls, compoundingFrequency, activeCompoundingIndex: index }
      return {
        ...state,
        controls,
      }
    }
    case 'setPrincipalFromUSDValue': {
      const { principalAsUSD, principalAsToken } = action.payload
      const data = { ...state.data, principalAsUSD, principalAsToken }
      const controls = { ...state.controls, mode: CalculatorMode.ROI_BASED_ON_PRINCIPAL }
      return {
        controls,
        data,
      }
    }
    case 'setPrincipalForTargetRoi': {
      const { principalAsUSD, principalAsToken } = action.payload
      const data = { ...state.data, principalAsUSD, principalAsToken }
      return {
        ...state,
        data,
      }
    }
    case 'setCalculatorMode': {
      const controls = { ...state.controls, mode: action.payload }
      return { ...state, controls }
    }
    case 'setRoi': {
      const data = { ...state.data, ...action.payload }
      return { ...state, data }
    }
    case 'setTargetRoi': {
      const { targetRoiAsUSD, targetRoiAsTokens } = action.payload
      const data = { ...state.data, targetRoiAsUSD, targetRoiAsTokens }
      const controls = { ...state.controls, mode: CalculatorMode.PRINCIPAL_BASED_ON_ROI }
      return { controls, data }
    }
    default:
      return state
  }
}

const useRoiCalculatorReducer = (
  stakingTokenPrice: number,
  earningTokenPrice: number,
  apr: number,
  autoCompoundFrequency: number,
  performanceFee: number,
) => {
  const [state, dispatch] = useReducer(roiCalculatorReducer, initialState)
  const { principalAsUSD, targetRoiAsUSD } = state.data
  const { compounding, compoundingFrequency, stakingDuration, mode } = state.controls

  // If pool is auto-compounding set state's compounding frequency to this pool's auto-compound frequency
  useEffect(() => {
    if (autoCompoundFrequency > 0) {
      dispatch({ type: 'setCompoundingFrequency', payload: { autoCompoundFrequency } })
    }
  }, [autoCompoundFrequency])

  // Calculates ROI whenever related values change
  useEffect(() => {
    const principalAsUSDAsNumber = parseFloat(principalAsUSD)
    const compoundFrequency = compounding ? compoundingFrequency : 0
    const interestBreakdown = getInterestBreakdown({
      investmentAmount: principalAsUSDAsNumber,
      apr,
      earningTokenPrice,
      compoundFrequency,
      performanceFee,
    })
    const hasInterest = !Number.isNaN(interestBreakdown[stakingDuration])
    const roiTokens = hasInterest ? interestBreakdown[stakingDuration] : 0
    const roiUSD = hasInterest ? roiTokens * earningTokenPrice : 0
    const roiPercentage = hasInterest
      ? getRoi({
          amountEarned: roiUSD,
          amountInvested: principalAsUSDAsNumber,
        })
      : 0
    dispatch({ type: 'setRoi', payload: { roiUSD, roiTokens, roiPercentage } })
  }, [principalAsUSD, apr, stakingDuration, earningTokenPrice, performanceFee, compounding, compoundingFrequency])

  // Sets principal based on expected ROI value
  useEffect(() => {
    if (mode === CalculatorMode.PRINCIPAL_BASED_ON_ROI) {
      const principalForExpectedRoi = getPrincipalForInterest(
        parseFloat(targetRoiAsUSD),
        apr,
        compounding ? compoundingFrequency : 0,
      )
      const principalUSD = !Number.isNaN(principalForExpectedRoi[stakingDuration])
        ? principalForExpectedRoi[stakingDuration]
        : 0
      const principalToken = new BigNumber(principalUSD).div(stakingTokenPrice)
      dispatch({
        type: 'setPrincipalForTargetRoi',
        payload: { principalAsUSD: principalUSD.toFixed(2), principalAsToken: principalToken.toFixed(2) },
      })
    }
  }, [stakingDuration, apr, compounding, compoundingFrequency, mode, targetRoiAsUSD, stakingTokenPrice])

  const setCompoundingFrequency = (index: number) => {
    dispatch({ type: 'setCompoundingFrequency', payload: { index } })
  }

  const setPrincipalFromUSDValue = (amount: string) => {
    const principalAsToken = new BigNumber(amount).div(stakingTokenPrice)
    dispatch({ type: 'setPrincipalFromUSDValue', payload: { principalAsUSD: amount, principalAsToken } })
  }

  const setStakingDuration = (stakingDurationIndex: number) => {
    dispatch({ type: 'setStakingDuration', payload: stakingDurationIndex })
  }

  const toggleCompounding = () => {
    dispatch({ type: 'toggleCompounding' })
  }

  const setCalculatorMode = (modeToSet: CalculatorMode) => {
    dispatch({ type: 'setCalculatorMode', payload: modeToSet })
  }

  const setTargetRoi = (amount: string) => {
    const targetRoiAsTokens = new BigNumber(amount).div(stakingTokenPrice)
    dispatch({
      type: 'setTargetRoi',
      payload: { targetRoiAsUSD: amount, targetRoiAsTokens: targetRoiAsTokens.isNaN() ? BIG_ZERO : targetRoiAsTokens },
    })
  }

  return {
    state,
    setPrincipalFromUSDValue,
    setStakingDuration,
    toggleCompounding,
    setCompoundingFrequency,
    setCalculatorMode,
    setTargetRoi,
  }
}

export default useRoiCalculatorReducer
