module.exports = {
	// 🔥 `getInputChannels()` を `initActions()` の前に定義
	getInputChannels: function () {
		let self = this;
		console.log("Debug: getInputChannels() called"); // デバッグログ
		const inputChannels = Array.isArray(self.DATA?.inputs?.channelNo) ? self.DATA.inputs.channelNo : [];
		if (!inputChannels.includes(0)) inputChannels.unshift(0);
		return inputChannels.map((ch) => ({ id: ch, label: `Input ${ch}` }));
	},

	getOutputChannels: function () {
		let self = this;
		console.log("Debug: getOutputChannels() called"); // デバッグログ
		const outputChannels = Array.isArray(self.DATA?.outputs?.channelNo) ? self.DATA.outputs.channelNo : [];
		if (!outputChannels.includes(0)) outputChannels.unshift(0);
		return outputChannels.map((ch) => ({ id: ch, label: `Output ${ch}` }));
	},

	initActions: function () {
		let self = this;
		let actions = {};

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
				let options = action.options;
				let command = `@EXRC,0,0,1,${options.command}`;
				self.sendCommand(command);
			},
		};

		actions.switchVideoChannel = {
			name: 'Switch Video Channel',
			description: 'Switch the output video channel to a specific video input channel',
			options: [
				{
					type: 'dropdown',
					label: 'Input Channel Number',
					id: 'input',
					choices: self.getInputChannels(), // ここで関数を呼ぶ
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
				let options = action.options;
				let command = `@SSV,0,0,1,${options.input},${options.output}`;
				self.sendCommand(command);
			},
		};

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
				let options = action.options;
				let command = `@SSA,0,0,1,${options.input},${options.output}`;
				self.sendCommand(command);
			},
		};

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
				let options = action.options;
				let command = await self.parseVariablesInString(options.command);
				self.sendCommand(command);
			},
		};

		// 設定が変更されたときに呼ばれるイベント
		self.configUpdated = async function () {
			console.log("Debug: configUpdated() called"); // デバッグログ
			// `inputChannels` と `outputChannels` が更新された場合、再評価して `choices` を更新
			actions.switchVideoChannel.options[0].choices = self.getInputChannels();
			actions.switchVideoChannel.options[1].choices = self.getOutputChannels();

			actions.switchAudioChannel.options[0].choices = self.getInputChannels();
			actions.switchAudioChannel.options[1].choices = self.getOutputChannels();

			self.setActionDefinitions(actions);
		};

		// 初回アクション定義
		self.setActionDefinitions(actions);
	},
};
