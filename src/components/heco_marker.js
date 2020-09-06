import React, {PureComponent, useState} from 'react'
import {Image, StyleSheet, Text, ImageBackground} from 'react-native'
import {Marker} from 'react-native-maps'
import PropTypes from 'prop-types'
import colors from '@colors'
import {getText} from '@styles'

const HMarker = ({clickMarker, coordinate}) => {

	const [tracks, setTracks] = useState(true)

	return (
		<Marker
			coordinate={coordinate}
			tracksViewChanges={tracks}
			onPress={clickMarker}>
			<Image
				onLoad={_ => setTracks(false)}
				source={require('@assets/icons/marker.png')}
				style={styles.image}
				fadeDuration={0}
			/>
		</Marker>
	)
}

const HCluster = _ => (
	<ImageBackground
		source={require('@assets/icons/marker.png')}
		style={styles.cluster}>
		<Text style={styles.cluster_text}>0</Text>
	</ImageBackground>
)

export {HMarker, HCluster}

HMarker.propTypes = {
	clickMarker: PropTypes.func,
	coordinate: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
	image: {
		width: 35,
		height: 35,
	},
	cluster: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	cluster_text: {
		...getText('bold', 0.05),
		color: colors.txt_dark,
	},
})
