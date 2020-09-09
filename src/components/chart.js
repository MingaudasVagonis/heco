import React from 'react'
import {View, StyleSheet, Text, Animated} from 'react-native'
import {LineChart} from 'react-native-chart-kit'
import {
	sys_width,
	sys_height,
	getText,
	round_fac,
	styles_width,
	getShadow,
} from '@styles'
import LinearGradient from 'react-native-linear-gradient'
import {FlingGestureHandler, Directions} from 'react-native-gesture-handler'
import colors from '@colors'
import moment from "moment"

class Chart extends React.Component {

	constructor(props) {
		super(props)

		this._anim = new Animated.Value(props.order)

		this._order = props.order

		this.state = {
			opacity: 1
		}
	}

	_pos() {

		return {
			opacity: this.state.opacity,
			transform: [
				{
					translateY: this._anim.interpolate({
						inputRange: [-1, 0, 1],
						outputRange: [-chart_height, 0, chart_height],
					}),
				},
				{
					scale: this._anim.interpolate({
						inputRange: [-1, 0, 1],
						outputRange: [0.8, 1, 0.8],
						extrapolate: 'clamp',
					}),
				},
			],
			zIndex: this._anim.interpolate({
				inputRange:[-1,0,1],
				outputRange: [0, 2, 0]
			})
		}
	}

	move(alter) {

		this._order = this._order - alter

		if(Math.abs(this._order) > 1){
			this._order = alter
			this._anim.setValue(this._order)
		} else Animated.spring(this._anim, {
			useNativeDriver: false,
			toValue: this._order,
		}).start()
	}

	render() {
		const {label, data} = this.props
		return (
			<Animated.View style={this._pos()}>
				<LinearGradient
					colors={[colors.primary, colors.secondary]}
					style={styles.chart_parent}>
					<Text style={styles.title}>{titles[label]}</Text>
					{ data ? <LineChart
						style={{marginLeft: label === "month" ? -0.08 * sys_width : -0.05 * sys_width}}
						data={{
							labels: getLabel(label, data),
							datasets: [
								{
									data
								},
							],
						}}
						fromZero={true}
						transparent={true}
						width={sys_width}
						height={220}
						chartConfig={{
							decimalPlaces: 0,
							color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
							labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
							propsForDots: {
								r: label === "month"? '3' : '5',
								strokeWidth: '2',
								stroke: "#cccccc",
							},
						}}
						bezier
					/> : null }
				</LinearGradient>
			</Animated.View>
		)
	}
}

export default Chart

const op = Math.floor(31 / 3 + (31 % 3))

const labels = {
	year: Array.from(Array(12), (_, i) => i + 1 + ''),
	month: Array.from(Array(op), (_, i) => i * 3 + 1 + ''),
	week: Array.from(Array(7), (_, i) => i + 1 + ''),
}

const titles = {
	year: 'This Year',
	month: moment().format("MMMM"),
	week: 'This Week',
}

const getLabel = (label, data) => {

	switch(label){
		case "year":
			return Array.from(Array(12), (_, i) => i + 1 + '')
		case "month": 
			return Array.from(Array(data.length), (_, i) => i% 2 === 0 ? i + 1 + '' : '')
		default: 
			return ["M", "T", "W", "T", "F", "S", "S"]

	}
}

const chart_height = 220 + 0.12 * styles_width

const styles = StyleSheet.create({
	chart_parent: {
		borderRadius: 25 * round_fac,
		position: 'absolute',
		top: 0,
		width: sys_width * 0.95,
		height: chart_height
	},
	title: {
		color: 'white',
		...getText('heavy', 0.08),
		marginTop: 0.03 * styles_width,
		marginBottom: 0.01 * styles_width,
		marginLeft: 0.04 * styles_width,
	},
})
