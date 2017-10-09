import { Injectable } from '@angular/core'
import { AudioProvider } from '../audio/audio'
import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable'

// Typecript doesn't know about window.fetch 
// https://github.com/Microsoft/TypeScript/issues/8966
declare var fetch

@Injectable()
export class WebAudioPlayerProvider {
  audioContext: AudioContext
  updateRateMs: number = 100
  onProgressEvent: Function = null
  onEndEvent: Function = null
  playing: boolean = false
  ended: boolean = false
  currentTime: number = 0
  framesPlayed: number = 0
  sampleRate: number
  frames: number
  channels: number
  buffer: AudioBuffer
  duration: number
  scriptBufferLength: number
  updateInterval: number
  source: AudioBufferSourceNode
  scriptNode: ScriptProcessorNode
  // update to use observable for onProgressEvent
  progressSubject: Subject<any> = new Subject()
  constructor(public audioService: AudioProvider) {
    this.audioContext = this.audioService.getContext()
  }

  load(sourceURL: string): Promise<any>  {
    return fetch(sourceURL, {mode: 'cors'}).then((response) => {
      return response.arrayBuffer().then((buffer) => {
        return this._decodeAndInitialize(buffer)
      })
    })
  }
  // because the new record with review may as well just pass the array buffer instead of the wav
  loadFromBlob(source: Blob): Promise<any> {
    return new Promise((resolve) => {
      let fileReader = new FileReader()
      let arrayBuffer
      fileReader.onloadend = () => {
        arrayBuffer = fileReader.result
        this._decodeAndInitialize(fileReader.result)
        .then(() => {
          resolve()
        })
      }
      fileReader.readAsArrayBuffer(source)
    })
  }
  async _decodeAndInitialize(buffer: ArrayBuffer): Promise<any> {
    this.pause() // in case we're reloading
    if (this.scriptNode) {
      this.scriptNode.onaudioprocess = null
    }
    this.source = null
    this.scriptNode = null
    let decodedData = await this.audioContext.decodeAudioData(buffer)
    this.currentTime = 0
    this.framesPlayed = 0
    this.buffer = decodedData
    this.sampleRate = decodedData.sampleRate
    this.frames = decodedData.length
    this.channels = decodedData.numberOfChannels
    this.duration = decodedData.duration
    let buffLen = this.sampleRate * (this.updateRateMs / 1000)
    this.scriptBufferLength = this._pow2floor(buffLen)
    this.updateInterval = this.scriptBufferLength / this.sampleRate
  }

  _pow2floor(v){
    v++
    var p = 1
    while (v >>= 1) {p <<= 1}
    return p
  }
  play (startPos = null) {
    if (startPos === null) {
        startPos = this.currentTime
    } else {
        this.currentTime = startPos
    }
    this.framesPlayed = this.sampleRate * this.currentTime // inaccurate but...
    this.source = this.audioContext.createBufferSource()
    this.source.buffer = this.buffer
    this.source.connect(this.audioContext.destination)
    this.scriptNode = this.audioContext.createScriptProcessor(this.scriptBufferLength, 1, 1)
    this.scriptNode.onaudioprocess = (audioEvent) => {
      if (this.playing) {
        this.framesPlayed += this.scriptBufferLength // ... this avoids rounding errors
        this.currentTime = this.framesPlayed / this.sampleRate
        this.progressSubject.next(this.currentTime)
      }
    }
    this.source.connect(this.scriptNode)
    this.scriptNode.connect(this.audioContext.destination)
    this.source.onended = () => {
      if (this.playing) {
        this.source.disconnect(this.scriptNode)
        this.scriptNode.disconnect(this.audioContext.destination)
        this.playing = false
      }
      console.log('ended')
      this.ended = true
      this.progressSubject.next(-1)
    }
    this.source.start(this.audioContext.currentTime, this.currentTime)
    this.playing = true
  }
  playMs(startPos = null) {
    let time = startPos ? (startPos/1000) : null
    this.play(time)
  }

  pause (): void {
    if (this.playing) {
      this.playing = false
      this.source.disconnect(this.scriptNode)
      this.scriptNode.disconnect(this.audioContext.destination)
      this.source.onended = null // will stop onended event firing as above
      this.source.stop()
    }
  }
  isPlaying () {
    return this.playing
  }
  hasEnded () {
    return this.ended
  }
  pos () {
    return this.currentTime
  }
  setPos (position) {
    this.currentTime = position
  }
  // observer emits -1 for media ended
  observeProgress(): Observable<number> {
    return this.progressSubject.asObservable()
  }

  playBuffer(audioBuf: Float32Array, sampleRate: number): void {
    var newSource = this.audioContext.createBufferSource()
    var newBuffer = this.audioContext.createBuffer(1, audioBuf.length, sampleRate)
    newBuffer.getChannelData(0).set(audioBuf)
    newSource.buffer = newBuffer
    newSource.connect(this.audioContext.destination)
    newSource.start()
  }

  destroy() {
    this.pause()
  }

}
