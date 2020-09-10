import React, {useEffect, useRef} from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native'
import {sys_width, round_fac, getText, getShadow, gradient} from '@styles'
import colors from '@colors'
import LinearGradient from 'react-native-linear-gradient'

const Tile = ({order, counter, selected, onSelect}) => {
  const left = order % 2 === 0

  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      delay: 100 + order * 100,
    }).start()
  })

  const getStyle = () => ({
    marginRight: left ? 0.05 * sys_width : 0,
    opacity: anim,
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
  })

  return (
    <TouchableWithoutFeedback onPress={() => onSelect(order)}>
      <Animated.View
        style={[
          styles.tile_shadow,
          getStyle(),
          selected ? styles.selected : {},
        ]}>
        <LinearGradient
          {...gradient(
            colors.primary,
            colors.secondary,
            styles.tile,
            left ? 150 : 230,
          )}>
          <View style={styles.text_container}>
            <Text style={styles.label}>{counter.label}</Text>
            <Text style={styles.count}>{counter.count}</Text>
          </View>
          <Image
            source={require('@assets/icons/pattern.png')}
            style={[styles.pattern, left ? {} : styles.invert]}
          />
        </LinearGradient>
      </Animated.View>
    </TouchableWithoutFeedback>
  )
}

export default Tile

const styles = StyleSheet.create({
  tile_shadow: {
    ...getShadow(20, 7, 1, '#000'),
    borderRadius: 28 * round_fac,
    width: ((1 - 0.15) / 2) * sys_width,
    aspectRatio: 1,
    marginVertical: 0.025 * sys_width,
  },
  tile: {
    width: '100%',
    height: '100%',
    borderRadius: 25 * round_fac,
    justifyContent: 'space-between',
  },
  text_container: {
    padding: 0.03 * sys_width,
  },
  label: {
    ...getText('heavy', 0.08),
    color: 'white',
    marginBottom: 0.01 * sys_width,
  },
  count: {
    ...getText('bold', 0.06),
    color: 'black',
  },
  pattern: {
    height: ((1 - 0.15) / 3) * sys_width,
    width: ((1 - 0.15) / 2) * sys_width,
    position: 'absolute',
    bottom: 0,
  },
  invert: {
    transform: [
      {
        rotateY: '180deg',
      },
    ],
  },
  selected: {
    borderWidth: 3,
    borderColor: 'white',
  },
})
