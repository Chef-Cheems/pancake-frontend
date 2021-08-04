import BigNumber from 'bignumber.js'
import { useEffect, useReducer } from 'react'
import { BIG_ZERO } from 'utils/bigNumber'
import { getInterestBreakdown, getPrincipalForInterest, getRoi } from 'utils/compoundApyHelpers'

const compoundingIndexToFrequency = {
  0: 2,
  1: 1,
  2: 0.142857142, // once every 7 days
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
    stakingDuration: number
    mode: CalculatorMode
  }
  data: {
    stakingTokenAmount: BigNumber
    stakingTokenUSDValue: string
    targetRoi: string
    interestBreakdown: number[]
    roiUSD: number
    roiTokens: number
    roiPercentage: number
  }
}

const initialState: RoiCalculatorReducerState = {
  controls: {
    compounding: false,
    compoundingFrequency: 1,
    activeCompoundingIndex: 1,
    stakingDuration: 3,
    mode: CalculatorMode.ROI_BASED_ON_PRINCIPAL,
  },
  data: {
    stakingTokenAmount: BIG_ZERO,
    stakingTokenUSDValue: '',
    targetRoi: '',
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
    case 'setStakingTokenUSDValue': {
      const { stakingTokenUSDValue, stakingTokenAmount } = action.payload
      const data = { ...state.data, stakingTokenUSDValue, stakingTokenAmount }
      const controls = { ...state.controls }
      return {
        controls,
        data,
      }
    }
    case 'setPrincipal': {
      const data = { ...state.data, stakingTokenUSDValue: action.payload }
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
      const data = { ...state.data, targetRoi: action.payload }
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
  const { stakingTokenUSDValue, targetRoi } = state.data
  const { compounding, compoundingFrequency, stakingDuration, mode } = state.controls

  // If pool is auto-compounding set state's compounding frequency to this pool's auto-compound frequency
  useEffect(() => {
    if (autoCompoundFrequency > 0) {
      dispatch({ type: 'setCompoundingFrequency', payload: { autoCompoundFrequency } })
    }
  }, [autoCompoundFrequency])

  // Calculates ROI whenever related values change
  useEffect(() => {
    const stakingTokenUSDValueAsNumber = parseFloat(stakingTokenUSDValue)
    const compoundFrequency = compounding ? compoundingFrequency : 0
    const interestBreakdown = getInterestBreakdown({
      investmentAmount: stakingTokenUSDValueAsNumber,
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
          amountInvested: stakingTokenUSDValueAsNumber,
        })
      : 0
    dispatch({ type: 'setRoi', payload: { roiUSD, roiTokens, roiPercentage } })
  }, [stakingTokenUSDValue, apr, stakingDuration, earningTokenPrice, performanceFee, compounding, compoundingFrequency])

  // Sets principal based on expected ROI value
  useEffect(() => {
    if (mode === CalculatorMode.PRINCIPAL_BASED_ON_ROI) {
      const principalForExpectedRoi = getPrincipalForInterest(parseFloat(targetRoi), apr, compoundingFrequency)
      const principal = principalForExpectedRoi[stakingDuration].toFixed(2)
      dispatch({ type: 'setPrincipal', payload: principal })
    }
  }, [stakingDuration, apr, compoundingFrequency, mode, targetRoi])

  const setCompoundingFrequency = (index: number) => {
    dispatch({ type: 'setCompoundingFrequency', payload: { index } })
  }

  const setInvestmentUSDValue = (amount: string) => {
    const stakingTokenAmount = new BigNumber(amount).div(stakingTokenPrice)
    dispatch({ type: 'setStakingTokenUSDValue', payload: { stakingTokenUSDValue: amount, stakingTokenAmount } })
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
    dispatch({ type: 'setTargetRoi', payload: amount })
  }

  return {
    state,
    setInvestmentUSDValue,
    setStakingDuration,
    toggleCompounding,
    setCompoundingFrequency,
    setCalculatorMode,
    setTargetRoi,
  }
}

export default useRoiCalculatorReducer
