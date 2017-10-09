import { Component, NgZone, ViewChild, Input, Output, EventEmitter, ElementRef, OnChanges, OnDestroy } from '@angular/core'
import { Util } from '../../providers/util'
import { Gesture } from '../../providers/data-service'
import Sketch from 'sketch-js'

type Milliseconds = number

@Component({
  selector: 'gestate',
  templateUrl: 'gestate.html'
})
export class GestateComponent implements OnChanges, OnDestroy {
  @ViewChild('overlay') canvasElement: ElementRef
  @ViewChild('overlaywrapper') wrapperElement: ElementRef
  @Input('slidesize') slidesize
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  gestures: Gesture[] = []
  currentGesture: Gesture = null
  currentGestureType: string = null
  currentGestureId: string = null
  isRecording: boolean = false
  trackTouchIdentifier: number
  ptooey: any
  isPlaying: boolean = false
  startTime: Date
  recTimeOffset: number
  lastTime: number
  lastPaaaaarp: {time: number, particles: number, x: number, y: number}
  movingPos: {x: number, y: number}
  constructor(public util: Util, public zone: NgZone) {

  }
  ngOnChanges(changes) {
    console.log('changes', changes)
    if ('slidesize' in changes && this.slidesize) {
      console.log('changing size', this.slidesize)
      this.resizeCanvas()
    }
  }

  ngOnDestroy() {
    if (this.ptooey) {
      this.ptooey.destroy()
    }
  }
  
  overlayWidth: string
  overlayHeight: string
  resizeCanvas() {
    this.overlayWidth = this.slidesize.width+'px'
    this.overlayHeight = this.slidesize.height+'px'
    let width = this.slidesize.width
    let height = this.slidesize.height
    // this.canvas.width = ~~(width * window.devicePixelRatio)
    // this.canvas.height = ~~(height * window.devicePixelRatio)
    // this.canvas.style.width = width+'px'
    // this.canvas.style.height = height+'px'
    // this.context.scale(window.devicePixelRatio, window.devicePixelRatio)
    this.ptooey = this.particles()
  }

  record(gtype: string, time: number): void {
    this.isPlaying = false
    this.isRecording = true
    this.currentGestureType = gtype
    this.startTime = new Date()
    this.recTimeOffset = time
    this.lastPaaaaarp = null
    this.zone.runOutsideAngular(() => {
      this.recordTick()
    })
  }

  stopRecord(): void {
    this.isRecording = false
    if (this.currentGesture) {
      this.finishCurrentGesture()
    }
    console.log('gestures', this.gestures)
  }

  clearAll(): void {
    this.gestures = []
  }

  getGestures(): Gesture[] {
    return this.gestures
  }

  loadGestures(gestures: Gesture[]): void {
    this.gestures = gestures
  }

  playGestures(time: Milliseconds) {
    if (this.isRecording) {
      this.stopRecord()
    }
    this.startTime = new Date()
    this.recTimeOffset = time
    this.lastElapsed = time
    this.isPlaying = true
    this.lastPaaaaarp = null
    this.zone.runOutsideAngular(() => {
      this.playTick()
    })
  }
  
  stopPlay(): void {
    this.isPlaying = false
  }

  lastElapsed: Milliseconds
  playTick() {
    let getCurrentGestureByTime = (nt: number): Gesture => {
      let fg = null
      for (let f = this.gestures.length -1 ; f >= 0 ; --f) {
        let st = this.gestures[f].timeOffset 
        let et = st + this.gestures[f].timeLine[this.gestures[f].timeLine.length-1].t
        if (nt >= st && nt <= et) {
          return this.gestures[f]
        }
      }
      return null
    }
    let elapsed = this.getParentElapsed()
    let pGest = getCurrentGestureByTime(elapsed)
    if (pGest) {
      let tt = elapsed - pGest.timeOffset
      let oldt = this.lastElapsed - pGest.timeOffset
      for (let frame of pGest.timeLine) {
        if (frame.t > oldt && frame.t <= tt) {
          this.paaaaarp(frame.x, frame.y)
        }
      }
      this.lastElapsed = elapsed
    } else {
      this.lastPaaaaarp = null
    }
    if (this.isPlaying) {
      window.requestAnimationFrame(this.playTick.bind(this))
    }
  }

