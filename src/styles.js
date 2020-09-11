import {Dimensions} from 'react-native'

export const sys_height = Math.max(
  Dimensions.get('window').height,
  Dimensions.get('screen').height,
)

export const sys_width = Math.round(Dimensions.get('screen').width)

/* Rounding factor that increases on bigger devices */
export const round_fac = sys_width > 375 ? 1.25 : sys_width < 300 ? 0.75 : 1

/* Width that prevents styling getting too bloated */
export const styles_width = Math.min(sys_width, 375)

/**
 * Creates an object with text properties
 *
 * @param {string} type   - Font type
 * @param {number} size   - Size in respect to device width
 * @param {number} [line] - Line height in respect to device width
 * @returns {object}
 */
export const getText = (type, size, line) => ({
  fontSize: styles_width * size,
  lineHeight: styles_width * (line ?? size),
  fontFamily: getFamily(type),
})

/**
 * Creates an object with shadow properties
 *
 * @param {number} offset              - Shadow's offset
 * @param {number} radius              - Shadow's radius
 * @param {number} [opacity = 0.25]    - Shadow's opacity
 * @param {number} [color = '#9aa2b1'] - Shadow's color
 * @returns {object}
 */
export const getShadow = (
  offset,
  radius,
  opacity = 0.25,
  color = '#9aa2b1',
) => ({
  shadowRadius: radius,
  shadowColor: color,
  shadowOpacity: opacity,
  shadowOffset: {
    width: 0,
    height: offset,
  },
})

/**
 * Creates an object with linear gradient properties
 *
 * @param {color} color0         - Start color
 * @param {color} color1         - End color
 * @param {object} style         - View's style
 * @param {number} [angle = 150] - Gradient's angle
 * @returns {object}
 */
export const gradient = (color0, color1, style, angle = 150) => ({
  colors: [color0, color1],
  useAngle: true,
  angle: angle,
  angleCenter: {x: 0.5, y: 0.6},
  style: style,
})

/**
 * Returns a font family
 *
 * @param {string} type - Font type
 * @returns {string}
 */
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
