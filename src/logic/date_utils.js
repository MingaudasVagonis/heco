import moment from 'moment'

/**
 * Gets all days in the current week in YYYY-MM-DD format
 *
 * @returns {array}
 * @public
 */
const getWeekDays = () => {
  const weekStart = moment().startOf('isoWeek')

  return [...Array(7).keys()].map(day =>
    moment(weekStart).add(day, 'days').format('YYYY-MM-DD'),
  )
}

/**
 * Gets all of the days in the current month
 *
 * @param {object} date - An object with a separated date
 * @returns {array}
 * @public
 */
const getMonthDays = date => {
  /* Days in a month */
  const day_count = new Date(date.year, date.month, 0).getDate()

  return [...Array(day_count).keys()].map(
    day => `${date.year}-${date.month}-${('00' + (day + 1)).slice(-2)}`,
  )
}

/**
 * Returns a separated date object
 *
 * @returns {object}
 * @public
 */
const getDate = () => ({
  year: moment().format('YYYY'),
  month: moment().format('MM'),
  week: moment().isoWeek(),
})

/**
 * Returns whether a day is in the month
 *
 * @param {object} day   - Day object from the bucket
 * @param {number} month - Number representing a month
 * @returns {bool}
 * @public
 */
const matchMonth = (day, month) =>
  day.tag.includes(`-${('00' + (month + 1)).slice(-2)}-`)

/**
 * Reducer for counting totals
 *
 * @param {number} acc - Accumulitive value.
 * @param {number} val - Value to add
 * @returns {number}
 * @public
 */
const reducer = (acc, val) => val.count + acc

/**
 * Returns a unix timestamp
 *
 * @returns {number}
 * @public
 */
const timestamp = () => new Date().getTime()

export {getWeekDays, getMonthDays, getDate, reducer, matchMonth, timestamp}