  recordTick(): void {
    if (this.movingPos) {
      this.paaaaarp(this.movingPos.x, this.movingPos.y)
    }
    if (this.isRecording) {
      window.requestAnimationFrame(this.recordTick.bind(this))
    }
  }

  touchStart(evt: TouchEvent) {
    // Let's only track one touch
    if (this.isRecording) {
      let thisTouch: Touch = evt.changedTouches[0]
      this.trackTouchIdentifier = thisTouch.identifier
      let touchPos = this.getXYFromTouch(thisTouch)
      this.currentGesture = {
        type: this.currentGestureType,
        timeOffset: this.recTimeOffset + this.getElapsed(),
        timeLine: [{
          t: 0,
          x: touchPos.x,
          y: touchPos.y
        }]
      }
      this.movingPos = {x: touchPos.x, y: touchPos.y}
    }
  }

  touchMove(evt: TouchEvent) {
    this.zone.runOutsideAngular(() => {
      if (this.isRecording && this.currentGesture) {
        let moveTouch = Array.from(evt.changedTouches).find(x => x.identifier === this.trackTouchIdentifier)
        if (moveTouch) {
          let touchPos = this.getXYFromTouch(moveTouch)
          //this.paaaaarp(touchPos.x, touchPos.y)
          this.currentGesture.timeLine.push({
            t: this.recTimeOffset + this.getElapsed() - this.currentGesture.timeOffset,
            x: touchPos.x,
            y: touchPos.y
          })
          this.movingPos = {x: touchPos.x, y: touchPos.y}
        }
      }
    })
  }

  // pttoooooey paaaaaaarp ptweeeeee!!!!
  paaaaarp(x: number, y: number): void {
    function interpolate(x1, y1, x2, y2, steps) {
      let dx = ((x2 - x1) / steps), dy =((y2 - y1) / steps)
      let res = []
      for (let i = 1; i <= steps; ++i) {
        res.push({
          x: x1 + dx * i,
          y: y1 + dy * i
        })
      }
      return res
    }
    let fx = ~~(this.slidesize.width*x), fy = ~~(this.slidesize.height*y)
    let fc = this.util.getRandomIntInclusive(4,8)
    if (this.lastPaaaaarp) {
      let elT = new Date().valueOf() - this.lastPaaaaarp.time
      //let tpP = ~~(elT / this.lastPaaaaarp.particles)
      //console.log('el:',elT, tpP)
      if (elT > 50) {
        fc = 3
      }
      // have move so let's interpolate
      let steps = interpolate(this.lastPaaaaarp.x, this.lastPaaaaarp.y, x, y, fc)
      for (let s of steps) {
        let px = ~~(this.slidesize.width*s.x), py = ~~(this.slidesize.height*s.y)
        this.ptooey.spawn(px,py)
      }
    } else {
      // no last move
      for (let i = 0; i < fc ; ++i) {
        this.ptooey.spawn(fx, fy)
      }
    }
    this.lastPaaaaarp = {time: new Date().valueOf(), particles: fc, x: x, y: y}
  }

  touchEnd(evt: TouchEvent) {
    if (this.isRecording && this.currentGesture) {
      let fidx = Array.from(evt.changedTouches).findIndex(x => x.identifier === this.trackTouchIdentifier)
      if (fidx !== -1) {
        this.finishCurrentGesture()
      }
    }
  }

  finishCurrentGesture(): void {
    this.gestures.push(this.currentGesture)
    console.log('gestate: finishing gesture', this.currentGesture)
    this.currentGesture = null
    this.lastPaaaaarp = null
    this.movingPos = null
  }

  // startTouchListeners () {
  //   this.canvas.addEventListener('touchmove', this.touchMove, false)
  //   this.canvas.addEventListener('touchstart', this.touchStart, false)
  //   this.canvas.addEventListener('touchend', this.touchEnd, false)
  // }

  // stopTouchListeners () {
  //   this.canvas.removeEventListener('touchmove', this.touchMove, false)
  //   this.canvas.removeEventListener('touchstart', this.touchStart, false)
  //   this.canvas.removeEventListener('touchend', this.touchEnd, false)
  // }

