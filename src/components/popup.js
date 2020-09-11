import React from 'react'
import {View, Text, Animated, StyleSheet} from 'react-native'
import colors from '@colors'
import {
  round_fac,
  sys_width,
  getText,
  sys_height,
  getShadow,
  gradient,
  styles_width,
} from '@styles'
import LinearGradient from 'react-native-linear-gradient'
import {vibrate} from '@logic/device.js'

const status = {
  error: {
    title: 'Error',
    main: colors.primary,
    border: colors.secondary,
    time: 2500,
    haptic: 'notificationError',
  },
  warn: {
    title: 'Warning',
    main: colors.primary,
    border: colors.secondary,
    time: 2000,
    haptic: 'notificationWarning',
  },
  ok: {
    title: 'Success',
    main: colors.primary,
    border: colors.secondary,
    time: 1500,
    haptic: 'notificationSuccess',
  },
}

const Gradient = Animated.createAnimatedComponent(LinearGradient)

/**
 * Component that displays alerts on top of the content
 * 
 * @component
 */
class PopUp extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      status: {},
      text: '',
    }

    this._scale = new Animated.Value(0)
  }

  /**
   * Hides the popup
   *
   * @private
   */
  hide() {
    Animated.spring(this._scale, {
      duration: 300,
      toValue: 0,
      friction: 6,
      useNativeDriver: true,
    }).start()
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.text !== nextState.text
  }

  componentWillUnmount() {
    clearTimeout(this._timeout)
  }

  /**
   * Call the popup 
   *
   * @param {string} type - Popup type
   * @param {string} text - Text to display
   * @public
   */
  call(type, text) {
    clearTimeout(this._timeout)

    this.setState({
      status: status[type],
      text,
    })

    /* Vibrate according to type */
    vibrate(status[type].haptic)

    Animated.spring(this._scale, {
      duration: 200,
      friction: 6,
      toValue: 1,
      useNativeDriver: true,
    }).start(done => {
      /* To prevent finishing after already unmounted */
      if (done.finished) {
        this._timeout = setTimeout(this.hide.bind(this), this.state.status.time)
      }
    })
  }

  /**
   * Returns dynamic style
   *
   * @private
   */
  _get_scale = () => ({
    transform: [
      {
        translateY: this._scale.interpolate({
          inputRange: [0, 1],
          outputRange: [sys_height * 0.4, 50],
        }),
      },
    ],
  })

  render() {
    const {text, status} = this.state

    /* Before the first call */
    if (!status.main)
      return <View />

    return (
      <Gradient
        {...gradient(status.main, status.border, [
          styles.container,
          this._get_scale(),
        ])}>
        <View style={styles.title_parent}>
          <Text style={[styles.title, {color: status.main}]}>
            {status.title}
          </Text>
        </View>
        <Text style={styles.text}>{text}</Text>
      </Gradient>
    )
  }
}

export default PopUp

const styles = StyleSheet.create({
  container: {
    width: sys_width,
    position: 'absolute',
    bottom: 0,
    zIndex: 9999,
    ...getShadow(3, 5, 0.5),
    paddingBottom: 50,
  },
  title_parent: {
    backgroundColor: 'white',
    borderTopRightRadius: 25 * round_fac,
    borderBottomRightRadius: 25 * round_fac,
    paddingLeft: 20,
    paddingRight: 85,
    paddingBottom: 8,
    paddingTop: 10,
    marginTop: Math.min(styles_width * 0.04, 15),
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: styles_width * 0.085,
    lineHeight: styles_width * 0.085,
    fontFamily: 'SFProDisplay-Heavy',
  },
  text: {
    color: '#fff',
    ...getText('bold', 0.07),
    marginTop: 10,
    marginHorizontal: 15,
    marginBottom: Math.min(styles_width * 0.045, 17),
  },
})
