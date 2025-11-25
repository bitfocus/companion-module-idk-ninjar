const { InstanceStatus, TCPHelper } = require('@companion-module/base')

module.exports = {
	DATA: {
		outputs: {},
		inputs: {},
	},
	highCommandQueue: [],
	lowCommandQueue: [],
	_isSending: false,
	_currentCommand: null,
	_currentCmdTimer: null,
	RX_BUFFER: '',
	async initConnection() {
		let self = this

		//clear any existing intervals
		clearInterval(self.INTERVAL)
		clearInterval(self.RECONNECT_INTERVAL)

		if (self.config.host && self.config.host !== '') {
			self.updateStatus(InstanceStatus.Connecting)

			self.socket = new TCPHelper(self.config.host, self.config.port)

			self.socket.on('error', (error) => {
				self.log('error', JSON.stringify(error, null, 2));
				self.updateStatus(InstanceStatus.UnknownError)
			})

			self.socket.on('connect', () => {
				self.updateStatus(InstanceStatus.Ok)
				self.sendCommand('@GCHE,1,0,1,1', { priority: 'low' })
				self.sendCommand('@GCHE,2,0,1,1', { priority: 'low' })
				self.getData() //get initial data
				//start polling, if enabled
				if (self.config.polling) {
					self.INTERVAL = setInterval(() => {
						self.sendCommand('@GIV,0,0,1', { priority: 'low' })


						self.getData()
					}, self.config.pollInterval)
				}
			})

			// self.socket.on('data', (data) => {
			// 	self.processData(data)
			// })
			// 追加: 受信バッファ
			self.RX_BUFFER = '',

				// initConnection の .on('data') を差し替え
				self.socket.on('data', (data) => {
					try {
						self.RX_BUFFER += data.toString('utf8')

						// 完結した行だけ取り出す（CRLF）
						let idx
						while ((idx = self.RX_BUFFER.indexOf('\r\n')) !== -1) {
							const line = self.RX_BUFFER.slice(0, idx)
							self.RX_BUFFER = self.RX_BUFFER.slice(idx + 2) // \r\n を捨てる
							if (line.trim() !== '') {
								self._onCommandResponse(line)
								self.log('info', `RECV ← ${line}`)
								self.processData(line)
							}
						}

						// ここに来た時点で RX_BUFFER には未完の行だけが残る
					} catch (e) {
						self.log('error', `rx parse error: ${e}`)
					}
				})


			self.socket.on('close', () => {
				self.updateStatus(InstanceStatus.ConnectionFailure)
				clearInterval(self.INTERVAL)
				clearInterval(self.RECONNECT_INTERVAL)
			})
		}
	},
	getData() {
		let self = this;

		// 入力チャンネル処理
		let inputChannels = self.DATA?.inputs?.channelNo || []; // デフォルトで空配列
		if (Array.isArray(inputChannels) && inputChannels.length > 0) {
			console.log("Input Channels: ", inputChannels);

			inputChannels.forEach((channel) => {
				if (channel === 0 || channel === -1) {
					return; // 処理をスキップ
				}
				self.sendCommand(`@GSV,0,0,1,${channel}`, { priority: 'low' });  // ビデオ入力
				self.sendCommand(`@GSA,0,0,1,${channel}`, { priority: 'low' });  // オーディオ入力
				self.sendCommand(`@GCHS,1,${channel},0`, { priority: 'low' });   // 入力状態
				self.sendCommand(`@GCHS,2,${channel},0`, { priority: 'low' });   // 出力状態
			});
		} else {
			self.DATA.inputs = self.DATA.inputs || {};
			self.DATA.inputs.channelNo = [];
		}

		let outputChannels = self.DATA?.outputs?.channelNo || [];
		if (Array.isArray(outputChannels) && outputChannels.length > 0) {
			console.log("Output Channels: ", outputChannels);

			outputChannels.forEach((channel) => {
				if (channel === 0 || channel === -1) {
					return;
				}
				self.sendCommand(`@GSV,0,0,1,${channel}`, { priority: 'low' });  // ビデオ入力
				self.sendCommand(`@GSA,0,0,1,${channel}`, { priority: 'low' });  // オーディオ入力
				self.sendCommand(`@GCHS,1,${channel},0`, { priority: 'low' });   // 入力状態
				self.sendCommand(`@GCHS,2,${channel},0`, { priority: 'low' });   // 出力状態
			});
		} else {
			self.DATA.outputs = self.DATA.outputs || {};
			self.DATA.outputs.channelNo = [];
		}
	}
	,

	async processData(data) {
		let self = this;
		let response = data.toString();
		let responses = response.split('\r\n').filter(line => line.trim() !== '');

		responses.forEach(res => {
			console.log("Processing response:", res);  // どのレスポンスが処理されているか確認
			let sections = res.split(',');
			if (sections[0].indexOf('@ERR') !== -1) {
				self.log('error', response);
				self.log('error', `Last Command: ${self.lastCommand}`);

				let errorCode = parseInt(sections[1]);
				if (errorCode === 1) {
					self.log('error', 'Erroneous parameter format or value');
				} else if (errorCode === 2) {
					self.log('error', 'Undefined command or wrong format');
				} else if (errorCode === 3) {
					self.log('error', 'Currently cannot be used');
				} else if (errorCode === 99) {
					self.log('error', 'Unknown error');
				}

				return;
			}

			let variableObj = {};

			switch (sections[0]) {
				case '@GSV':
					let videoChannel = parseInt(sections[4]);
					let input = parseInt(sections[5]);
					if (!self.DATA.outputs[videoChannel]) {
						self.DATA.outputs[videoChannel] = {};
					}
					self.DATA.outputs[videoChannel].currentVideoInput = input;
					variableObj[`output_video_${videoChannel}_current_input`] = input;
					break;

				case '@GSA':
					let audioChannel = parseInt(sections[4]);
					let audioInput = parseInt(sections[5]);
					if (!self.DATA.outputs[audioChannel]) {
						self.DATA.outputs[audioChannel] = {};
					}
					self.DATA.outputs[audioChannel].currentAudioInput = audioInput;
					variableObj[`output_audio_${audioChannel}_current_input`] = audioInput;
					break;

				case '@GCHS':
					let type = parseInt(sections[1])
					let channel = parseInt(sections[2])
					let status = parseInt(sections[3])

					try {
						let statusSections = sections[4].split('/');
						let signalStatus = parseInt(statusSections[0]);
						let signalType = statusSections[1];
						let colorDepth = parseInt(statusSections[2]);
						let videoInputWidth = parseInt(statusSections[3]);
						let videoInputHeight = parseInt(statusSections[4]);
						let videoType = statusSections[5];
						let videoSync = parseInt(statusSections[6]);
						let hdcpAuthentication = statusSections[7];
						let audioSignalFormat = statusSections[8];
						let audioSamplingFrequency = statusSections[9] || '';

						if (!self.DATA.inputs[channel]) {
							self.DATA.inputs[channel] = {}; // 初期化
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
								audioSamplingFrequency
							});

							variableObj[`input_${channel}_signalstatus`] = signalStatus;
							variableObj[`input_${channel}_signaltype`] = signalType;
							variableObj[`input_${channel}_colordepth`] = colorDepth;
							variableObj[`input_${channel}_videoinputwidth`] = videoInputWidth;
							variableObj[`input_${channel}_videoinputheight`] = videoInputHeight;
							variableObj[`input_${channel}_videotype`] = videoType;
							variableObj[`input_${channel}_videosync`] = videoSync;
							variableObj[`input_${channel}_hdcpauthentication`] = hdcpAuthentication;
							variableObj[`input_${channel}_audiosignalformat`] = audioSignalFormat;
							variableObj[`input_${channel}_audiosamplingfrequency`] = audioSamplingFrequency;
						} else if (type === 2) {
							if (!self.DATA.outputs[channel]) {
								self.DATA.outputs[channel] = {}; // 初期化
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
								audioSamplingFrequency
							});

							variableObj[`output_${channel}_signalstatus`] = signalStatus;
							variableObj[`output_${channel}_signaltype`] = signalType;
							variableObj[`output_${channel}_colordepth`] = colorDepth;
							variableObj[`output_${channel}_videoinputwidth`] = videoInputWidth;
							variableObj[`output_${channel}_videoinputheight`] = videoInputHeight;
							variableObj[`output_${channel}_videotype`] = videoType;
							variableObj[`output_${channel}_videosync`] = videoSync;
							variableObj[`output_${channel}_hdcpauthentication`] = hdcpAuthentication;
							variableObj[`output_${channel}_audiosignalformat`] = audioSignalFormat;
							variableObj[`output_${channel}_audiosamplingfrequency`] = audioSamplingFrequency;
						}
					} catch (error) {
						console.log('error parsing status', error);
					}

					break;

				case '@GCHE':
					try {
						const channelType = parseInt(sections[1], 10)
						const declaredCount = parseInt(sections[5], 10)


						const raw = sections.slice(6).join(',')                 // 例: "1/2/3/4"
						const list = raw
							.split(/[^\d]+/)                                      // 非数字で区切る
							.filter(Boolean)
							.map((s) => parseInt(s, 10))
							.filter((n) => Number.isFinite(n) && n > 0)           // 0/-1/NaN 除外

						// ログが見えない場合は debug → info にする
						console.log('info', `@GCHE raw="${raw}" parsed=${JSON.stringify(list)}`)

						if (!Number.isNaN(declaredCount) && declaredCount !== list.length) {
							self.log('info', `@GCHE count mismatch: declared=${declaredCount}, parsed=${list.length}`)
						}

						if (channelType === 1) {
							self.DATA.inputs ||= {}
							const prev = Array.isArray(self.DATA.inputs.channelNo) ? self.DATA.inputs.channelNo : []
							const next = list
							if (prev.length !== next.length || prev.some((v, i) => v !== next[i])) {
								self.DATA.inputs.channelNo = next
								variableObj['input_channelNo'] = next.join(',')
							}
						} else if (channelType === 2) {
							self.DATA.outputs ||= {}
							const prev = Array.isArray(self.DATA.outputs.channelNo) ? self.DATA.outputs.channelNo : []
							const next = list
							if (prev.length !== next.length || prev.some((v, i) => v !== next[i])) {
								self.DATA.outputs.channelNo = next
								variableObj['output_channelNo'] = next.join(',')
								// debouncedInitVariables(self, 150) // ← 必要なら有効化
							}
						}
						// ★ ここから追記：variables 再定義（デバウンスで1回だけ）
						clearTimeout(self._initVarsTimer)
						self._initVarsTimer = setTimeout(() => {
							try {
								self.initVariables()
								self.log('info', 'initVariables: redefined after GCHE')
							} catch (e) {
								self.log('error', 'initVariables error: ' + e)
							}
						}, 150)

						// （任意）アクションのプルダウンも更新したい場合
						if (typeof self.refreshActionChoices === 'function') {
							self.refreshActionChoices()
						}
					} catch (error) {
						self.log('error', `Failed to parse @GCHE response: ${error}`)
					}
					break
				case '@GIV':
					// ここは“情報ダンプ”で複数行が来る機器が多い。必要ならパース、
					// 使わないなら無視でもOK（ログだけ残す）
					self.log('debug', `@GIV recv: "${res}"`)
					break

				default:
					self.log('debug', `unhandled line: "${res}"`)
					break

			}
			self.setVariableValues(variableObj);
			//console.log("Current variableObj:", JSON.stringify(variableObj, null, 2));  // variableObjを表示
			//self.checkFeedbacks();
		});
	}
	,

	async sendCommand(command,options = {}) {
		const self = this

		if (!command) return
		const priority = options.priority || 'high'
		if (self.socket && self.socket.isConnected) {
			if (priority === 'low') {
				self.lowCommandQueue.push(command)
			} else {
				self.highCommandQueue.push(command)
			}
			self._drainCommandQueue()
		} else {
			self.log('warn', `Cannot send (socket not connected): ${command}`)
		}
	},
	_drainCommandQueue() {
		const self = this

		// すでに送信中なら何もしない
		if (self._isSending) return
		if (!self.socket || !self.socket.isConnected) return

		let next = null
		if (self.highCommandQueue.length > 0) {
			next = self.highCommandQueue.shift()
		} else if (self.lowCommandQueue.length > 0) {
			next = self.lowCommandQueue.shift()
		}
		if (!next) return

		self._isSending = true
		self._currentCommand = next
		self.lastCommand = next

		self.log('info', `SEND → ${next}`)
		self.socket.send(next + '\r\n')


		if (self._currentCmdTimer) {
			clearTimeout(self._currentCmdTimer)
		}
		self._currentCmdTimer = setTimeout(() => {
			self.log('warn', `Timeout waiting response for: ${self._currentCommand}`)
			self._finishCurrentCommand()
		}, 1000) // 1000ms
	},
	_onCommandResponse(line) {
		const self = this

		// 何も待ってない状態ならスルー
		if (!self._isSending || !self._currentCommand) {
			return
		}

		self._finishCurrentCommand()
	},
	_finishCurrentCommand() {
		const self = this

		self._isSending = false
		self._currentCommand = null

		if (self._currentCmdTimer) {
			clearTimeout(self._currentCmdTimer)
			self._currentCmdTimer = null
		}

		// 次のコマンドを捌く
		self._drainCommandQueue()
	}



}

