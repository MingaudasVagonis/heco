import moment from 'moment'

const getWeekDays = () => {
  const weekStart = moment().startOf('isoWeek')

  return [...Array(7).keys()].map(day =>
    moment(weekStart).add(day, 'days').format('YYYY-MM-DD'),
  )
}

const getMonthDays = date => {
  const day_count = new Date(date.year, date.month, 0).getDate()

  return [...Array(day_count).keys()].map(
    day => `${date.year}-${date.month}-${('00' + (day + 1)).slice(-2)}`,
  )
}

const getDate = () => ({
  year: moment().format('YYYY'),
  month: moment().format('MM'),
  week: moment().isoWeek(),
})

const matchMonth = (day, month) =>
  day.tag.includes(`-${('00' + (month + 1)).slice(-2)}-`)

const reducer = (acc, val) => val.count + acc

const timestamp = () => new Date().getTime()

export {getWeekDays, getMonthDays, getDate, reducer, matchMonth, timestamp}
