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

const TOKEN_PRECISION = 10
const USD_PRECISION = 2

export enum EditingCurrency {
  TOKEN,
  USD,
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
    editingCurrency: EditingCurrency
  }
  data: {
    principalAsToken: string // Used as value for Inputs
    principalAsUSD: string // Used as value for Inputs
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
    editingCurrency: EditingCurrency.USD,
  },
  data: {
    principalAsToken: '0.00',
    principalAsUSD: '',
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
    case 'setPrincipal': {
      const { principalAsUSD, principalAsToken } = action.payload
      const data = { ...state.data, principalAsUSD, principalAsToken }
      const controls = { ...state.controls, mode: CalculatorMode.ROI_BASED_ON_PRINCIPAL }
      return {
        controls,
        data,
      }
    }
    case 'setPrincipalForTargetRoi': {
      // TODO can be combined with SetPrincipal? Or auto-mode switched or something?
      const { principalAsUSD, principalAsToken, roiPercentage } = action.payload
      const data = { ...state.data, principalAsUSD, principalAsToken, roiPercentage }
      return {
        ...state,
        data,
      }
    }
    case 'setCalculatorMode': {
      const mode = action.payload
      const controls = { ...state.controls, mode }
      if (mode === CalculatorMode.PRINCIPAL_BASED_ON_ROI) {
        const roiUSD = parseFloat(state.data.roiUSD.toFixed(USD_PRECISION))
        const data = { ...state.data, roiUSD }
        return { controls, data }
      }
      return { ...state, controls }
    }
    case 'setRoi': {
      const data = { ...state.data, ...action.payload }
      return { ...state, data }
    }
    case 'setTargetRoi': {
      const { roiUSD, roiTokens } = action.payload
      const data = { ...state.data, roiUSD, roiTokens }
      const controls = { ...state.controls, mode: CalculatorMode.PRINCIPAL_BASED_ON_ROI }
      return { controls, data }
    }
    case 'toggleEditingCurrency': {
      const currencyAfterChange =
        state.controls.editingCurrency === EditingCurrency.USD ? EditingCurrency.TOKEN : EditingCurrency.USD
      const controls = { ...state.controls, editingCurrency: currencyAfterChange }
      return { ...state, controls }
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
  const { principalAsUSD, roiUSD } = state.data
  const { compounding, compoundingFrequency, stakingDuration, mode } = state.controls

  // If pool is auto-compounding set state's compounding frequency to this pool's auto-compound frequency
  useEffect(() => {
    if (autoCompoundFrequency > 0) {
      dispatch({ type: 'setCompoundingFrequency', payload: { autoCompoundFrequency } })
    }
  }, [autoCompoundFrequency])

  // Calculates ROI whenever related values change
  useEffect(() => {
    if (mode === CalculatorMode.ROI_BASED_ON_PRINCIPAL) {
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
      const roiAsUSD = hasInterest ? roiTokens * earningTokenPrice : 0
      const roiPercentage = hasInterest
        ? getRoi({
            amountEarned: roiAsUSD,
            amountInvested: principalAsUSDAsNumber,
          })
        : 0
      dispatch({ type: 'setRoi', payload: { roiUSD: roiAsUSD, roiTokens, roiPercentage } })
    }
  }, [principalAsUSD, apr, stakingDuration, earningTokenPrice, performanceFee, compounding, compoundingFrequency, mode])

  // Sets principal based on expected ROI value
  useEffect(() => {
    if (mode === CalculatorMode.PRINCIPAL_BASED_ON_ROI) {
      const principalForExpectedRoi = getPrincipalForInterest(roiUSD, apr, compounding ? compoundingFrequency : 0)
      const principalUSD = !Number.isNaN(principalForExpectedRoi[stakingDuration])
        ? principalForExpectedRoi[stakingDuration]
        : 0
      const principalToken = new BigNumber(principalUSD).div(stakingTokenPrice)
      const roiPercentage = getRoi({
        amountEarned: roiUSD,
        amountInvested: principalUSD,
      })
      dispatch({
        type: 'setPrincipalForTargetRoi',
        payload: {
          principalAsUSD: principalUSD.toFixed(USD_PRECISION),
          principalAsToken: principalToken.toFixed(TOKEN_PRECISION),
          roiPercentage,
        },
      })
    }
  }, [stakingDuration, apr, compounding, compoundingFrequency, mode, roiUSD, stakingTokenPrice])

  const setCompoundingFrequency = (index: number) => {
    dispatch({ type: 'setCompoundingFrequency', payload: { index } })
  }

  const setPrincipalFromUSDValue = (amount: string) => {
    const principalAsTokenBN = new BigNumber(amount).div(stakingTokenPrice)
    const principalAsToken = principalAsTokenBN.gt(0) ? principalAsTokenBN.toFixed(TOKEN_PRECISION) : '0.00'
    dispatch({ type: 'setPrincipal', payload: { principalAsUSD: amount, principalAsToken } })
  }

  const setPrincipalFromTokenValue = (amount: string) => {
    const principalAsUsdBN = new BigNumber(amount).times(stakingTokenPrice)
    const principalAsUsdString = principalAsUsdBN.gt(0) ? principalAsUsdBN.toFixed(USD_PRECISION) : '0.00'
    dispatch({
      type: 'setPrincipal',
      payload: { principalAsUSD: principalAsUsdString, principalAsToken: amount },
    })
  }

  const setStakingDuration = (stakingDurationIndex: number) => {
    dispatch({ type: 'setStakingDuration', payload: stakingDurationIndex })
  }

  const toggleCompounding = () => {
    dispatch({ type: 'toggleCompounding' })
  }

  const toggleEditingCurrency = () => {
    dispatch({ type: 'toggleEditingCurrency' })
  }

  const setCalculatorMode = (modeToSet: CalculatorMode) => {
    dispatch({ type: 'setCalculatorMode', payload: modeToSet })
  }

  const setTargetRoi = (amount: string) => {
    const targetRoiAsTokens = new BigNumber(amount).div(stakingTokenPrice)
    dispatch({
      type: 'setTargetRoi',
      payload: { roiUSD: amount, roiTokens: targetRoiAsTokens.isNaN() ? 0 : targetRoiAsTokens.toNumber() },
    })
  }

  return {
    state,
    setPrincipalFromUSDValue,
    setPrincipalFromTokenValue,
    setStakingDuration,
    toggleCompounding,
    toggleEditingCurrency,
    setCompoundingFrequency,
    setCalculatorMode,
    setTargetRoi,
  }
}

export default useRoiCalculatorReducer
