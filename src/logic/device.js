import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import Geolocation from '@react-native-community/geolocation'
import {
	PERMISSIONS,
	check,
	request,
	RESULTS,
	checkNotifications,
	requestNotifications,
} from 'react-native-permissions'
import {Platform} from 'react-native'

const options = {
	enableVibrateFallback: true,
}

const lightVibrate = _ =>
	ReactNativeHapticFeedback.trigger('impactLight', options)

const vibrate = type => ReactNativeHapticFeedback.trigger(type, options)

const getLocation = _ =>
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

const phRequest = async (code, success) => {
	const result = await request(phPermissions[code])
	if (result === 'granted' && success) await success()
}

const phCheck = async code => {
	try {

		switch (await check(phPermissions[code])) {
			case RESULTS.GRANTED:
				return true
			default:
				return false
		}
	} catch (err) {
		return false
	}
}

const phCheckAndRequest = async (code, success, failure) => {
	code = phPermissions[code]

	try {
		let permission = await check(code)

		switch (permission) {
			case RESULTS.DENIED:
				const result = await request(code)

				if (result !== 'granted') failure()
				else if (success) success()

				break

			case RESULTS.BLOCKED:
				failure('Permission blocked in your device settings')
				break

			case RESULTS.GRANTED:
				if (success) success()
				break
		}
	} catch (err) {
		failure('Permission not granted')
	}
}

export {phRequest, phCheckAndRequest, phCheck, lightVibrate, getLocation, vibrate}
