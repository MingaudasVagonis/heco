import React from 'react'
import {
	View,
	PropTypes,
	StyleSheet,
	Text,
	SafeAreaView,
	Image,
	Pressable,
	StatusBar,
	AppState,
	DeviceEventEmitter,
} from 'react-native'
import {
	sys_width,
	sys_height,
	getText,
	styles_width,
	round_fac,
	getShadow,
	gradient,
} from '@styles'
import colors from '@colors'
import {lightVibrate} from '@logic/device'
import Statistics from '@components/statistics'
import {
	getBucket,
	sortBucket,
	update,
	changeDefault,
	commit,
	getDefault
} from '@logic/buckets'
import HMap from '@components/heco_map.js'
import {phCheck, phCheckAndRequest} from '@logic/device.js'
import PopUp from '@components/popup.js'
import moment from 'moment'
import LottieView from 'lottie-react-native'
//import { useFocusEffect } from '@react-navigation/native';

class Home extends React.Component {
	constructor(props) {
		super(props)

		this.lastDefault = undefined

		this.state = {
			count: undefined,
			data: {
				statistics: {},
				entries: {},
			},
			focus: 'week',
			loading: true,
		}
	}

	componentDidMount() {
		AppState.addEventListener('change', this.handleAppStateChange.bind(this))

		this.date = moment()

		this._loadBucket()
		
	}

	async _loadBucket(){

		this.bucket = await getBucket(await getDefault())

		const data = await sortBucket(this.bucket.counter)

		const locationEnabled = await phCheck('LOCATION')

		this.setState({count: this.bucket.today, data, locationEnabled, loading: false})
	}

	componentWillUnmount() {
		AppState.removeEventListener('change', this.handleAppStateChange.bind(this))
		clearTimeout(this._timeout)
	}

	add() {

		commit(this.bucket)

		lightVibrate()

		this.props.navigation.navigate('Library')
	}

	requestLocation() {

		if(this.state.loading)
			return

		lightVibrate()

		phCheckAndRequest(
			'LOCATION',
			_ => this.setState({locationEnabled: true}),
			msg => this._alert?.call('error', msg),
		)
	}

	onChangeFocus(focus) {
		this._timeout = setTimeout(_ => this.setState({focus}), 500)
	}

	shouldComponentUpdate = (nextProps, nextState) =>
		this.state.count !== nextState.count || this.state.focus !== nextState.focus

	async alter(change) {
		const {count, data} = this.state

		if (count + change < 0 || !this.bucket) return

		lightVibrate()

		const updated = await update(data, this.bucket.counter, this.date, change)

		this.setState(prev => ({count: (prev.count || 0) + change, data: updated}))
	}

	handleAppStateChange(nextAppState) {
		if (nextAppState === 'inactive') commit(this.bucket)
	}

	render() {
		const {count, data, focus, locationEnabled, loading} = this.state

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
					<Pressable style={styles.add_button} onPress={this.add.bind(this)}>
						<View style={styles.add_button}>
							<Image
								style={styles.add_icon}
								source={require('@assets/icons/icon_menu.png')}
							/>
						</View>
					</Pressable>
					<Statistics
						data={data.statistics}
						onChangeFocus={this.onChangeFocus.bind(this)}
					/>
					<View style={styles.action_container}>
						<Pressable onPress={this.alter.bind(this, -1)}>
							<Image
								style={styles.counter_button}
								source={require('@assets/icons/minus.png')}
							/>
						</Pressable>
						<View style={styles.counter_text_parent}>
							<Text style={styles.counter_text}>{count || 0}</Text>
						</View>
						<Pressable onPress={this.alter.bind(this, 1)}>
							<Image
								style={styles.counter_button}
								source={require('@assets/icons/plus.png')}
							/>
						</Pressable>
					</View>
					<HMap
						entries={data.entries[focus]}
						locationEnabled={locationEnabled}
						request={this.requestLocation.bind(this)}
					/>
				</SafeAreaView>
				<PopUp ref={ref => (this._alert = ref)} />
			</View>
		)
	}
}

export default Home

const styles = StyleSheet.create({
	container: {
		width: sys_width,
		height: sys_height,
		backgroundColor: 'black',
	},
	safe_container: {
		flex: 1,
		alignItems: 'center',
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
		paddingTop: styles_width * 0.07,
		paddingBottom: styles_width * 0.09,
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
