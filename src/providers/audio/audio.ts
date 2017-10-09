import { Injectable } from '@angular/core'

declare var webkitSpeechRecognition

@Injectable()
export class AudioProvider {
  config = {
    sampleRate: 16000
  }
  beep: HTMLAudioElement
  errorbeep: HTMLAudioElement
  audioContext: AudioContext = new AudioContext()
  constructor() {
    this.init()
  }

  init() {
    this.audioContext = new AudioContext()
    this.beep = new Audio('assets/media/beep.wav')
    this.errorbeep = new Audio('assets/media/error.wav')
    this.enableMobileAudio()
  }

  getContext(): AudioContext {
    return this.audioContext
  }

  framesToMs (frames: number): number {
    return Math.floor(frames / this.config.sampleRate * 1000)
  }

  secFloatToMs (seconds: number): number {
    return Math.floor(seconds * 1000)
  }

  floatTodB (float: number): number {
    return 20 * Math.log(Math.max(float, Math.pow(10, -72 / 20))) / Math.LN10
  }

  // takes db from floats, representing -72dB to 0dB but in reality... -50 is where the noise floor is or there abouts
  // so apply a 20dB noise floor
  dbToPercent (db: number): number {
    var noisefloor = 20
    var percent = Math.floor(100 + ((100 / (72 - noisefloor)) * db))
    return (percent < 0) ? 0 : percent
  }

  playBeep (callback?: Function): void {
    let cb: () => {
      callback()
    }
    this.beep.addEventListener("ended", cb)
    this.beep.play()
  }
  errorBeep () {
    this.errorbeep.play()
  }
  resampleAudioBuffer (audioBuffer: AudioBuffer, targetSampleRate: number, oncomplete: Function): void {
    var newBuffer = this.audioContext.createBuffer(1, audioBuffer[0].length, this.audioContext.sampleRate)
    newBuffer.getChannelData(0).set(audioBuffer[0])
    var numFrames_ = audioBuffer[0].length * targetSampleRate / this.audioContext.sampleRate
    var offlineContext_ = new OfflineAudioContext(1, numFrames_, targetSampleRate)
    var bufferSource_ = offlineContext_.createBufferSource()
    bufferSource_.buffer = newBuffer
    bufferSource_.connect(offlineContext_.destination)
    offlineContext_.startRendering().then((renderedBuffer) => {
      oncomplete(renderedBuffer)
    })
    bufferSource_.start(0)
  }
  
  //
  // Wave writing stuff
  //
  arrayToWav (audioData, channels = 1 , sampleRate = this.config.sampleRate): Blob {
    var blob = new Blob([this.encodeWAV(audioData, channels, sampleRate)], {
      type: 'audio/wav'
    })
    return blob
  }
  encodeWAV (samples, numChannels, sampleRate) {
    var buffer = new ArrayBuffer(44 + samples.length * 2)
    console.log(samples.length)
    var view = new DataView(buffer)
    /* RIFF identifier */
    this._writeString(view, 0, 'RIFF')
    /* RIFF chunk length */
    view.setUint32(4, 36 + samples.length * 2, true)
    /* RIFF type */
    this._writeString(view, 8, 'WAVE')
    /* format chunk identifier */
    this._writeString(view, 12, 'fmt ')
    /* format chunk length */
    view.setUint32(16, 16, true)
    /* sample format (raw) */
    view.setUint16(20, 1, true)
    /* channel count */
    view.setUint16(22, numChannels, true)
    /* sample rate */
    view.setUint32(24, sampleRate, true)
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 4, true)
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, numChannels * 2, true)
    /* bits per sample */
    view.setUint16(34, 16, true)
    /* data chunk identifier */
    this._writeString(view, 36, 'data')
    /* data chunk length */
    view.setUint32(40, samples.length * 2, true)
    this._floatTo16BitPCM(view, 44, samples)
    return view
  }
  _floatTo16Bit (samples) {
    var buffer = new ArrayBuffer(samples.length * 2)
    var view = new DataView(buffer)
    this._floatTo16BitPCM(view, 0, samples)
    return new Int16Array(buffer)
  }

  _floatTo16BitPCM (output, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]))
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
    }
  }
  _writeString (view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  _navigator: Navigator
  _mobileEnabled: boolean
  _scratchBuffer: AudioBuffer
  enableMobileAudio () {
    this._navigator = (typeof window !== 'undefined' && window.navigator) ? window.navigator : null
    // Only run this on mobile devices if audio isn't already eanbled.
    var isMobile = /iPhone|iPad|iPod|Android|BlackBerry|BB10|Silk|Mobi/i.test(this._navigator && this._navigator.userAgent)
    var isTouch = !!(('ontouchend' in window) || (this._navigator && this._navigator.maxTouchPoints > 0) || (this._navigator && this._navigator.msMaxTouchPoints > 0))
    if (this._mobileEnabled || !this.audioContext || (!isMobile && !isTouch)) {
      return
    }

    this._mobileEnabled = false
    this._scratchBuffer = this.audioContext.createBuffer(1, 1, 22050)

    // Call this method on touch start to create and play a buffer,
    // then check if the audio actually played to determine if
    // audio has now been unlocked on iOS, Android, etc.
    var unlock = () => {
      // Create an empty buffer.
      var source = this.audioContext.createBufferSource()
      source.buffer = this._scratchBuffer
      source.connect(this.audioContext.destination)

      // Play the empty buffer.
      if (typeof source.start === 'undefined') {
        //source.noteOn(0)
      } else {
        source.start(0)
      }

      // Setup a timeout to check that we are unlocked on the next event loop.
      source.onended = () => {
        source.disconnect(0)
        console.log('audio alegedly enabled')

        // Update the unlocked state and prevent this check from happening again.
        this._mobileEnabled = true

        // Remove the touch start listener.
        document.removeEventListener('touchend', unlock, true)
      }
    }

    // Setup a touch start listener to attempt an unlock in.
    document.addEventListener('touchend', unlock, true)
  }

  // Speech Recognition part
  sr: any
  srRunning: boolean = false
  final_transcript: string = ''
  interim_transcript: string = ''
  initSpeechService(language): void {
    this.sr = new webkitSpeechRecognition()
    this.sr.lang = language
    this.sr.interimResults = false
    this.srRunning = false
    this.final_transcript = ''

    this.sr.onresult = (event) => {
      this.interim_transcript = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          this.final_transcript += event.results[i][0].transcript
        } else { // Maybe used later
          this.interim_transcript += event.results[i][0].transcript
        }
      }
    }
  }

  startSpeechService(): Promise<string> {
    this.srRunning = true
    this.playBeep()
    return new Promise<string>((resolve, reject) => {
      this.sr.onend = () => {
        if (this.final_transcript) {
          this.final_transcript = this.final_transcript[0].toUpperCase() + this.final_transcript.slice(1)
        }
        this.srRunning = false
        resolve(this.final_transcript)
      }
      this.sr.onerror = (event) => {
        this.srRunning = false
        reject(event.error)
      }
      this.final_transcript = ''
      this.sr.start()
    })
  }

  stopSpeechService(): void {
    this.sr.stop()
  }

}
