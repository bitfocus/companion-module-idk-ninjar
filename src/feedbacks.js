const { combineRgb } = require('@companion-module/base')

module.exports = {
	initFeedbacks: function () {
		let self = this
		let feedbacks = {}

		const colorWhite = combineRgb(255, 255, 255) // White
		const colorRed = combineRgb(255, 0, 0) // Red

		feedbacks.videoChannel = {
			type: 'boolean',
			name: 'Selected Video Input is Routed to Selected Video Output',
			description:
				'Change the button color based on the selected video input being routed to the selected video output',
			defaultStyle: {
				color: colorWhite,
				bgcolor: colorRed,
			},
			options: [
				{
					type: 'number',
					label: 'Input Channel Number',
					id: 'input',
					default: 1,
					min: 1,
					max: 512,
					required: true,
				},
				{
					type: 'number',
					label: 'Output Channel Number',
					id: 'output',
					default: 1,
					min: 1,
					max: 512,
					required: true,
				},
			],
			callback: function (feedback, bank) {
				let options = feedback.options
				let input = options.input
				let output = options.output

				if (self.DATA.outputs[`${output}`].currentVideoInput === input) {
					return true
				}

				return false
			},
		}

		feedbacks.audioChannel = {
			type: 'boolean',
			name: 'Selected Audio Input is Routed to Selected Audio Output',
			description:
				'Change the button color based on the selected audio input being routed to the selected audio output',
			defaultStyle: {
				color: colorWhite,
				bgcolor: colorRed,
			},
			options: [
				{
					type: 'number',
					label: 'Input Channel Number',
					id: 'input',
					default: 1,
					min: 1,
					max: 512,
					required: true,
				},
				{
					type: 'number',
					label: 'Output Channel Number',
					id: 'output',
					default: 1,
					min: 1,
					max: 512,
					required: true,
				},
			],
			callback: function (feedback, bank) {
				let options = feedback.options
				let input = options.input
				let output = options.output

				//self.DATA.outputs[`${audioChannel}`].currentAudioInput = audioInput

				if (self.DATA.outputs[`${output}`].currentAudioInput === input) {
					return true
				}

				return false
			},
		}

		self.setFeedbackDefinitions(feedbacks)
	},
}
