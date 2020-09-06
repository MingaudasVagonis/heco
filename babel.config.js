module.exports = {
	presets: ['module:metro-react-native-babel-preset'],
	env: {
		production: {
			plugins: ["transform-remove-console"]
		}
	},
	plugins: [
		[
			'module-resolver',
			{
				root: ['.'],
				alias: {
					'@assets': './src/assets/',
					'@logic': './src/logic/',
					'@views': './src/views/',
					'@components': './src/components/',
					'@styles': './src/styles.js',
					'@colors': './src/colors.js'
				},
			},
		],
	],
};
