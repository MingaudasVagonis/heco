import React, {useRef, useEffect, useState} from 'react'
import {View, StyleSheet, Text, InteractionManager} from 'react-native'
import {
	sys_width,
	sys_height,
	getText,
	round_fac,
	styles_width,
	getShadow,
} from '@styles'
import {
	FlingGestureHandler,
	Directions,
	State,
} from 'react-native-gesture-handler'
import colors from '@colors'
import Chart from './chart.js'
import {request, PERMISSIONS} from 'react-native-permissions'

const chart_types = ['year', 'week', 'month']

const Statistics = ({onChangeFocus, data}) => {
	const charts = chart_types.map(_ => useRef(undefined))

	const focus = useRef(0)

	const move = (alter, event) => {
		if (event.nativeEvent.state !== State.ACTIVE) return

		charts.forEach(chart => chart.current.move(alter))

		if (Math.abs(focus.current + alter) > 1) focus.current = -alter
		else focus.current += alter

		InteractionManager.runAfterInteractions(_ =>
			onChangeFocus(chart_types[focus.current + 1]),
		)
	}

	return (
		<FlingGestureHandler
			direction={Directions.UP}
			onHandlerStateChange={move.bind(undefined, 1)}>
			<FlingGestureHandler
				direction={Directions.DOWN}
				onHandlerStateChange={move.bind(undefined, -1)}>
				<View style={styles.container}>
					<View style={styles.chart_container}>
						{data
							? chart_types.map((label, index) => (
									<Chart
										key={index}
										ref={charts[index]}
										order={index - 1}
										label={label}
										data={data[label]}
									/>
							  ))
							: null}
					</View>
				</View>
			</FlingGestureHandler>
		</FlingGestureHandler>
	)
}

export default Statistics

const styles = StyleSheet.create({
	container: {
		width: 0.95 * sys_width,
		marginTop: 0.05 * styles_width,
		backgroundColor: colors.txt_dark,
		borderRadius: 25 * round_fac,
	},
	chart_container: {
		borderRadius: 25 * round_fac,
		overflow: 'hidden',
		height: 265,
	},
	title: {
		...getText('heavy', 0.1),
	},
})
