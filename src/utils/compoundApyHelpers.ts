const DAYS_TO_CALCULATE_AGAINST = [1, 7, 30, 365]

/**
 *
 * @param investmentAmount - amount user wants to invest in USD
 * @param apr - farm or pool apr as percentage. If its farm APR its only cake rewards APR without LP rewards APR
 * @param earningTokenPrice - price of reward token
 * @param compoundFrequency - how many compounds per 1 day, e.g. 1 = one per day, 0.142857142 - once per week
 * @param performanceFee - performance fee as percentage
 * @returns an array of token values earned as interest, with each element representing interest earned over a different period of time (DAYS_TO_CALCULATE_AGAINST)
 */
export const getInterestBreakdown = ({
  investmentAmount,
  apr,
  earningTokenPrice,
  roundingDecimals = 2,
  compoundFrequency = 1,
  performanceFee = 0,
}: {
  investmentAmount: number
  apr: number
  earningTokenPrice: number
  roundingDecimals?: number
  compoundFrequency?: number
  performanceFee?: number
}) => {
  // Everything here is worked out relative to a year, with the asset compounding at the compoundFrequency rate. 1 = once per day
  const timesCompounded = 365 * compoundFrequency
  // We use decimal values rather than % in the math for both APY and the number of days being calculates as a proportion of the year
  let aprAsDecimal = apr / 100

  if (performanceFee) {
    // Reduce the APR by the % performance fee
    const feeRelativeToApr = aprAsDecimal * performanceFee
    const aprAfterFee = apr - feeRelativeToApr
    aprAsDecimal = aprAfterFee / 100
  }

  return DAYS_TO_CALCULATE_AGAINST.map((days) => {
    const daysAsDecimalOfYear = days / 365
    // Calculate the starting TOKEN balance with a dollar balance of investmentAmount.
    const principal = investmentAmount / earningTokenPrice
    let interestEarned = principal * aprAsDecimal * (days / 365)
    if (timesCompounded !== 0) {
      // This is a translation of the typical mathematical compounding APY formula. Details here: https://www.calculatorsoup.com/calculators/financial/compound-interest-calculator.php
      const accruedAmount = principal * (1 + aprAsDecimal / timesCompounded) ** (timesCompounded * daysAsDecimalOfYear)
      // To get the TOKEN amount earned, deduct the amount after compounding (accruedAmount) from the starting TOKEN balance (principal)
      interestEarned = accruedAmount - principal
    }
    return parseFloat(interestEarned.toFixed(roundingDecimals))
  })
}

/**
 * Given target USD amount (interest)
 * @param interest how much USD amount you aim to make
 * @param apr APR of farm/pool
 * @param compoundingFrequency how many compounds per 1 day, e.g. 1 = one per day, 0.142857142 - once per week
 * @returns an array of principal values needed to reach target interest, with each element representing principal needed for a different period of time (DAYS_TO_CALCULATE_AGAINST)
 */
export const getPrincipalForInterest = (interest: number, apr: number, compoundingFrequency: number) => {
  const aprAsDecimal = apr / 100
  if (compoundingFrequency > 0) {
    return DAYS_TO_CALCULATE_AGAINST.map((days) => {
      const apyAsDecimal = getApy(apr, compoundingFrequency, days) / 100
      const daysAsDecimalOfYear = days / 365
      return parseFloat((interest / (apyAsDecimal * daysAsDecimalOfYear)).toFixed(2))
    })
  }
  return DAYS_TO_CALCULATE_AGAINST.map((days) => {
    const daysAsDecimalOfYear = days / 365
    return parseFloat((interest / (aprAsDecimal * daysAsDecimalOfYear)).toFixed(2))
  })
}

/**
 * Given APR returns APY
 * @param apr APR as percentage
 * @param compoundFrequency how many compounds per day
 * @param days if other than 365 adjusts (A)PY for period less than a year
 * @param performanceFee performance fee as percentage
 * @returns APY as percentage
 */
export const getApy = (apr: number, compoundFrequency = 1, days = 365, performanceFee = 0) => {
  const daysAsDecimalOfYear = days / 365
  let aprAsDecimal = apr / 100
  if (performanceFee) {
    // Reduce the APR by the % performance fee
    const feeRelativeToApr = aprAsDecimal * performanceFee
    const aprAfterFee = apr - feeRelativeToApr
    aprAsDecimal = aprAfterFee / 100
  }
  const timesCompounded = 365 * compoundFrequency
  let apyAsDecimal = 0
  if (daysAsDecimalOfYear === 1) {
    apyAsDecimal = (1 + aprAsDecimal / timesCompounded) ** timesCompounded - 1
  } else {
    const compoundingIncrease = (1 + aprAsDecimal / timesCompounded) ** (timesCompounded * daysAsDecimalOfYear)
    apyAsDecimal = aprAsDecimal * compoundingIncrease
  }
  return parseFloat((apyAsDecimal * 100).toFixed(2))
}

export const getRoi = ({ amountEarned, amountInvested }: { amountEarned: number; amountInvested: number }) => {
  if (amountInvested === 0) {
    return 0
  }
  const percentage = (amountEarned / amountInvested) * 100
  return percentage
}
