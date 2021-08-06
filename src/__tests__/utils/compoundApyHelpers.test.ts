import { getInterestBreakdown, getRoi, getPrincipalForInterest } from 'utils/compoundApyHelpers'

const TWICE_PER_DAY = 2
const FIVE_THOUSAND_TIMES_PER_DAY = 5000
const ONCE_PER_7_DAYS = 0.142857142
const ONCE_PER_30_DAYS = 0.033333333

it.each([
  [
    { investmentAmount: 1000, apr: 120, earningTokenPrice: 16, performanceFee: 0, compoundFrequency: 1 },
    [0.21, 1.45, 6.47, 144.6],
  ],
  [
    { investmentAmount: 1000, apr: 120, earningTokenPrice: 16, performanceFee: 0, compoundFrequency: 2 },
    [0.21, 1.45, 6.47, 144.8],
  ],
  [
    { investmentAmount: 1000, apr: 120, earningTokenPrice: 16, performanceFee: 0, compoundFrequency: ONCE_PER_7_DAYS },
    [0.2, 1.44, 6.4, 142.2],
  ],
  [
    { investmentAmount: 1000, apr: 120, earningTokenPrice: 16, performanceFee: 0, compoundFrequency: ONCE_PER_30_DAYS },
    [0.2, 1.39, 6.16, 133.79],
  ],
  [
    { investmentAmount: 55000, apr: 120, earningTokenPrice: 5.5, performanceFee: 0, compoundFrequency: 1 },
    [32.88, 232.42, 1034.79, 23135.88],
  ],
  [
    { investmentAmount: 55000, apr: 120, earningTokenPrice: 5.5, performanceFee: 0, compoundFrequency: TWICE_PER_DAY },
    [32.9, 232.61, 1035.69, 23168.47],
  ],
  [
    { investmentAmount: 55000, apr: 120, earningTokenPrice: 5.5, performanceFee: 2, compoundFrequency: 1 },
    [32.22, 227.73, 1013.12, 22352.61],
  ],
  [
    {
      investmentAmount: 55000,
      apr: 120,
      earningTokenPrice: 5.5,
      performanceFee: 2,
      compoundFrequency: FIVE_THOUSAND_TIMES_PER_DAY,
    },
    [32.27, 228.1, 1014.83, 22413.81],
  ],
])(
  'calculate cake earned with values %o',
  ({ investmentAmount, apr, earningTokenPrice, compoundFrequency, performanceFee }, expected) => {
    expect(
      getInterestBreakdown({ investmentAmount, apr, earningTokenPrice, compoundFrequency, performanceFee }),
    ).toEqual(expected)
  },
)

it.each([
  [{ amountEarned: 10, amountInvested: 1000 }, 1],
  [{ amountEarned: 4.8, amountInvested: 10 }, 48],
  [{ amountEarned: 217.48, amountInvested: 950 }, 22.892631578947366],
  [{ amountEarned: 100.67, amountInvested: 100 }, 100.66999999999999],
  [{ amountEarned: 8572.84, amountInvested: 20000 }, 42.864200000000004],
])('calculate roi % with values %o', ({ amountEarned, amountInvested }, expected) => {
  expect(getRoi({ amountEarned, amountInvested })).toEqual(expected)
})

it('reverse calculations match', () => {
  // Given (assume this is CAKE-CAKE syrup pool)
  const earningTokenPrice = 17.12
  const stakingTokenPrice = 17.12
  const apr = 68.43
  const stakingDays = 30
  const compoundFrequency = 1
  const performanceFee = 0

  // Expected
  const expectedROI = 4857.9712

  // TODO: Also check same with performance feee

  const principal = 84047.16
  // Calculate ROI based on principal
  const interestBreakdown = getInterestBreakdown({
    investmentAmount: principal,
    apr,
    earningTokenPrice,
    compoundFrequency,
    performanceFee,
  })
  const roiTokens30days = interestBreakdown[2]
  const roiUSD30days = roiTokens30days * earningTokenPrice
  const roiPercentage30days = getRoi({
    amountEarned: roiTokens30days,
    amountInvested: principal,
  })
  expect(roiUSD30days).toBe(expectedROI) // This is correct, trust this

  // Calculate principal based on ROI
  const principalForExpectedRoi = getPrincipalForInterest(expectedROI, apr, compoundFrequency)
  const principalUSD = principalForExpectedRoi[2]
  // in code this is BN but whatever
  const principalToken = principalUSD / stakingTokenPrice
  const roiPercentage = getRoi({
    amountEarned: expectedROI,
    amountInvested: principalUSD,
  })
  expect(principalUSD).toBe(principal)
})
