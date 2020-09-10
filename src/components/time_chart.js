import React from 'react'
import {View, StyleSheet, Text} from 'react-native'
import {sys_width, getText, round_fac} from '@styles'
import colors from '@colors'
import moment from 'moment'
import {BarChart} from 'react-native-svg-charts'
import {Defs, LinearGradient, Stop} from 'react-native-svg'

const TimeChart = ({entries}) => (
  <View style={styles.chart_parent}>
    <BarChart
      style={{height: 200}}
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

const groupEntries = entries => {
  const times = entries.map(entry => {
    const stamp = entry.time % 1 === 0 ? entry.time : entry.time * 1000
    return parseInt(moment(stamp).format('HH'))
  })

  const grouped = times.reduce((acc, val) => {
    let index = val - (val % 2)
    acc[index] = (acc[index] || 0) + 1
    return acc
  }, {})

  return Array.from({length: 12}, (_, i) => grouped[ranges[i]] || 0)
}

const ranges = Array.from({length: 12}, (_, i) => i * 2)

const styles = StyleSheet.create({
  chart_parent: {
    borderRadius: 25 * round_fac,
    backgroundColor: colors.darkest,
    flex: 1,
    height: sys_width * 0.5,
  },
  labels: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    position: 'absolute',
    top: sys_width * 0.42,
    paddingLeft: 10,
    paddingRight: 5,
  },
  label: {
    ...getText('bold', 15 / sys_width),
    color: 'white',
  },
})
