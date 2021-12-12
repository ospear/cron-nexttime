# cron-nexttime

Passing cron format returns next time.

# Installation

```
npm install ospear/cron-nexttime
```

# Usage

```js
const nextCronTime = require('cron-nexttime')
// Returns the datetime closest to the current datetime
console.log(nextCronTime('0 * * * *'))
// Returns the datetime closest to the specified datetime
console.log(nextCronTime('0 * * * *', new Date('2000/1/1 00:00:00')))
```

# Note

I referred to the following link

- https://ja.wikipedia.org/wiki/Crontab
- https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/events/ScheduledEvents.html#CronExpressions

# Author

https://github.com/ospear

# License

MIT
