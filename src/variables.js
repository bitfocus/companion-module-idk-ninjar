module.exports = {
  initVariables() {
    const self = this
    const variables = []

    const inputChannelsRaw  = Array.isArray(self.DATA?.inputs?.channelNo)  ? self.DATA.inputs.channelNo  : []
    const outputChannelsRaw = Array.isArray(self.DATA?.outputs?.channelNo) ? self.DATA.outputs.channelNo : []

    const sanitize = (arr) =>
      Array.from(new Set((arr || []).filter((n) => Number.isFinite(n) && n > 0))).sort((a,b)=>a-b)

    const inputChannels  = sanitize(inputChannelsRaw)
    const outputChannels = sanitize(outputChannelsRaw)


    self.log('info', `initVariables: in=${JSON.stringify(inputChannels)} out=${JSON.stringify(outputChannels)}`)

   // variables.push({ variableId: 'input_channelNo',  name: 'Input Channels (comma-separated)' })
   // variables.push({ variableId: 'output_channelNo', name: 'Output Channels (comma-separated)' })

    inputChannels.forEach((channel) => {
      variables.push({ variableId: `input_${channel}_signalstatus`,           name: `Input Channel ${channel} - Signal Status` })
      variables.push({ variableId: `input_${channel}_signaltype`,             name: `Input Channel ${channel} - Signal Type` })
      variables.push({ variableId: `input_${channel}_colordepth`,             name: `Input Channel ${channel} - Color Depth` })
      variables.push({ variableId: `input_${channel}_videoinputwidth`,        name: `Input Channel ${channel} - Video Input Width` })
      variables.push({ variableId: `input_${channel}_videoinputheight`,       name: `Input Channel ${channel} - Video Input Height` })
      variables.push({ variableId: `input_${channel}_videotype`,              name: `Input Channel ${channel} - Video Type` })
      variables.push({ variableId: `input_${channel}_videosync`,              name: `Input Channel ${channel} - Video Sync` })
      variables.push({ variableId: `input_${channel}_hdcpauthentication`,     name: `Input Channel ${channel} - HDCP Authentication` })
      variables.push({ variableId: `input_${channel}_audiosignalformat`,      name: `Input Channel ${channel} - Audio Signal Format` })
      variables.push({ variableId: `input_${channel}_audiosamplingfrequency`, name: `Input Channel ${channel} - Audio Sampling Frequency` })
    })

    outputChannels.forEach((channel) => {
        variables.push({ variableId: `output_${channel}_signalstatus`,          name: `Output Channel ${channel} - Signal Status` })
      variables.push({ variableId: `output_${channel}_signaltype`,            name: `Output Channel ${channel} - Signal Type` })
      variables.push({ variableId: `output_${channel}_colordepth`,            name: `Output Channel ${channel} - Color Depth` })
      variables.push({ variableId: `output_${channel}_videoinputwidth`,       name: `Output Channel ${channel} - Video Input Width` })
      variables.push({ variableId: `output_${channel}_videoinputheight`,      name: `Output Channel ${channel} - Video Input Height` })
      variables.push({ variableId: `output_${channel}_videotype`,             name: `Output Channel ${channel} - Video Type` })
      variables.push({ variableId: `output_${channel}_videosync`,             name: `Output Channel ${channel} - Video Sync` })
      variables.push({ variableId: `output_${channel}_hdcpauthentication`,    name: `Output Channel ${channel} - HDCP Authentication` })
      variables.push({ variableId: `output_${channel}_audiosignalformat`,     name: `Output Channel ${channel} - Audio Signal Format` })
      variables.push({ variableId: `output_${channel}_audiosamplingfrequency`,name: `Output Channel ${channel} - Audio Sampling Frequency` })
       variables.push({ variableId: `output_audio_${channel}_current_input`,   name: `Output Channel ${channel} - Current Audio Input` })
       variables.push({ variableId: `output_video_${channel}_current_input`,   name: `Output Channel ${channel} - Current Video Input` })
    })

    // ★ ここで件数をログ
    self.log('info', `initVariables: define ${variables.length} vars`)

    self.setVariableDefinitions(variables)

   
    const preview = variables.slice(0, Math.min(5, variables.length))
    self.log('debug', `initVariables preview: ${JSON.stringify(preview)}`)
  },
}
