import { Component, Input, Output, EventEmitter, ViewChild, ViewChildren, 
  ElementRef, QueryList, OnDestroy, AfterViewInit, OnChanges, ChangeDetectorRef } from '@angular/core'
import { trigger, style, animate, transition } from '@angular/animations'
import { Slide } from '../../app/types'
import { SafeUrl } from '@angular/platform-browser'
import { UtilProvider } from '../../providers/util/util'
import { DataProvider } from '../../providers/data/data'
import { Subscription } from 'rxjs/Subscription'
import { Subject } from 'rxjs/Subject'
import * as Swiper from 'swiper'

//declare var Swiper

@Component({
  selector: 'recipe-slides',
  templateUrl: 'recipe-slides.html',
  animations: [
    trigger('flyInLeft', [
      //state('in', style({transform: 'translateX(0)'})),
      transition(':enter', [
        style({transform: 'translateX(-120%)'}),
        animate(150)
      ]),
      transition(':leave', [
        animate(150, style({transform: 'translateX(-120%)'}))
      ])
    ]),
    trigger('flyInRight', [
      //state('in', style({transform: 'translateX(0)'})),
      transition(':enter', [
        style({transform: 'translateX(120%)'}),
        animate(150)
      ]),
      transition(':leave', [
        animate(150, style({transform: 'translateX(120%)'}))
      ])
    ])
  ]
})
export class RecipeSlidesComponent implements OnDestroy, OnChanges, AfterViewInit {
  @Input() slides: Slide[]
  @Output() slideChanged = new EventEmitter()
  @Output() onTransitionStart = new EventEmitter()
  @Output() onTransitionEnd = new EventEmitter()
  @Output() swiperInit = new EventEmitter()
  @Output() slideTap = new EventEmitter()
  // imageURLs: Map<string, SafeStyle>
  // fileURLs: Map<string, string>
  // imageIds: string[] = []
  resizeSub: Subscription
  videoSrc: Map<number, SafeUrl> = new Map()
  videoPlayers: Map<number, HTMLVideoElement> = new Map()
  mainSwiper: any
  thumbSwiper: any
  mainSliderOptions = {
    initialSlide: 0,
    pager: true, // not possible to override pager type with Ionic's integration
    //loop: false,
    //longSwipes: false,
    watchSlidesVisibility: true,
    slidesPerView: 'auto',
    direction: 'horizontal',
    pagination: '.swiper-pagination',
    centeredSlides: true,
    grabCursor: true,
    slideToClickedSlide: true, // other sldes only visible in landscape mode
    spaceBetween: 0,
    effect: 'coverflow',
    coverflow: {
      rotate: 20,
      stretch: 0,
      depth: 100,
      modifier: 2,
      slideShadows: true
    }
  }
  thumbSliderOptions = {
    initialSlide: 0,
    loop: false,
    longSwipes: false,
    direction: 'horizontal',
    slidesPerView: 'auto',
    centeredSlides: true, // tying two sliders together is bugged without this
    spaceBetween: 5,
    touchRatio: 0.3,
    slideToClickedSlide: true
  }
  
  @ViewChild('mainSwipe') mainSwipe: ElementRef
  @ViewChild('thumbSwipe') thumbSwipe
  @ViewChildren('videoplayer') videos: QueryList<ElementRef>

  initialized: boolean = false

  // better init schema
  bootstrapSubject: Subject<any> = new Subject()
  animstate: string = 'in'
  canSlide: {next: boolean, prev: boolean} = {next: true, prev: true} 
  /* 
    C O N S T R U C T O R
  */
  constructor(public dataService: DataProvider, 
      public util: UtilProvider, public ref: ChangeDetectorRef) {
    this.resizeSub = this.util.observeOrientation().subscribe((orient) => {
      if (this.initialized) {
        this.mainSwiper.slidesPerView = orient.portrait ? 1 : 'auto'
        this.mainSwiper.update()
        console.log(this.mainSwiper.slidesPerView)
      }
    })
  }

  ngOnChanges(changes) {
    if (!this.initialized && 'slides' in changes && this.slides) {
      this._initialize()
    }
  }
  
  ngOnDestroy() {
    this.resizeSub.unsubscribe()
    this.mainSwiper.destroy()
    this.thumbSwiper.destroy()
  }

