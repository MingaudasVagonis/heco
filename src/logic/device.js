import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import Geolocation from '@react-native-community/geolocation'
import {PERMISSIONS, check, request, RESULTS} from 'react-native-permissions'
import {Platform} from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'

const options = {
  enableVibrateFallback: true,
}

/**
 * Returns a bool from async storage
 *
 * @param {string} id                      - Value's id
 * @param {bool}   [default_value = false] - Value to be returned if it does not exist in storage.
 * @returns {bool}
 * @public
 */
export const getBool = async (id, default_value = false) =>
  ((await AsyncStorage.getItem(`heco_${id}`)) || default_value.toString()) === 'true'

/**
 * Adds value to async storage
 *
 * @param {string} id    - Value's id
 * @param {any}    value - Value
 * @public
 */
export const add = async (id, value) =>
  await AsyncStorage.setItem(`heco_${id}`, value.toString())

/**
 * Creates haptic vibration
 *
 * @param {string} [type = 'impacktLight'] - Vibration type
 * @public
 */
export const vibrate = (type = 'impactLight') =>
  ReactNativeHapticFeedback.trigger(type, options)

/**
 * Returns user's location in an async/await form, returning
 * undefined in case of an error
 *
 * @returns {object}
 * @public
 */
export const getLocation = _ =>
  new Promise(async resolve => {
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      err => {
        resolve()
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
      },
    )
  })

/**
 * Requesting permission
 *
 * @param {string} code      Permission's code
 * @param {func}   [success] Success callback
 * @public
 */
export const phRequest = async (code, success) => {
  const result = await request(phPermissions[code])
  if (result === 'granted' && success) {
    await success()
  }
}

/**
 * Checks whether permission is granted and requests if not
 *
 * @param {string} code Permission's code
 * @param {func}   [success] Success callback
 * @param {func}   [failure] Failure callback
 * @public
 */
export const phCheckAndRequest = async (code, success, failure) => {
  code = phPermissions[code]

  try {
    let permission = await check(code)

    switch (permission) {
      case RESULTS.DENIED:
        const result = await request(code)

        if (result !== 'granted')
          failure?.()
        else success?.()

        break

      case RESULTS.BLOCKED:
        failure?.('Permission blocked in your device settings')
        break

      case RESULTS.GRANTED:
        success?.()
        break
    }
  } catch (err) {
    failure?.('Permission not granted')
  }
}

/**
 * Returns a bool whether permission is granted
 *
 * @param {string} code Permission's code
 * @returns {bool}
 * @public
 */
export const phCheck = async code => {
  try {
    if (await check(phPermissions[code])) return true
    return false
  } catch (err) {
    return false
  }
}

const phPermissions = {
  LOCATION:
    Platform.OS === 'ios'
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  CALENDAR:
    Platform.OS === 'ios'
      ? PERMISSIONS.IOS.CALENDARS
      : PERMISSIONS.ANDROID.WRITE_CALENDAR,
}
