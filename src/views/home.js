import React from 'react'
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  Image,
  Pressable,
  StatusBar,
  AppState,
} from 'react-native'
import {sys_width, sys_height, getText, styles_width, round_fac} from '@styles'
import colors from '@colors'
import {vibrate} from '@logic/device'
import Statistics from '@components/statistics'
import {getBucket, sortBucket, update, commit, getDefault} from '@logic/buckets'
import HMap from '@components/heco_map.js'
import {phCheckAndRequest} from '@logic/device.js'
import PopUp from '@components/popup.js'
import moment from 'moment'
import LottieView from 'lottie-react-native'
import {useFocusEffect} from '@react-navigation/native'
import TimeChart from '@components/time_chart.js'

/**
 * Home view
 * 
 * @component
 */
const Home = ({navigation}) => {

  /* TODO: merge bucket with data in the state */
  const bucket = React.useRef(undefined)
  const alert = React.useRef(undefined)

  /* TODO: useReducer ? */
  const [locationEnabled, setLocationEnabled] = React.useState(false)
  const [{data, count}, setCounterData] = React.useState({
    data: {},
    count: undefined,
  })

  const [focus, setFocus] = React.useState('week')
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const handleAppStateChange = nextAppState => {
      /* Saving the updated bucket when app goes into background */
      if (nextAppState === 'inactive') commit(bucket.current)

      /* Updating the bucket in case it was changed in a widget */
      if (nextAppState === 'active' && bucket.current)
        sync(bucket.current.counter.label)
    }

    AppState.addEventListener('change', handleAppStateChange)

    requestLocation()

    return () => AppState.removeEventListener('change', handleAppStateChange)
  }, [])

  /* Checking if the default counter has not changed 
     when the view comes back into focus */
  useFocusEffect(
    React.useCallback(() => {
      checkBucket()
    }, []),
  )

  /**
   * Checks whether the default bucket has changed
   */
  const checkBucket = async () => {
    const def = await getDefault()

    if (!bucket.current || def !== bucket.current.counter.label) 
      await sync(def)
  }

  /**
   * Syncs the bucket with the component
   *
   * @param {string} label - Label of the counter
   */
  const sync = async label => {
    setLoading(true)

    try {
      bucket.current = await getBucket(label)

      /* Getting refactored bucket data */
      const _data = await sortBucket(bucket.current.counter)

      setCounterData({data: _data, count: bucket.current.today})
    } catch {
      alert.current?.call('error', 'Failed to load the counter')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Navigates to the Library view
   */
  const library = () => {
    commit(bucket.current)

    vibrate()

    navigation.navigate('Library')
  }

  /**
   * Checks and requests location
   */
  const requestLocation = () => {
    vibrate()

    phCheckAndRequest(
      'LOCATION',
      /* Disabling map overlay */
      () => setLocationEnabled(true),
      msg => alert.current?.call('error', msg),
    )
  }

  /**
   * Increases / decreases the count of today
   * 
   * @param {number} alter - Amount to change the counter
   */
  const alter = async change => {
    if (count + change < 0 || !bucket.current)
      return

    vibrate()

    const updated = await update(data, bucket.current.counter, moment(), change)

    setCounterData({data: updated, count: (count || 0) + change})
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <SafeAreaView style={styles.safe_container}>
        <View style={styles.header_row}>
          <View style={styles.row}>
            <Image
              style={styles.logo}
              source={require('@assets/icons/logo.png')}
            />
            <Text style={styles.title}>heco</Text>
          </View>
          {loading ? (
            <LottieView
              source={require('@assets/loader.json')}
              autoPlay
              loop
              style={styles.loader}
            />
          ) : null}
        </View>
        <Statistics data={data.statistics} onChangeFocus={setFocus} />
        <View style={styles.action_container}>
          <Pressable onPress={alter.bind(undefined, -1)}>
            <Image
              style={styles.counter_button}
              source={require('@assets/icons/minus.png')}
            />
          </Pressable>
          <View style={styles.counter_text_parent}>
            <Text style={styles.counter_text}>{count || 0}</Text>
          </View>
          <Pressable onPress={alter.bind(undefined, 1)}>
            <Image
              style={styles.counter_button}
              source={require('@assets/icons/plus.png')}
            />
          </Pressable>
        </View>
        <View style={styles.bottom_container}>
          <HMap
            entries={data.entries ? data.entries[focus] : []}
            locationEnabled={locationEnabled}
            request={requestLocation}
          />
          <TimeChart entries={data.entries ? data.entries[focus] : []} />
        </View>
      </SafeAreaView>
      <Pressable style={styles.add_button} onPress={library}>
        <View style={styles.add_button}>
          <Image
            style={styles.add_icon}
            source={require('@assets/icons/icon_menu.png')}
          />
        </View>
      </Pressable>
      <PopUp ref={alert} />
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    width: sys_width,
    height: sys_height,
    backgroundColor: 'black',
  },
  safe_container: {
    alignItems: 'center',
    paddingBottom: sys_width * 0.12 + sys_height * 0.05,
  },
  bottom_container: {
    width: sys_width,
    flexDirection: 'row',
    paddingHorizontal: 0.025 * sys_width,
  },
  title: {
    ...getText('heavy', 0.15),
    color: 'white',
    height: 0.13 * styles_width,
  },
  header_row: {
    marginTop: 15,
    flexDirection: 'row',
    width: sys_width,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
  },
  loader: {
    height: styles_width * 0.1,
    width: styles_width * 0.1,
    marginRight: styles_width * 0.03,
  },
  logo: {
    width: styles_width * 0.25,
    height: styles_width * 0.125,
  },
  add_button: {
    width: sys_width,
    backgroundColor: colors.darkest,
    paddingTop: Math.min(sys_height * 0.02, sys_width * 0.03),
    paddingBottom: Math.min(sys_height * 0.03, sys_width * 0.05),
    borderTopLeftRadius: round_fac * 20,
    borderTopRightRadius: round_fac * 20,
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  add_icon: {
    width: sys_width * 0.12,
    height: sys_width * 0.12,
  },
  action_container: {
    flexDirection: 'row',
    width: sys_width,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: styles_width * 0.04,
  },
  counter_text: {
    ...getText('heavy', 0.15),
    color: 'white',
    marginBottom: styles_width * 0.02,
  },
  counter_text_parent: {
    borderRadius: round_fac * 20,
    paddingTop: styles_width * 0.025,
    paddingBottom: styles_width * 0.005,
    paddingHorizontal: styles_width * 0.04,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter_button: {
    height: styles_width * 0.1,
    width: styles_width * 0.1,
    marginBottom: styles_width * 0.02,
    marginHorizontal: styles_width * 0.1,
  },
})