  getXYFromTouch(touch: Touch): {x: number, y: number} {
    let target = touch.target as Element
    let rect = target.getBoundingClientRect()
    let rx = touch.clientX - rect.left
    let ry = touch.clientY - rect.top
    return {
      x: rx / rect.width,
      y: ry / rect.height
    }
  }

  particles() {
    let random = function( min, max ) {
      //return Math.floor(Math.random() * (max - min)) + min
      return Math.random() * (max - min) + min
    }
    let randomPick = function(array: any[]): any {
      return array[Math.floor(Math.random() * array.length)]
    }
    // ----------------------------------------
    // Particle
    // ----------------------------------------
    let Particle = class {
      alive: boolean
      radius: number
      wander: number
      theta: number
      color: string
      x: number
      y: number
      vx: number
      vy: number
      drag: number
      constructor( x, y, radius ) {
        this.alive = true
        this.radius = radius || 10
        this.wander = 0.15
        this.theta = Math.random() * Math.PI * 2
        this.drag = 0.92
        this.color = '#fff'
        this.x = x || 0.0
        this.y = y || 0.0
        //this.vx = 0.0
        //this.vy = 0.0
        this.wander = random( 0.5, 2.0 )
        this.color = randomPick( COLOURS )
        this.drag = random( 0.9, 0.99 )
        let force = random( 0.3, 1.5 )
        this.vx = Math.sin( this.theta ) * force
        this.vy = Math.cos( this.theta ) * force
      }
      move() {
        this.x += this.vx
        this.y += this.vy
        this.vx *= this.drag
        this.vy *= this.drag
        this.theta += random( -0.5, 0.5 ) * this.wander
        this.vx += Math.sin( this.theta ) * 0.1
        this.vy += Math.cos( this.theta ) * 0.1
        this.radius *= 0.90
        this.alive = this.radius > 0.5
      }
      draw( ctx ) {
        ctx.beginPath()
        ctx.arc( this.x, this.y, this.radius, 0, Math.PI * 2 )
        ctx.fillStyle = this.color
        ctx.fill()
      }
    }

    // ----------------------------------------
    // Example
    // ----------------------------------------
    let MAX_PARTICLES = 60
    //let COLOURS = [ '#69D2E7', '#A7DBD8', '#E0E4CC', '#F38630', '#FA6900', '#FF4E50', '#F9D423' ]
    let COLOURS = [ "#BF360C", "#329b34", "#ff5722", "#E9E2D7", "#3e272e", "#5d4037"]
    let particles = []
    let pool = []
    let demo = Sketch.create({
      globals: false,
      container: this.wrapperElement.nativeElement,
      eventTarget: this.wrapperElement.nativeElement,
      retina: false,
      fullscreen: false,
      autopause: false,
      width: this.slidesize.width,
      height: this.slidesize.height
    })
    demo.spawn = ( x, y ) => {
      let particle, theta, force
      if ( particles.length >= MAX_PARTICLES ) {
        particles.shift()
        //pool.push( particles.shift() )
      }
      //particle = pool.length ? pool.pop() : new Particle(x, y, random( 4, 30 ) )
      // if (pool.length) {
      //   particle = pool.pop()
      // } else {
      //   particle = new Particle(x, y, random( 4, 12 ) )
      // }
      particle = new Particle(x, y, random( 4, 12 ) )
      particles.push( particle )
    }

    demo.update = () => {
      let i, particle
      for ( i = particles.length - 1; i >= 0; i-- ) {
        particle = particles[i]
        if ( particle.alive ) {
          particle.move()
        } else {
          //pool.push( particles.splice( i, 1 )[0] )
          particles.splice(i,1)
        }
      }
    }

    demo.draw = function() {
      //demo.globalCompositeOperation  = 'soft-light'
      demo.globalCompositeOperation  = 'lighter'
      //demo.globalCompositeOperation = 'source-over'
      for ( let i = particles.length - 1; i >= 0; i-- ) {
        particles[i].draw( demo )
      }
    }
    return demo
  }

  getElapsed(): Milliseconds {
    let thisTime = new Date()
    return (thisTime.valueOf() - this.startTime.valueOf())
  }
  getParentElapsed(): Milliseconds {
    return this.getElapsed() + this.recTimeOffset 
  }

}

