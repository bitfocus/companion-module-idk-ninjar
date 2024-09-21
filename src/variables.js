module.exports = {
	initVariables() {
		let self = this
		let variables = []

		//output channels 1-512 current input
		for (let i = 1; i <= 512; i++) {
			variables.push({ variableId: `output_${i}_video_input`, name: `Output Channel ${i} - Video Input` })
			variables.push({ variableId: `output_${i}_audio_input`, name: `Output Channel ${i} - Audio Input` })

			variables.push({ variableId: `output_${i}_signalstatus`, name: `Output Channel ${i} - Signal Status` })
			variables.push({ variableId: `output_${i}_signaltype`, name: `Output Channel ${i} - Signal Type` })
			variables.push({ variableId: `output_${i}_colordepth`, name: `Output Channel ${i} - Color Depth` })
			variables.push({
				variableId: `output_${i}_videoinputwidth`,
				name: `Output Channel ${i} - Video Input Width`,
			})
			variables.push({
				variableId: `output_${i}_videoinputheight`,
				name: `Output Channel ${i} - Video Input Height`,
			})
			variables.push({ variableId: `output_${i}_videotype`, name: `Output Channel ${i} - Video Type` })
			variables.push({ variableId: `output_${i}_videosync`, name: `Output Channel ${i} - Video Sync` })
			variables.push({
				variableId: `output_${i}_hdcpauthentication`,
				name: `Output Channel ${i} - HDCP Authentication`,
			})
			variables.push({
				variableId: `output_${i}_audiosignalformat`,
				name: `Output Channel ${i} - Audio Signal Format`,
			})
			variables.push({
				variableId: `output_${i}_audiosamplingfrequency`,
				name: `Output Channel ${i} - Audio Sampling Frequency`,
			})

			variables.push({ variableId: `input_${i}_signalstatus`, name: `Input Channel ${i} - Signal Status` })
			variables.push({ variableId: `input_${i}_signaltype`, name: `Input Channel ${i} - Signal Type` })
			variables.push({ variableId: `input_${i}_colordepth`, name: `Input Channel ${i} - Color Depth` })
			variables.push({ variableId: `input_${i}_videoinputwidth`, name: `Input Channel ${i} - Video Input Width` })
			variables.push({
				variableId: `input_${i}_videoinputheight`,
				name: `Input Channel ${i} - Video Input Height`,
			})
			variables.push({ variableId: `input_${i}_videotype`, name: `Input Channel ${i} - Video Type` })
			variables.push({ variableId: `input_${i}_videosync`, name: `Input Channel ${i} - Video Sync` })
			variables.push({
				variableId: `input_${i}_hdcpauthentication`,
				name: `Input Channel ${i} - HDCP Authentication`,
			})
			variables.push({
				variableId: `input_${i}_audiosignalformat`,
				name: `Input Channel ${i} - Audio Signal Format`,
			})
			variables.push({
				variableId: `input_${i}_audiosamplingfrequency`,
				name: `Input Channel ${i} - Audio Sampling Frequency`,
			})
		}

		self.setVariableDefinitions(variables)
	},
}
