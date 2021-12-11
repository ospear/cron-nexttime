const nextCronTime = require('../index')
describe('nextCronTime', () => {
  test.each([
    // minute hour date month dow
    [
      '* * * * *',
      new Date('2000/01/01 00:00:00'),
      new Date('2000/01/01 00:01:00'),
    ],
    [
      '1 * * * *',
      new Date('2000/01/01 00:00:00'),
      new Date('2000/01/01 00:01:00'),
    ],
    [
      '* 1 * * *',
      new Date('2000/01/01 00:00:00'),
      new Date('2000/01/01 01:00:00'),
    ],
    [
      '0 0 1 * *',
      new Date('2000/01/01 00:00:00'),
      new Date('2000/02/01 00:00:00'),
    ],
    [
      '0 0 1 1 *',
      new Date('2000/01/01 00:00:00'),
      new Date('2001/01/01 00:00:00'),
    ],
    [
      '0 0 1 1 *',
      new Date('2000/12/31 23:59:59'),
      new Date('2001/01/01 00:00:00'),
    ],
  ])('new CronOne(%s, %s).next() => %s', (format, date, want) => {
    expect(nextCronTime(format, date)).toEqual(want)
  })
})
