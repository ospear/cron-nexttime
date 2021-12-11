class MinuteField {
  constructor(field) {
    this.field = field
  }
  match(time) {
    return this.field === '*' || this.field == time.getMinutes()
  }
}

class HourField {
  constructor(field) {
    this.field = field
  }
  match(time) {
    return this.field === '*' || this.field == time.getHours()
  }
}

class DateField {
  constructor(field) {
    this.field = field
  }
  match(time) {
    return this.field === '*' || this.field == time.getDate()
  }
}

class MonthField {
  constructor(field) {
    this.field = field
  }
  match(time) {
    return this.field === '*' || this.field == time.getMonth() + 1
  }
}

class DayOfWeekField {
  constructor(field) {
    this.field = field
  }
  match(time) {
    return this.field === '*' || this.field == time.getDay() + 1
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

  nextTick(time) {
    if (!this.month.match(time)) {
      time.setMonth(time.getMonth() + 1)
      time.setDate(1)
      time.setHours(0)
      time.setMinutes(0)
      return time
    }
    if (!this.date.match(time) || !this.dayOfWeek.match(time)) {
      time.setDate(time.getDate() + 1)
      time.setHours(0)
      time.setMinutes(0)
      return time
    }
    if (!this.hour.match(time)) {
      time.setHours(time.getHours() + 1)
      time.setMinutes(0)
      return time
    }
    time.setMinutes(time.getMinutes() + 1)
    return time
  }

  next() {
    let time = new Date(this.now.getTime())
    do {
      time = this.nextTick(time)
      // console.log({ time, now: this.now, fields: this.fields })
      if (time - this.now > 366 * 24 * 60 * 60 * 1000) {
        throw new Error(
          `Not found next time. Searched until ${time}: now=${this.now}`,
        )
      }
    } while (!this.match(time))
    return time
  }
}

function nextCronTime(cronFormat, currentTime = new Date()) {
  return new CronNextTime(cronFormat, currentTime).next()
}

module.exports = nextCronTime
