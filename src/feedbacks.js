const { combineRgb } = require('@companion-module/base')

module.exports = {
	initFeedbacks: function () {
		let self = this
		let feedbacks = {}

		const colorWhite = combineRgb(255, 255, 255) // White
		const colorRed = combineRgb(255, 0, 0) // Red

		feedbacks.matrixInputMute = {
			type: 'boolean',
			name: 'Matrix Input - Mute',
			description: 'Change the button color based on the Matrix Input Mute State',
			defaultStyle: {
				color: colorWhite,
				bgcolor: colorRed,
			},
			options: [
				{
					type: 'number',
					label: 'Matrix Input',
					id: 'matrixinput',
					default: 1,
					min: 1,
					max: 64,
					required: true,
				},
			],
			callback: function (feedback, bank) {
				let options = feedback.options
				let input = options.matrixinput

				if (self.matrixInput[input].mute === 1) {
					return true
				}

				return false
			},
		}
		self.setFeedbackDefinitions(feedbacks)
	},
}
