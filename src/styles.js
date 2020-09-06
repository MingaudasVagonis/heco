import {StyleSheet, Dimensions} from 'react-native'

export const sys_height = Math.max(
	Dimensions.get('window').height,
	Dimensions.get('screen').height,
)

export const sys_width = Math.round(Dimensions.get('screen').width)

export const round_fac = sys_width > 375 ? 1.25 : sys_width < 300 ? 0.75 : 1

export const styles_width = Math.min(sys_width, 375)

export const getText = (type, size, line) => ({
	fontSize: styles_width * size,
	lineHeight: styles_width * (line ?? size),
	fontFamily: getFamily(type),
})

export const getShadow = (offset, radius, opacity = 0.25, color = '#9aa2b1') => ({
	shadowRadius: radius,
	shadowColor: color,
	shadowOpacity: opacity,
	shadowOffset: {
		width: 0,
		height: offset,
	},
})

export const gradient = (color0, color1, style, angle = 150) => ({
    colors: [color0, color1],
    useAngle: true,
    angle: angle,
    angleCenter: { x: 0.5, y: 0.6 },
    style: style
})


const getFamily = type => {
	switch (type) {
		case 'heavy':
			return 'SFProDisplay-Heavy'
		case 'bold':
			return 'SF UI Display'
		case 'medium':
			return 'San Francisco Display'
	}
}
