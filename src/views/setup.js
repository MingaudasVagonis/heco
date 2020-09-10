import React, {useState, useRef} from 'react'
import {
  View,
  StyleSheet,
  StatusBar,
  TextInput,
  Text,
  Image,
  SafeAreaView,
  TouchableWithoutFeedback,
} from 'react-native'
import {
  sys_width,
  sys_height,
  round_fac,
  getText,
  getShadow,
  gradient,
} from '@styles'
import colors from '@colors'
import LinearGradient from 'react-native-linear-gradient'
import {lightVibrate, phCheckAndRequest} from '@logic/device.js'
import PopUp from '@components/popup.js'
import {createBucket} from '@logic/buckets.js'
import LottieView from 'lottie-react-native'

const Setup = ({navigation}) => {
  const [label, onChangeText] = useState('')

  const popup = useRef(undefined)

  const enableLocation = () => {
    lightVibrate()

    phCheckAndRequest('LOCATION', undefined, msg =>
      popup.current?.call('error', msg),
    )
  }

  const proceed = async () => {
    lightVibrate()

    if (!label || label.length < 3) {
      popup.current?.call('error', "Counter's label is invalid")
      return
    }

    try {
      await createBucket()
    } catch {
      popup.current?.call('error', 'Failed to create the counter')
      return
    }

    navigation.navigate('Home')
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <SafeAreaView style={styles.safe_container}>
        <Image source={require('@assets/icons/logo.png')} style={styles.logo} />
        <Text style={styles.header}>Counter</Text>
        <TextInput
          style={styles.input}
          placeholder="Label"
          placeholderTextColor={'#9aa2b1'}
          onChangeText={text => onChangeText(text)}
          value={label}
        />
        <Text style={styles.header}>Location</Text>
        <View style={styles.locationParent}>
          <LottieView
            source={require('@assets/location.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
          <View style={styles.locationRight}>
            <Text style={styles.disclaimer}>
              Location is used to track your entries only while in use
            </Text>
            <TouchableWithoutFeedback onPress={enableLocation}>
              <View style={styles.shadow}>
                <LinearGradient
                  {...gradient(
                    colors.primary,
                    colors.secondary,
                    styles.enable,
                  )}>
                  <Text style={styles.enableText}>enable</Text>
                </LinearGradient>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </SafeAreaView>
      <TouchableWithoutFeedback onPress={proceed}>
        <LinearGradient
          {...gradient(colors.primary, colors.secondary, styles.proceed)}>
          <Text style={styles.enableText}>continue</Text>
        </LinearGradient>
      </TouchableWithoutFeedback>
      <PopUp ref={popup} />
    </View>
  )
}

export default Setup

const styles = StyleSheet.create({
  container: {
    width: sys_width,
    height: sys_height,
    backgroundColor: '#111111',
    alignItems: 'center',
  },
  logo: {
    width: sys_width * 0.4,
    height: sys_width * 0.2,
  },
  locationParent: {
    flexDirection: 'row',
    width: sys_width,
    marginTop: 0.025 * sys_width,
  },
  locationRight: {
    width: sys_width * 0.65,
    flexDirection: 'column',
  },
  lottie: {
    width: sys_width * 0.3,
  },
  disclaimer: {
    ...getText('bold', 0.06),
    color: '#9aa2b1',
    textAlign: 'center',
  },
  enable: {
    borderRadius: round_fac * 30,
    paddingVertical: sys_width * 0.04,
    alignItems: 'center',
    marginTop: 0.025 * sys_width,
  },
  proceed: {
    borderTopLeftRadius: round_fac * 30,
    borderBottomLeftRadius: round_fac * 30,
    paddingVertical: sys_width * 0.04,
    paddingLeft: sys_width * 0.15,
    paddingRight: sys_width * 0.1,
    alignItems: 'center',
    marginTop: 0.025 * sys_width,
    position: 'absolute',
    bottom: sys_width * 0.075,
    right: 0,
  },
  enableText: {
    ...getText('heavy', 0.09),
    color: 'white',
  },
  header: {
    ...getText('heavy', 0.13),
    color: 'white',
    alignSelf: 'flex-start',
    marginLeft: 0.025 * sys_width,
    marginTop: 0.075 * sys_width,
  },
  safe_container: {
    flex: 1,
    alignItems: 'center',
  },
  shadow: {
    ...getShadow(15, 7, 0.5, '#000'),
  },
  input: {
    marginVertical: 0.025 * sys_width,
    width: sys_width * 0.95,
    ...getShadow(20, 7, 0.5, '#000'),
    borderRadius: round_fac * 25,
    ...getText('heavy', 0.07, 0.08),
    padding: 0.05 * sys_width,
    backgroundColor: colors.txt_dark,
    color: 'white',
  },
})
