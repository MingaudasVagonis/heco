import React from 'react'
import {View, StyleSheet, Text} from 'react-native'
import {sys_width, getText, round_fac, sys_height} from '@styles'
import colors from '@colors'
import moment from 'moment'
import {BarChart} from 'react-native-svg-charts'
import {Defs, LinearGradient, Stop} from 'react-native-svg'

/**
 * Groups all the entries by time into chunks of 2 hours
 *
 * @param {array} entries - Array of entries
 * @returns {array}
 */
const groupEntries = entries => {

  const times = entries.map(entry => {
    /* Sometimes timestamp comes in float form (?) that needs 
       to be multiplied by 1000 */
    const stamp = entry.time % 1 === 0 ? entry.time : entry.time * 1000
    /* Returning the hour */
    return parseInt(moment(stamp).format('HH'))
  })

  /* Grouping into groups of 2 hours */
  const grouped = times.reduce((acc, val) => {
    let index = val - (val % 2)
    acc[index] = (acc[index] || 0) + 1
    return acc
  }, {})

  /* Filling the gaps that have no entries with 0 */
  return Array.from({length: 12}, (_, i) => grouped[ranges[i]] || 0)
}

/**
 * Component that displays entries' spread over time
 * 
 * @component
 */
const TimeChart = ({entries}) => (
  <View style={styles.chart_parent}>
    <BarChart
      style={{height: "110%"}}
      data={groupEntries(entries)}
      svg={{fill: 'url(#gradient)'}}
      spacingInner={0.15}
      contentInset={{top: 10, bottom: 50, left: 10, right: 10}}>
      <Gradient />
    </BarChart>
    <View style={styles.labels}>
      <Text style={styles.label}>0</Text>
      <Text style={styles.label}>6</Text>
      <Text style={styles.label}>12</Text>
      <Text style={styles.label}>18</Text>
      <Text style={styles.label}>24</Text>
    </View>
  </View>
)

const Gradient = () => (
  <Defs key={'gradient'}>
    <LinearGradient id={'gradient'} x1={'0%'} y={'0%'} x2={'0%'} y2={'100%'}>
      <Stop offset={'0%'} stopColor={colors.primary} />
      <Stop offset={'100%'} stopColor={colors.secondary} />
    </LinearGradient>
  </Defs>
)

export default TimeChart

const ranges = Array.from({length: 12}, (_, i) => i * 2)

const height = Math.min(sys_width * 0.5, sys_height * 0.23)

const styles = StyleSheet.create({
  chart_parent: {
    borderRadius: 25 * round_fac,
    backgroundColor: colors.darkest,
    flex: 1,
    height
  },
  labels: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 10,
    paddingLeft: 10,
    paddingRight: 5,
  },
  label: {
    ...getText('bold', 15 / sys_width),
    color: 'white',
  },
})
