module.exports = {
	DATA: {
		outputs: {},
		inputs: {},
	},

	// DATAの初期化関数
	initializeData() {
		for (let i = 1; i <= 512; i++) {
			this.DATA.outputs[i] = {
				currentVideoInput: null,
				currentAudioInput: null,
				// 他のプロパティ
			};

			this.DATA.inputs[i] = {
				signalStatus: null,
				signalType: null,
				// 他のプロパティ
			};
		}
	},
};