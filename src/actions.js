module.exports = {
	initActions: function () {
		let self = this
		let actions = {}

		actions.loadRegisteredCommand = {
			name: 'Load Registered Command',
			description: 'Send a registered command to the device',
			options: [
				{
					type: 'number',
					label: 'Command Number',
					id: 'command',
					default: 1,
					min: 1,
					max: 256,
					required: true,
				},
			],
			callback: async function (action) {
				let options = action.options
				let command = `@EXRC,0,0,1,${options.command}`
				self.sendCommand(command)
			},
		}

		actions.loadPresetCommand = {
			name: 'Load Preset',
			description: 'Send a preset command to the device',
			options: [
				{
					type: 'number',
					label: 'Command Number',
					id: 'command',
					default: 1,
					min: 1,
					max: 256,
					required: true,
				},
			],
			callback: async function (action) {
				let options = action.options
				let command = `@EXPC,0,0,1,${options.command}`
				self.sendCommand(command)
			},
		}

		actions.loadCrosspoint = {
			name: 'Load Crosspoint Preset',
			description: 'Load a crosspoint preset',
			options: [
				{
					type: 'number',
					label: 'Crosspoint Number',
					id: 'crosspoint',
					default: 1,
					min: 1,
					max: 512,
					required: true,
				},
			],
			callback: async function (action) {
				let options = action.options
				let command = `@RCM,0,0,1,${options.crosspoint}`
				self.sendCommand(command)
			},
		}

		actions.switchVideoChannel = {
			name: 'Switch Video Channel',
			description: 'Switch the output video channel to a specific video input channel',
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
			callback: async function (action) {
				let options = action.options
				let command = `@SSV,0,0,1,${options.input},${options.output}`
				self.sendCommand(command)
			},
		}

		actions.switchAudioChannel = {
			name: 'Switch Audio Channel',
			description: 'Switch the output audio channel to a specific audio input channel',
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
			callback: async function (action) {
				let options = action.options
				let command = `@SSA,0,0,1,${options.input},${options.output}`
				self.sendCommand(command)
			},
		}

		actions.switchVideoAndAudioChannel = {
			name: 'Switch Video and Audio Channel',
			description: 'Switch the output video and audio channel to a specific input channel',
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
			callback: async function (action) {
				let options = action.options
				let command = `@SSW,0,0,1,${options.input},${options.output}`
				self.sendCommand(command)
			},
		}

		actions.sendCustomCommand = {
			name: 'Send Custom Command',
			description: 'Send a custom command to the device',
			options: [
				{
					type: 'textinput',
					label: 'Command',
					id: 'command',
					default: '',
					useVariables: true,
				},
			],
			callback: async function (action) {
				let options = action.options
				let command = await self.parseVariablesInString(options.command)
				self.sendCommand(command)
			},
		}

		self.setActionDefinitions(actions)
	},
}
