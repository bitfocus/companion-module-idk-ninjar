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
					max: 512,
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
					type: 'dropdown',
					label: 'Input Channel Number',
					id: 'input',
					choices: self.getInputChannels(),
					required: true,
				},
				{
					type: 'dropdown',
					label: 'Output Channel Number',
					id: 'output',
					choices: self.getOutputChannels(),
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
					type: 'dropdown',
					label: 'Input Channel Number',
					id: 'input',
					choices: self.getInputChannels(),
					required: true,
				},
				{
					type: 'dropdown',
					label: 'Output Channel Number',
					id: 'output',
					choices: self.getOutputChannels(),
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
					type: 'dropdown',
					label: 'Input Channel Number',
					id: 'input',
					choices: self.getInputChannels(),
					required: true,
				},
				{
					type: 'dropdown',
					label: 'Output Channel Number',
					id: 'output',
					choices: self.getOutputChannels(),
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
		// 設定が変更されたときに呼ばれるイベント
		self.configUpdated = async function () {
			// `inputChannels` と `outputChannels` が更新された場合、再評価して `choices` を更新
			actions.switchVideoChannel.options[0].choices = self.getInputChannels() // Inputのchoices
			actions.switchVideoChannel.options[1].choices = self.getOutputChannels() // Outputのchoices

			actions.switchAudioChannel.options[0].choices = self.getInputChannels() // Inputのchoices
			actions.switchAudioChannel.options[1].choices = self.getOutputChannels() // Outputのchoices

			actions.switchVideoAndAudioChannel.options[0].choices = self.getInputChannels() // Inputのchoices
			actions.switchVideoAndAudioChannel.options[1].choices = self.getOutputChannels() // Outputのchoices

			self.setActionDefinitions(actions) // 再度定義を更新
		}
		/// 動的に `inputChannels` を取得する関数
		self.getInputChannels = function () {
			// self.DATA.inputs.channelNo が正しく設定されていることを確認
			const inputChannels = Array.isArray(self.DATA.inputs.channelNo) ? self.DATA.inputs.channelNo : []
			if (!inputChannels.includes(0)) inputChannels.unshift(0)
			return inputChannels.map((ch) => ({ id: ch, label: `Input ${ch}` }))
		}

		// 動的に `outputChannels` を取得する関数
		self.getOutputChannels = function () {
			// self.DATA.outputs.channelNo が正しく設定されていることを確認
			const outputChannels = Array.isArray(self.DATA.outputs.channelNo) ? self.DATA.outputs.channelNo : []
			if (!outputChannels.includes(0)) outputChannels.unshift(0)
			return outputChannels.map((ch) => ({ id: ch, label: `Output ${ch}` }))
		}

		self.setActionDefinitions(actions)
	},
}