  ngAfterViewInit() {
    this.videos.forEach((video) => {
      let vid = video.nativeElement
      vid.loop = true
      this.videoPlayers.set(parseInt(vid.id), vid)
    }) 
  }
  getSlideSize(): {width: number, height: number} {
    let slideelement = this.mainSwiper.slides[this.mainSwiper.activeIndex]
    return {width: slideelement.clientWidth, height: slideelement.clientHeight}
  }
  _initialize() {
    for (let i = 0; i <  this.slides.length; i++) {
      let slide = this.slides[i]
      if (slide.type === 'video') {
       this.videoSrc.set(i, this.dataService.sanitizeFileURL(URL.createObjectURL(slide.video)))
      }
    }
    this.mainSwiper = new Swiper(this.mainSwipe.nativeElement, this.mainSliderOptions)
    this.thumbSwiper = new Swiper(this.thumbSwipe.nativeElement, this.thumbSliderOptions)
    this.mainSwiper.params.control = this.thumbSwiper
    this.thumbSwiper.params.control = this.mainSwiper
    this.mainSwiper.params.controlBy = 'container'
    this.mainSwiper.disableTouchControl()
    this.thumbSwiper.disableTouchControl()
    this.thumbSwiper.on('onTap', (swiper, event) => {
      console.log('swiper tapped', event)
      this._handleSlideTap(swiper, event)
    })
    this.mainSwiper.on('onTap', (swiper, event) => {
      //this.mainSwiper.update(true)
      this._handleSlideTap(swiper, event)
    })
    this.mainSwiper.on('onTransitionStart', (swiper) => {
      this._stopVideo(swiper.previousIndex)
      this.onTransitionStart.emit(swiper.activeIndex)
      this.ref.detectChanges()
    })
    this.mainSwiper.on('onTransitionEnd', (swiper) => {
      this._playVideo(swiper.activeIndex)
      this.onTransitionEnd.emit(swiper.activeIndex)
    })
    setTimeout(() => {
      this.initialized = true
      this.mainSwiper.loopedSlides = this.slides.length
      this.mainSwiper.update(true)
      this.thumbSwiper.update(true)
      //this.mainSwiper.slideTo(1,0,false)
      this.mainSwiper.slideTo(0,0,false)
      this.swiperInit.emit(true)
      this.bootstrapSubject.complete()
    }, 0)
  }

  ready(): Promise<any> {
    return new Promise((resolve) => {
      this.bootstrapSubject.subscribe(null, null, () => {
        console.log('recipe-slides: Swiper ready')
        resolve()
      })
    })
  }

  _handleSlideTap(swiper, event: TouchEvent): void {
    console.log('swiper tap', swiper)
    if (swiper.clickedIndex !== undefined) {
      if (swiper.clickedIndex !== this.mainSwiper.activeIndex) {
        this.slideTap.emit(swiper.clickedIndex)
      }
    }
  }

  _playVideo(vidIndex: number) {
    if (this.slides[vidIndex].type !== 'video') {
      return
    }
    this.videoPlayers.get(vidIndex).play()
  }
  _stopVideo(vidIndex: number) {
    if (this.slides[vidIndex].type !== 'video') {
      return
    }
    this.videoPlayers.get(vidIndex).pause()
  }

  /** Forces change to slide arg regardless of lock state
  */
  selectSlide(slide: number, callbacks: boolean = false, transition: number = 300): void {
    this.mainSwiper.unlockSwipeToNext()
    this.mainSwiper.unlockSwipeToPrev()
    this.mainSwiper.slideTo(slide, transition, callbacks)
    if (!this.canSlide.next) {
      this.mainSwiper.lockSwipeToNext()
    }
    if (!this.canSlide.prev) {
      this.mainSwiper.lockSwipeToPrev()
    }
  }

  unlockPrevious(): void {
    this.canSlide.prev = true
    this.mainSwiper.unlockSwipeToPrev()
    this.thumbSwiper.unlockSwipeToPrev()
  }

  lockPrevious(): void {
    this.canSlide.prev = false
    this.mainSwiper.lockSwipeToPrev()
    this.thumbSwiper.lockSwipeToPrev()
  }

  unlockNext(): void {
    this.canSlide.next = true
    this.mainSwiper.unlockSwipeToNext()
    this.thumbSwiper.unlockSwipeToNext()
  }
  lockNext(): void {
    this.canSlide.next = false
    this.mainSwiper.lockSwipeToNext()
    this.thumbSwiper.lockSwipeToNext()
  }

  getCurrent(): number {
    return this.mainSwiper.activeIndex
  }

  isEnd(): boolean {
    return this.mainSwiper.isEnd
  }

  canSlidePrev(): boolean {
    return this.initialized && this.canSlide.prev && !this.mainSwiper.isBeginning
  }

  canSlideNext(): boolean {
    return this.initialized && this.canSlide.next && !this.mainSwiper.isEnd
  }


}
