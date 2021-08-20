import { useDeltaTimestamps } from 'utils/infoQueryHelpers'

const UTC_NOW_UNDER_TEST = 1624809600

describe('utils/infoQueryHelpers', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date(UTC_NOW_UNDER_TEST * 1000))
  })
  it('useDeltaTimestamps returns correct timestamps', () => {
    const t24hExpected = UTC_NOW_UNDER_TEST - 86400
    const t48hExpected = UTC_NOW_UNDER_TEST - 86400 * 2
    const t7dExpected = UTC_NOW_UNDER_TEST - 86400 * 7
    const t14dExpected = UTC_NOW_UNDER_TEST - 86400 * 14
    expect(useDeltaTimestamps()).toStrictEqual([t24hExpected, t48hExpected, t7dExpected, t14dExpected])
  })
})
