import React, {useState, useEffect, useRef} from 'react'
import {
	View,
	StyleSheet,
	StatusBar,
	TextInput,
	Text,
	ScrollView,
	TouchableWithoutFeedback,
} from 'react-native'
import {
	sys_width,
	sys_height,
	round_fac,
	getText,
	getShadow,
	gradient,
	styles_width
} from '@styles'
import colors from '@colors'
import LinearGradient from 'react-native-linear-gradient'
import Tile from '@components/tile.js'
import {lightVibrate} from '@logic/device.js'
import PopUp from '@components/popup.js'
import {
	createBucket,
	getIDs,
	getCounters,
	getDefault,
	changeDefault,
} from '@logic/buckets.js'
import LottieView from 'lottie-react-native'

const Library = _ => {
	const [label, onChangeText] = useState('')

	const [selected, setSelected] = useState(-1)

	const [counters, setCounters] = useState([])

	const popup = useRef(undefined)

	const onSelect = async index => {

		if(await changeDefault(counters[index].label)){

			lightVibrate()

			setSelected(index)
		}
		
	}

	useEffect(_ => {
		const fetch = async _ => {

			const _counters = await getCounters()

			const selectedLabel = await getDefault()

			setSelected(_counters.findIndex(c => c.label === selectedLabel))

			setCounters(_counters)
		}

		fetch()
	}, [])

	const addCounter = async _ => {
		if (!label || label.length < 3) {
			popup.current?.call('error', "Counter's label is invalid")
			return
		}

		try {
			const ids = await getIDs()

			if (ids.includes(label)) {
				popup.current?.call('error', 'Counter already exists')
				return
			}

			lightVibrate()

			await createBucket(label)

			setCounters(counters.concat({label, count: 0}))

			onChangeText('')
		} catch (err) {
			console.log(err)
			popup.current?.call('error', 'Failed to create the counter')
		}
	}

	return (
		<View style={styles.container}>
			<StatusBar backgroundColor="black" barStyle="light-content" />
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				overScrollMode="never"
				showsVerticalScrollIndicator={false}>
				<View style={styles.container}>
					<View style={styles.input_container}>
						<TextInput
							style={styles.input}
							placeholder="Label"
							placeholderTextColor={'#9aa2b1'}
							onChangeText={text => onChangeText(text)}
							value={label}
						/>
						<TouchableWithoutFeedback onPress={addCounter}>
							<LinearGradient
								{...gradient(
									colors.primary,
									colors.secondary,
									styles.add_button,
								)}>
								<Text style={styles.add_text}>+</Text>
							</LinearGradient>
						</TouchableWithoutFeedback>
					</View>
					<View style={styles.counter_header}>
						<Text style={styles.header}>Counters</Text>
						{counters.length === 0 ? (
							<LottieView
								source={require('@assets/loader.json')}
								autoPlay
								loop
								style={styles.loader}
							/>
						) : null}
					</View>
					<View style={styles.counter_parent}>
						{renderCounters(counters, selected, onSelect)}
					</View>
				</View>
			</ScrollView>
			<PopUp ref={popup} />
		</View>
	)
}

const renderCounters = (counters, selected, onSelect) => {
	if (counters.length === 0) return 

	return counters.map((counter, index) => (
		<Tile
			order={index}
			counter={counter}
			key={index}
			onSelect={onSelect}
			selected={selected === index}
		/>
	))
}

export default Library

const styles = StyleSheet.create({
	container: {
		width: sys_width,
		height: sys_height,
		backgroundColor: '#111111',
		alignItems: 'center',
	},
	add_button: {
		borderRadius: round_fac * 22,
		alignItems: 'center',
		aspectRatio: 1,
		marginLeft: 0.025 * sys_width,
		justifyContent: 'center',
		marginTop: 0.015 * sys_width,
	},
	counter_header: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: sys_width
	},
	add_text: {
		...getText('heavy', 0.07),
		color: 'white',
	},
	input_container: {
		flexDirection: 'row',
		paddingVertical: 0.05 * sys_width,
		paddingHorizontal: 0.025 * sys_width,
		...getShadow(20, 7, 1, '#000'),
	},
	loader: {
		height: styles_width * 0.1,
		width: styles_width * 0.1,
		marginRight: styles_width * 0.03,
	},
	counter_parent: {
		width: sys_width,
		flexDirection: 'row',
		paddingHorizontal: 0.05 * sys_width,
		flexWrap: 'wrap',
	},
	input: {
		flex: 1,
		borderRadius: round_fac * 25,
		...getText('heavy', 0.07, 0.08),
		padding: 0.05 * sys_width,
		backgroundColor: colors.txt_dark,
		color: 'white',
	},
	header: {
		...getText('heavy', 0.12),
		color: 'white',
		alignSelf: 'flex-start',
		marginLeft: 0.05 * sys_width,
	},
})
