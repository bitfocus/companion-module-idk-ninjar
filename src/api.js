const { InstanceStatus, TCPHelper } = require('@companion-module/base')

module.exports = {
	async initConnection() {
		let self = this

		//clear any existing intervals
		clearInterval(self.INTERVAL)
		clearInterval(self.RECONNECT_INTERVAL)

		if (self.config.host && self.config.host !== '') {
			self.updateStatus(InstanceStatus.Connecting)

			self.socket = new TCPHelper(self.config.host, self.config.port)

			self.socket.on('error', (error) => {
				self.log('error', error)
				self.updateStatus(InstanceStatus.UnknownError)
			})

			self.socket.on('connect', () => {
				self.updateStatus(InstanceStatus.Ok)
				self.getData() //get initial data
				//start polling, if enabled
				if (self.config.polling) {
					self.INTERVAL = setInterval(() => {
						self.getData()
					}, self.config.pollInterval)
				}
			})

			self.socket.on('data', (data) => {
				self.processData(data)
			})

			self.socket.on('close', () => {
				self.updateStatus(InstanceStatus.ConnectionFailure)
			})
		}
	},

	getData() {
		let self = this

		//get data from the device
		for (let i = 1; i < 512; i++) {
			self.sendCommand(`@GSVC,0,0,1,${i}`) //get video input of output i
			self.sendCommand(`@GSAC,0,0,1,${i}`) //get audio input of output i

			self.sendCommand(`@GCHS,1,${i},0`) //get input status
			self.sendCommand(`@GCHS,2,${i},0`) //get output status
		}
	},

	async processData(data) {
		let self = this

		let response = data.toString()
		let sections = response.split(',')

		if (sections[0].indexOf('@ERR') !== -1) {
			self.log('error', response)
			self.log('error', `Last Command: ${self.lastCommand}`)

			let errorCode = parseInt(sections[1]) //ensure this is an integer

			if (errorCode === 1) {
				self.log('error', 'Erroneous parameter format or value')
			} else if (errorCode === 2) {
				self.log('error', 'Undefined command or wrong format')
			} else if (errorCode === 3) {
				self.log('error', 'Currently cannot be used')
			} else if (errorCode === 99) {
				self.log('error', 'Unknown error')
			}

			return
		}

		let variableObj = {}

		switch (sections[0]) {
			case '@GSVC':
				let videoChannel = parseInt(sections[4])
				let input = parseInt(sections[5])
				self.DATA.outputs[`${videoChannel}`].currentVideoInput = input
				variableObj[`output_video_${videoChannel}_current_input`] = input
				break
			case '@GSAC':
				let audioChannel = parseInt(sections[4])
				let audioInput = parseInt(sections[5])
				self.DATA.outputs[`${audioChannel}`].currentAudioInput = audioInput
				variableObj[`output_audio_${audioChannel}_current_input`] = audioInput
				break
			case '@GCHS':
				let type = parseInt(sections[1])
				let channel = parseInt(sections[2])
				let status = parseInt(sections[3])

				//status is a / delimited list: signal status, signal type, color depth, video input format width, video input format height, interlaced/progressive, video input format vertical sync frequency, hdcp authentication, audio signal format, audio sampling frequency

				//signal status: 0 = no signal, 1 = signal present
				//signal type: - = no signal, H = HDMI, D = DVI, R = Analog RGB, Y = Analog YPbPr, V = Composite, S = S-Video
				//color depth: 24 = 24 bit, 30 = 30 bit, 0 = no signal
				//video input format width: 0-4096
				//video input format height: 0-4096
				//interlaced/progressive: I = interlaced, P = progressive, - = no signal
				//video input format vertical sync frequency: 0 = no signal
				//hdcp authentication: string
				//audio signal format: string
				//audio sampling frequency: string

				//parse the status
				try {
					let statusSections = sections[3].split('/')
					let signalStatus = parseInt(statusSections[0])
					let signalType = statusSections[1]
					let colorDepth = parseInt(statusSections[2])
					let videoInputWidth = parseInt(statusSections[3])
					let videoInputHeight = parseInt(statusSections[4])
					let videoType = statusSections[5]
					let videoSync = parseInt(statusSections[6])
					let hdcpAuthentication = statusSections[7]
					let audioSignalFormat = statusSections[8]
					let audioSamplingFrequency = statusSections[9] || ''

					if (type === 1) {
						self.DATA.inputs[channel].signalStatus = signalStatus
						self.DATA.inputs[channel].signalType = signalType
						self.DATA.inputs[channel].colorDepth = colorDepth
						self.DATA.inputs[channel].videoInputWidth = videoInputWidth
						self.DATA.inputs[channel].videoInputHeight = videoInputHeight
						self.DATA.inputs[channel].videoType = videoType
						self.DATA.inputs[channel].videoSync = videoSync
						self.DATA.inputs[channel].hdcpAuthentication = hdcpAuthentication
						self.DATA.inputs[channel].audioSignalFormat = audioSignalFormat
						self.DATA.inputs[channel].audioSamplingFrequency = audioSamplingFrequency

						variableObj[`input_${channel}_signalstatus`] = signalStatus
						variableObj[`input_${channel}_signaltype`] = signalType
						variableObj[`input_${channel}_colordepth`] = colorDepth
						variableObj[`input_${channel}_videoinputwidth`] = videoInputWidth
						variableObj[`input_${channel}_videoinputheight`] = videoInputHeight
						variableObj[`input_${channel}_videotype`] = videoType
						variableObj[`input_${channel}_videosync`] = videoSync
						variableObj[`input_${channel}_hdcpauthentication`] = hdcpAuthentication
						variableObj[`input_${channel}_audiosignalformat`] = audioSignalFormat
						variableObj[`input_${channel}_audiosamplingfrequency`] = audioSamplingFrequency
					} else if (type === 2) {
						self.DATA.outputs[channel].signalStatus = signalStatus
						self.DATA.outputs[channel].signalType = signalType
						self.DATA.outputs[channel].colorDepth = colorDepth
						self.DATA.outputs[channel].videoInputWidth = videoInputWidth
						self.DATA.outputs[channel].videoInputHeight = videoInputHeight
						self.DATA.outputs[channel].videoType = videoType
						self.DATA.outputs[channel].videoSync = videoSync
						self.DATA.outputs[channel].hdcpAuthentication = hdcpAuthentication
						self.DATA.outputs[channel].audioSignalFormat = audioSignalFormat
						self.DATA.outputs[channel].audioSamplingFrequency = audioSamplingFrequency

						variableObj[`output_${channel}_signalstatus`] = signalStatus
						variableObj[`output_${channel}_signaltype`] = signalType
						variableObj[`output_${channel}_colordepth`] = colorDepth
						variableObj[`output_${channel}_videoinputwidth`] = videoInputWidth
						variableObj[`output_${channel}_videoinputheight`] = videoInputHeight
						variableObj[`output_${channel}_videotype`] = videoType
						variableObj[`output_${channel}_videosync`] = videoSync
						variableObj[`output_${channel}_hdcpauthentication`] = hdcpAuthentication
						variableObj[`output_${channel}_audiosignalformat`] = audioSignalFormat
						variableObj[`output_${channel}_audiosamplingfrequency`] = audioSamplingFrequency
					}
				} catch (error) {
					console.log('error parsing status', error)
				}
				break
		}

		self.setVariableValues(variableObj)
		self.checkFeedbacks()
	},

	async sendCommand(command) {
		let self = this

		if (self.socket && self.socket.isConnected) {
			self.socket.send(command + '\r\n')
			self.lastCommand = command
		}
	},
}
