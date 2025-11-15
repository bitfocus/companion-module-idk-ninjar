module.exports = {
	initVariables() {
		let self = this
		let variables = []

		let inputChannels = self.DATA?.inputs?.channelNo || [1, 2]
		let outputChannels = self.DATA?.outputs?.channelNo || [1, 2]

		// 入力チャンネルの変数を追加
		inputChannels.forEach((channel, i) => {
			if (channel === 0) return
			variables.push({
				variableId: `input_${channel}_signalstatus`,
				name: `Input Channel ${channel} - Signal Status`,
			})
			variables.push({
				variableId: `input_${channel}_signaltype`,
				name: `Input Channel ${channel} - Signal Type`,
			})
			variables.push({
				variableId: `input_${channel}_colordepth`,
				name: `Input Channel ${channel} - Color Depth`,
			})
			variables.push({
				variableId: `input_${channel}_videoinputwidth`,
				name: `Input Channel ${channel} - Video Input Width`,
			})
			variables.push({
				variableId: `input_${channel}_videoinputheight`,
				name: `Input Channel ${channel} - Video Input Height`,
			})
			variables.push({ variableId: `input_${channel}_videotype`, name: `Input Channel ${channel} - Video Type` })
			variables.push({ variableId: `input_${channel}_videosync`, name: `Input Channel ${channel} - Video Sync` })
			variables.push({
				variableId: `input_${channel}_hdcpauthentication`,
				name: `Input Channel ${channel} - HDCP Authentication`,
			})
			variables.push({
				variableId: `input_${channel}_audiosignalformat`,
				name: `Input Channel ${channel} - Audio Signal Format`,
			})
			variables.push({
				variableId: `input_${channel}_audiosamplingfrequency`,
				name: `Input Channel ${channel} - Audio Sampling Frequency`,
			})
		})

		// 出力チャンネルの変数を追加
		outputChannels.forEach((channel, i) => {
			if (channel === 0) return
			variables.push({
				variableId: `output_${channel}_video_input`,
				name: `Output Channel ${channel} - Video Input`,
			})
			variables.push({
				variableId: `output_${channel}_audio_input`,
				name: `Output Channel ${channel} - Audio Input`,
			})
			variables.push({
				variableId: `output_${channel}_signalstatus`,
				name: `Output Channel ${channel} - Signal Status`,
			})
			variables.push({
				variableId: `output_${channel}_signaltype`,
				name: `Output Channel ${channel} - Signal Type`,
			})
			variables.push({
				variableId: `output_${channel}_colordepth`,
				name: `Output Channel ${channel} - Color Depth`,
			})
			variables.push({
				variableId: `output_${channel}_videoinputwidth`,
				name: `Output Channel ${channel} - Video Input Width`,
			})
			variables.push({
				variableId: `output_${channel}_videoinputheight`,
				name: `Output Channel ${channel} - Video Input Height`,
			})
			variables.push({
				variableId: `output_${channel}_videotype`,
				name: `Output Channel ${channel} - Video Type`,
			})
			variables.push({
				variableId: `output_${channel}_videosync`,
				name: `Output Channel ${channel} - Video Sync`,
			})
			variables.push({
				variableId: `output_${channel}_hdcpauthentication`,
				name: `Output Channel ${channel} - HDCP Authentication`,
			})
			variables.push({
				variableId: `output_${channel}_audiosignalformat`,
				name: `Output Channel ${channel} - Audio Signal Format`,
			})
			variables.push({
				variableId: `output_${channel}_audiosamplingfrequency`,
				name: `Output Channel ${channel} - Audio Sampling Frequency`,
			})
		})

		self.setVariableDefinitions(variables)
		//console.log('Setting variable definitions:', variables);
	},
}
