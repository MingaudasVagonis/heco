import DefaultPreference from 'react-native-default-preference'
import moment from 'moment'
import {
  getDate,
  getWeekDays,
  getMonthDays,
  reducer,
  matchMonth,
  timestamp,
} from './date_utils.js'
import {getLocation} from './device.js'

DefaultPreference.setName('group.lt.minvag.heco.widget.counting')

/**
 * Gets the default counter's label.
 *
 * @returns {string}
 * @public
 */
export const getDefault = () => DefaultPreference.get('label-focus')

/**
 * Returns a bucket with it's today's count
 *
 * @param {string} id - Bucket's id/label
 * @returns {object}
 * @public
 */
export const getBucket = async id => {
  const counter = JSON.parse(await DefaultPreference.get(id))

  const tag = moment().format('YYYY-MM-DD')

  return {
    counter,
    today: (counter.days.find(day => day.tag === tag) ?? {count: 0}).count,
  }
}

/**
 * Returns all counters' labels and totals
 *
 * @returns {object}
 * @public
 */
export const getCounters = async () => {
  const ids = await getIDs()

  return Promise.all(
    ids.map(async id => {
      const bucket = await getBucket(id)
      return {
        label: id,
        /* Total count of the bucket */
        count: bucket.counter.days.reduce(reducer, 0),
      }
    }),
  )
}

/**
 * Refactors bucket into usable form for statistics and map/time charts
 *
 * @param {object} bucket - Bucket object.
 * @returns {object}
 * @public
 */
export const sortBucket = async bucket => {
  const date = getDate()

  const entries = _getEntries(bucket, date)

  return {
    entries: _flattenEntries(entries),
    statistics: {
      /* Grouping year's entries by month */
      year: [...Array(12).keys()].map(month =>
        entries.year.filter(day => matchMonth(day, month)).reduce(reducer, 0),
      ),
      month: getMonthDays(date).map(
        day =>
          (entries.month.find(entry => entry.tag === day) ?? {count: 0}).count,
      ),
      week: getWeekDays().map(
        day =>
          (entries.week.find(entry => entry.tag === day) ?? {count: 0}).count,
      ),
    },
  }
}

/**
 * Saves the bucket.
 *
 * @param {object} bucket - Bucket object
 * @public
 */
export const commit = bucket => {
  if (!bucket) return

  DefaultPreference.set(bucket.counter.label, JSON.stringify(bucket.counter))
}

/**
 * Updates the bucket by either -1 or 1
 *
 * @param {object} data   - Refactored bucket data
 * @param {object} bucket - Bucket object
 * @param {moment} date   - Today's moment
 * @param {number} change - Either 1 or -1
 * @public
 */
export const update = async (data, bucket, date, change) =>
  change > 0
    ? await _add(data, bucket, date)
    : await _deduct(data, bucket, date)

/**
 * Returns ids/labels of all the buckets
 * 
 * @returns {array}
 * @public
 */
export const getIDs = async _ =>
  JSON.parse((await DefaultPreference.get('buckets')) || '[]').filter(Boolean)

/**
 * Creates a new bucket
 *
 * @param {string} label - Bucket's label
 * @public
 */
export const createBucket = async label => {
  const current_ids = await getIDs()

  /* If no counters exist */
  if (current_ids.length === 0) 
   await changeDefault(label)

  current_ids.push(label)

  /* Saving new id */
  await DefaultPreference.set('buckets', JSON.stringify(current_ids))

  /* Creating the bucket */
  await DefaultPreference.set(
    label,
    JSON.stringify({
      label,
      days: [],
    }),
  )
}

/**
 * Changes default bucket and returns whether successful
 *
 * @param {string} ndef - New default bucket's label
 * @returns {bool}
 * @public
 */
export const changeDefault = async ndef => {
  try {
    await DefaultPreference.set('label-focus', ndef)
    return true
  } catch {
    return false
  }
}

/**
 * Deducts from today's total and returns refactored data
 *
 * @param {object} data   - Refactored bucket data
 * @param {object} bucket - Bucket object
 * @param {moment} date   - Today's moment
 * @returns {object}
 * @private
 */
const _deduct = async (data, bucket, date) => {

  /* Removing last entry from all periods */
  for (const key in data.entries)
    data.entries[key].pop()

  _alter(data, date, -1)

  /* Index of today in the bucket */
  const ind = bucket.days.findIndex(
    day => day.tag === date.format('YYYY-MM-DD'),
  )

  /* If today exists in the bucket reducing 
    count and removing last entry */
  if (ind !== -1) {
    bucket.days[ind].count -= 1
    bucket.days[ind].entries.pop()
  }

  return data
}

/**
 * Adds to today's total and returns refactored data
 *
 * @param {object} data   - Refactored bucket data
 * @param {object} bucket - Bucket object
 * @param {moment} date   - Today's moment
 * @returns {object}
 * @private
 */
const _add = async (data, bucket, date) => {
  const entry = await _createEntry()

  /* Adding the entry to all periods */
  for (const key in data.entries)
    data.entries[key].push(entry)

  _alter(data, date, 1)

  /* Index of today in the bucket */
  const ind = bucket.days.findIndex(
    day => day.tag === date.format('YYYY-MM-DD'),
  )

  /* If today exists in the bucket adding to 
    count and adding the entry */
  if (ind !== -1) {
    bucket.days[ind].count += 1
    bucket.days[ind].entries.push(entry)
    return data
  }

  /* If today does not exist creating one */
  bucket.days.push({count: 1, tag: date.format('YYYY-MM-DD'), entries: [entry]})

  return data
}

/**
 * Divides bucket's entries into periods
 *
 * @param {object} bucket - Bucket's object
 * @param {moment} date   - Today's moment
 * @returns {object}
 * @private
 */
const _getEntries = (bucket, date) => {
  const year = bucket.days.filter(day => day.tag.includes(date.year))
  return {
    year,
    month: year.filter(day => day.tag.includes(date.month)),
    week: year.filter(
      day => moment(day.tag, 'YYYY-MM-DD').isoWeek() === date.week,
    ),
  }
}

/**
 * Creates new entry with location (if available) and time
 *
 * @returns {object}
 * @private
 */
const _createEntry = async () => {
  const location = await getLocation()

  return {
    time: timestamp(),
    ...location,
  }
}

/**
 * Flattens entries of each period into one array
 *
 * @param {object} entries - All of the bucket's entries
 * @returns {object}
 * @private
 */
const _flattenEntries = entries => ({
  year: entries.year.flatMap(day => day.entries),
  month: entries.month.flatMap(day => day.entries),
  week: entries.week.flatMap(day => day.entries),
})

/**
 * Alters each period's statistics by amount specified
 *
 * @param {object} data - Refactored bucket data
 * @param {moment} date - Today's moment
 * @param {number} am   - Amount to alter
 * @returns {object}
 * @private
 */
const _alter = (data, date, am) => {
  data.statistics.year[date.month()] += am
  data.statistics.month[date.date() - 1] += am
  data.statistics.week[date.isoWeekday() - 1] += am
}
