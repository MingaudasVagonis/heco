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

export const getDefault = () => DefaultPreference.get('label-focus')

export const getBucket = async id => {
  const counter = JSON.parse(await DefaultPreference.get(id))

  const tag = moment().format('YYYY-MM-DD')

  return {
    counter,
    today: (counter.days.find(day => day.tag === tag) ?? {count: 0}).count,
  }
}

export const getCounters = async () => {
  const ids = await getIDs()

  return Promise.all(
    ids.map(async id => {
      const bucket = await getBucket(id)
      return {
        label: id,
        count: bucket.counter.days.reduce(reducer, 0),
      }
    }),
  )
}

export const sortBucket = async bucket => {
  const date = getDate()

  const entries = _getEntries(bucket, date)

  return {
    entries: _flattenEntries(entries),
    statistics: {
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

export const commit = bucket => {
  if (!bucket) {
    return
  }

  DefaultPreference.set(bucket.counter.label, JSON.stringify(bucket.counter))
}

export const update = async (data, bucket, date, change) =>
  change > 0
    ? await _add(data, bucket, date)
    : await _deduct(data, bucket, date)

export const getIDs = async _ =>
  JSON.parse((await DefaultPreference.get('buckets')) || '[]')

export const createBucket = async label => {
  const current_ids = await getIDs()

  if (current_ids.length === 0) {
    await changeDefault(label)
  }

  current_ids.push(label)

  await DefaultPreference.set('buckets', JSON.stringify(current_ids))

  await DefaultPreference.set(
    label,
    JSON.stringify({
      label,
      days: [],
    }),
  )
}

export const changeDefault = async ndef => {
  try {
    await DefaultPreference.set('label-focus', ndef)
    return true
  } catch {
    return false
  }
}

const _deduct = async (data, bucket, date) => {
  for (const key in data.entries) {
    data.entries[key].pop()
  }

  _alter(data, date, -1)

  const ind = bucket.days.findIndex(
    day => day.tag === date.format('YYYY-MM-DD'),
  )

  if (ind !== -1) {
    bucket.days[ind].count -= 1
    bucket.days[ind].entries.pop()
  }

  return data
}

const _flattenEntries = entries => ({
  year: entries.year.flatMap(day => day.entries),
  month: entries.month.flatMap(day => day.entries),
  week: entries.week.flatMap(day => day.entries),
})

const _add = async (data, bucket, date) => {
  const entry = await _createEntry()

  for (const key in data.entries) {
    data.entries[key].push(entry)
  }

  _alter(data, date, 1)

  const ind = bucket.days.findIndex(
    day => day.tag === date.format('YYYY-MM-DD'),
  )

  if (ind !== -1) {
    bucket.days[ind].count += 1
    bucket.days[ind].entries.push(entry)
    return data
  }

  bucket.days.push({count: 1, tag: date.format('YYYY-MM-DD'), entries: [entry]})

  return data
}

const _alter = (data, date, am) => {
  data.statistics.year[date.month()] += am
  data.statistics.month[date.date() - 1] += am
  data.statistics.week[date.isoWeekday() - 1] += am
}

const _createEntry = async () => {
  const location = await getLocation()

  return {
    time: timestamp(),
    ...location,
  }
}

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
