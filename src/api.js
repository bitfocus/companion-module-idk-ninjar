const { InstanceStatus, TCPHelper } = require('@companion-module/base')

module.exports = {
	DATA: {
		outputs: {},
		inputs: {},
	},
	async initConnection() {
		let self = this

		//clear any existing intervals
		clearInterval(self.INTERVAL)
		clearInterval(self.RECONNECT_INTERVAL)

		if (self.config.host && self.config.host !== '') {
			self.updateStatus(InstanceStatus.Connecting)

			self.socket = new TCPHelper(self.config.host, self.config.port)

			self.socket.on('error', (error) => {
				self.log('error', JSON.stringify(error, null, 2))
				self.updateStatus(InstanceStatus.UnknownError)
			})

			self.socket.on('connect', () => {
				self.updateStatus(InstanceStatus.Ok)
				self.sendCommand('@GCHE,1,0,1,1')
				self.sendCommand('@GCHE,2,0,1,1')
				self.getData() //get initial data
				//start polling, if enabled
				if (self.config.polling) {
					self.INTERVAL = setInterval(() => {
						self.sendCommand('@GIV,0,0,1')
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

		// 入力チャンネル処理
		let inputChannels = self.DATA?.inputs?.channelNo || [] // デフォルトで空配列
		if (Array.isArray(inputChannels) && inputChannels.length > 0) {
			//console.log("Input Channels: ", inputChannels);

			inputChannels.forEach((channel) => {
				if (channel === 0 || channel === -1) {
					return // 処理をスキップ
				}
				// 各チャンネルに対してコマンドを送信
				self.sendCommand(`@GSV,0,0,1,${channel}`) // ビデオ入力
				self.sendCommand(`@GSA,0,0,1,${channel}`) // オーディオ入力
				self.sendCommand(`@GCHS,1,${channel},0`) // 入力状態
				self.sendCommand(`@GCHS,2,${channel},0`) // 出力状態
			})
		} else {
			//console.log("Error: inputChannels is not defined or empty.");
			self.DATA.inputs = self.DATA.inputs || {} // 初期化
			self.DATA.inputs.channelNo = [] // 空配列に設定
		}

		// 出力チャンネル処理
		let outputChannels = self.DATA?.outputs?.channelNo || [] // デフォルトで空配列
		if (Array.isArray(outputChannels) && outputChannels.length > 0) {
			//console.log("Output Channels: ", outputChannels);

			outputChannels.forEach((channel) => {
				if (channel === 0 || channel === -1) {
					return // 処理をスキップ
				}
				// 各チャンネルに対してコマンドを送信
				self.sendCommand(`@GSV,0,0,1,${channel}`) // ビデオ入力
				self.sendCommand(`@GSA,0,0,1,${channel}`) // オーディオ入力
				self.sendCommand(`@GCHS,1,${channel},0`) // 入力状態
				self.sendCommand(`@GCHS,2,${channel},0`) // 出力状態
			})
		} else {
			//console.log("Error: outputChannels is not defined or empty.");
			self.DATA.outputs = self.DATA.outputs || {} // 初期化
			self.DATA.outputs.channelNo = [] // 空配列に設定
		}
	},
	async processData(data) {
		let self = this
		let response = data.toString()
		// 複数のレスポンスがある場合に分割
		let responses = response.split('\r\n').filter((line) => line.trim() !== '')

		responses.forEach((res) => {
			console.log('Processing response:', res) // どのレスポンスが処理されているか確認
			let sections = res.split(',')
			console.log('Split response into sections:', sections) // sectionsを確認

			if (sections[0].indexOf('@ERR') !== -1) {
				self.log('error', response)
				self.log('error', `Last Command: ${self.lastCommand}`)

				let errorCode = parseInt(sections[1])
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
				case '@GSV':
					let videoChannel = parseInt(sections[4])
					let input = parseInt(sections[5])

					// outputs[videoChannel]を動的に初期化
					if (!self.DATA.outputs[videoChannel]) {
						self.DATA.outputs[videoChannel] = {}
					}
					self.DATA.outputs[videoChannel].currentVideoInput = input
					variableObj[`output_video_${videoChannel}_current_input`] = input
					break

				case '@GSA':
					let audioChannel = parseInt(sections[4])
					let audioInput = parseInt(sections[5])

					// outputs[audioChannel]を動的に初期化
					if (!self.DATA.outputs[audioChannel]) {
						self.DATA.outputs[audioChannel] = {}
					}
					self.DATA.outputs[audioChannel].currentAudioInput = audioInput
					variableObj[`output_audio_${audioChannel}_current_input`] = audioInput
					break

				case '@GCHS':
					let type = parseInt(sections[1])
					let channel = parseInt(sections[2])
					let status = parseInt(sections[3])

					try {
						let statusSections = sections[4].split('/')
						console.log('Parsed statusSections:', statusSections) // statusSectionsの内容を確認

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

						if (!self.DATA.inputs[channel]) {
							self.DATA.inputs[channel] = {} // 初期化
						}
						if (type === 1) {
							Object.assign(self.DATA.inputs[channel], {
								signalStatus,
								signalType,
								colorDepth,
								videoInputWidth,
								videoInputHeight,
								videoType,
								videoSync,
								hdcpAuthentication,
								audioSignalFormat,
								audioSamplingFrequency,
							})

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
							if (!self.DATA.outputs[channel]) {
								self.DATA.outputs[channel] = {} // 初期化
							}

							Object.assign(self.DATA.outputs[channel], {
								signalStatus,
								signalType,
								colorDepth,
								videoInputWidth,
								videoInputHeight,
								videoType,
								videoSync,
								hdcpAuthentication,
								audioSignalFormat,
								audioSamplingFrequency,
							})

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

				case '@GCHE':
					try {
						let channelType = parseInt(sections[1])
						console.log('Parsed channelType:', channelType) // channelTypeの内容を確認

						// ChannelType = 1 (入力)
						if (channelType === 1) {
							let inchannelnos = sections
								.slice(6)
								.map((ch) => parseInt(ch, 10))
								.filter((num) => !isNaN(num))

							// Ensure that the inputs structure exists
							if (!self.DATA.inputs) {
								self.DATA.inputs = {} // 初期化
							}
							self.DATA.inputs.channelNo = [] // ここでクリア
							// チャンネルNoを置き換え
							self.DATA.inputs.channelNo = inchannelnos.filter(
								(channel) => channel !== 0 && channel !== -1
							)
							variableObj[`input_channelNo`] = self.DATA.inputs.channelNo.join(',')
						} else if (channelType === 2) {
							// ChannelType = 2 (出力)
							let outchannelnos = sections
								.slice(6)
								.map((ch) => parseInt(ch, 10))
								.filter((num) => !isNaN(num))

							// Ensure that the outputs structure exists
							if (!self.DATA.outputs) {
								self.DATA.outputs = {} // 初期化
							}
							self.DATA.outputs.channelNo = [] // ここでクリア
							// チャンネルNoを置き換え
							self.DATA.outputs.channelNo = outchannelnos.filter(
								(channel) => channel !== 0 && channel !== -1
							)
							variableObj[`output_channelNo`] = self.DATA.outputs.channelNo.join(',')
						}
					} catch (error) {
						self.log('error', `Failed to parse @GCHE response: ${response}${error}`)
						self.log('error', error.toString())
					}
					self.initVariables()
					self.configUpdated()
					break
			}

			self.setVariableValues(variableObj)
			console.log('Current variableObj:', JSON.stringify(variableObj, null, 2)) // variableObjを表示
			//self.checkFeedbacks();
		})
	},
	async sendCommand(command) {
		let self = this

		if (self.socket && self.socket.isConnected) {
			self.socket.send(command + '\r\n')
			self.lastCommand = command
		}
	},
}
