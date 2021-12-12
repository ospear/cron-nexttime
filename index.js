function matchRange(part, value) {
  const [start, end] = part.split('-')
  return start <= value && value <= end
}

function matchIncrement(part, value) {
  const [offset, per] = part.split('/')
  return value % per == (offset === '*' ? 0 : offset)
}

class MinuteField {
  constructor(field) {
    this.field = field
  }

  match(time) {
    const value = time.getMinutes()
    const split = this.field.split(',')
    for (const f of split) {
      if (f === '*') {
        return true
      }
      if (f.includes('-')) {
        return matchRange(f, value)
      }
      if (f.includes('/')) {
        return matchIncrement(f, value)
      }
      if (f == value) {
        return true
      }
    }
    return false
  }
}

class HourField {
  constructor(field) {
    this.field = field
  }

  match(time) {
    const value = time.getHours()
    const split = this.field.split(',')
    for (const f of split) {
      if (f === '*') {
        return true
      }
      if (f.includes('-')) {
        return matchRange(f, value)
      }
      if (f.includes('/')) {
        return matchIncrement(f, value)
      }
      if (f == value) {
        return true
      }
    }
    return false
  }
}

class DateField {
  constructor(field) {
    this.field = field
  }

  match(time) {
    const value = time.getDate()
    const split = this.field.split(',')
    for (const f of split) {
      if (f === '*' || f === '?') {
        return true
      }
      if (f === 'L') {
        const tomorrow = new Date(time.getTime() + 24 * 60 * 60 * 1000)
        return time.getMonth() != tomorrow.getMonth()
      }
      if (f.includes('W')) {
        const [nth] = f.split('W')
        const dow = time.getDay() + 1
        if (nth === '') {
          return matchRange('2-6', dow)
        }
        return time.getDate() >= Number(nth) && matchRange('2-6', dow)
      }
      if (f.includes('-')) {
        return matchRange(f, value)
      }
      if (f.includes('/')) {
        return matchIncrement(f, value)
      }
      if (f == value) {
        return true
      }
    }
    return false
  }
}

class MonthField {
  constructor(field) {
    this.field = field
  }

  match(time) {
    const value = time.getMonth() + 1
    const split = this.field.split(',')
    for (const f of split) {
      if (f === '*') {
        return true
      }
      if (f.includes('-')) {
        return matchRange(f, value)
      }
      if (f.includes('/')) {
        return matchIncrement(f, value)
      }
      if (f == value) {
        return true
      }
    }
    return false
  }
}

class DayOfWeekField {
  constructor(field) {
    this.field = field
  }

  match(time) {
    const value = time.getDay() + 1
    const split = this.field.split(',')
    for (const f of split) {
      if (f === '*' || f === '?') {
        return true
      }
      if (f === 'L') {
        // TODO: sunday?
        return value === 1
      }
      if (f.includes('-')) {
        return matchRange(f, value)
      }
      if (f.contains('#')) {
        const [dow, nth] = f.split('#')
        return (
          dow === value && Math.floor(Number(time.getDate()) / 7) + 1 === nth
        )
      }
      if (f == value) {
        return true
      }
    }
    return false
  }
}

class CronNextTime {
  constructor(format, currentTime = new Date()) {
    this.fields = format.split(' ')
    if (this.fields.length !== 5) {
      throw new Error(`Invalid cron format: ${format}`)
    }

    if (!(currentTime instanceof Date)) {
      throw new Error(`Invalid currentTime: ${currentTime}`)
    }
    this.now = new Date(currentTime.getTime())
    this.now.setSeconds(0)
    this.now.setMilliseconds(0)
    this.nextTime = new Date(this.now.getTime() + 60 * 1000)
  }

  /**
   * value: 0-59
   * wildcard: , - * /
   */
  get minute() {
    return new MinuteField(this.fields[0])
  }

  /**
   * value: 0-23
   * wildcard: , - * /
   */
  get hour() {
    return new HourField(this.fields[1])
  }

  /**
   * value: 1-31
   * wildcard: , - * ? L W
   */
  get date() {
    return new DateField(this.fields[2])
  }

  /**
   * value: 1-12
   * wildcard: , - * /
   */
  get month() {
    return new MonthField(this.fields[3])
  }

  /**
   * value: 1-7
   * wildcard: , - * ? L #
   */
  get dayOfWeek() {
    return new DayOfWeekField(this.fields[4])
  }

  match(time) {
    return (
      this.month.match(time) &&
      this.date.match(time) &&
      this.dayOfWeek.match(time) &&
      this.hour.match(time) &&
      this.minute.match(time)
    )
  }

  next() {
    do {
      this.nextMonth()
      this.nextDate()
      this.nextHour()
      this.nextMinute()

      if (this.nextTime - this.now > (1 + 4 * 365) * 24 * 60 * 60 * 1000) {
        throw new Error(
          `Not found next time. Searched until ${this.nextTime}: now=${this.now}`,
        )
      }
    } while (!(this.match(this.nextTime) && this.now < this.nextTime))

    return this.nextTime
  }

  nextMinute() {
    for (let i = 0; i < 60; i++) {
      if (this.minute.match(this.nextTime)) {
        return
      }
      this.nextTime.setMinutes(this.nextTime.getMinutes() + 1)
    }
    throw new Error(
      `Not found next time. Searched until ${this.nextTime}: now=${this.now}`,
    )
  }

  nextHour() {
    for (let i = 0; i < 24; i++) {
      if (this.hour.match(this.nextTime)) {
        return
      }
      this.nextTime.setHours(this.nextTime.getHours() + 1)
      this.nextTime.setMinutes(0)
    }
    throw new Error(
      `Not found next time. Searched until ${this.nextTime}: now=${this.now}`,
    )
  }

  nextDate() {
    for (let i = 0; i < 31; i++) {
      if (
        this.date.match(this.nextTime) &&
        this.dayOfWeek.match(this.nextTime)
      ) {
        return
      }
      this.nextTime.setDate(this.nextTime.getDate() + 1)
      this.nextTime.setHours(0)
      this.nextTime.setMinutes(0)
    }
  }

  nextMonth() {
    for (let i = 0; i < 12; i++) {
      if (this.month.match(this.nextTime)) {
        return
      }
      this.nextTime.setMonth(this.nextTime.getMonth() + 1)
      this.nextTime.setDate(1)
      this.nextTime.setHours(0)
      this.nextTime.setMinutes(0)
    }
    throw new Error(
      `Not found next time. Searched until ${this.nextTime}: now=${this.now}`,
    )
  }
}

function nextCronTime(cronFormat, currentTime = new Date()) {
  return new CronNextTime(cronFormat, currentTime).next()
}

module.exports = nextCronTime
