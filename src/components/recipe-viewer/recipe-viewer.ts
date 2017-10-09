import { Component, OnInit, OnChanges, OnDestroy, Input, ViewChild, ChangeDetectorRef } from '@angular/core'
import { WebAudioPlayer } from '../../providers/web-audio-player'
import { Util } from '../../providers/util'
import { AuthService } from '../../providers/auth-service'
import { RecipeService } from '../../providers/recipe-service'
import { Recipe, RecipeAssets, RespeakTimeLine, TimeLine, Slide } from '../../providers/data-service'
import { Subscription } from 'rxjs/Subscription'
import { GestateComponent } from '../../components/gestate/gestate'
import { RecipeSlidesComponent } from '../../components/recipe-slides/recipe-slides'

@Component({
  selector: 'recipe-viewer',
  templateUrl: 'recipe-viewer.html',
  providers: [WebAudioPlayer]
})
export class RecipeViewerComponent implements OnChanges, OnInit, OnDestroy {
  @Input() recipeId: string
  @Input() recipeAssets: RecipeAssets
  @Input() selectedTranslation: string = null
  @ViewChild('slides') slides: RecipeSlidesComponent
  @ViewChild(GestateComponent) gestate: GestateComponent
  mediasetAssets: Slide[]
  recipeData: Recipe
  finishedLoading: boolean = false

  // player logic
  isPlaying: boolean = false
  progressObs: Subscription
  // UI 
  elapsed: string = ''
  timeLine: number[]
  // incorporating gestate
  slidesize: {width: number, height: number}
  /* 
    C O N S T R U C T O R
  */
  constructor(public player: WebAudioPlayer,
      public util: Util, public recipeService: RecipeService,
      public authService: AuthService,
      public ref: ChangeDetectorRef) {
  }

  ngOnChanges(changes) {
    if ('selectedTranslation' in changes && this.selectedTranslation) {
      this._loadAudio()
    }
  }

  ngOnDestroy() {
    if (!this.progressObs) {
      this.progressObs.unsubscribe()
    }
    if (this.player) {
      this.player.destroy()
    }
  }

  async ngOnInit() {
    if (this.recipeAssets) {
      this.recipeData = this.recipeAssets.recipeData
      this.mediasetAssets = this.recipeAssets.slides
      if (this.recipeData.gestures) {
        this.gestate.loadGestures(this.recipeData.gestures)
      }
      console.log('got recipe data', this.recipeData)
    }
    await this.slides.ready()
    console.log('record: slides ready() resolved')
    this.slidesize = this.slides.getSlideSize()
    this._loadAudio()
    this.ref.detectChanges()
    
  }

  async _loadAudio() {
    this.finishedLoading = false
    if (!this.selectedTranslation || this.selectedTranslation === 'source') {
      console.log('view: Selecting source audio')
      this.timeLine = this.recipeData.timeLine.map(x => x.t/1000)
      let aurl = URL.createObjectURL(this.recipeAssets.audio)
      this._initAudio(aurl)
    } else {
      let transdata = await this.recipeService.getTranslation(this.selectedTranslation)
      console.log('view: Using translation audio', transdata)
      let eTimeline = this.recipeService.estimateRespeakTimeline(this.recipeData.timeLine, transdata.translation.timeLine)
      this.timeLine = eTimeline.map(x => x.t/1000)
      let aurl = URL.createObjectURL(transdata.audio)
      this._initAudio(aurl)
    }
    console.log('view: timeline', this.timeLine)
  }

  _initAudio(audioURL: string) {
    this.player.load(audioURL).then(() => {
      this.elapsed = this.util.getNiceTime(0)
      this.finishedLoading = true
    })
    if (!this.progressObs) {
      this.progressObs = this.player.observeProgress().subscribe((time) => {
        if (time === -1 ) {
          this.isPlaying = false
          this.gestate.stopPlay()
        } else {
          this.elapsed = this.util.getNiceTime(~~(time*1000)) // getNiceTime wants ms
          this._checkTime(time)
        }
        this.ref.detectChanges()
      })
    } 
    this.slides.selectSlide(0, false, 0)
  }

  slideChangeStart(slide: number) {
    let t = this.timeLine[this.slides.getCurrent()] //seconds
    if (this.isPlaying) {
      this.player.pause()
      this.player.play(t)
      this.gestate.playGestures(~~(t*1000))
    } else {
      this.elapsed = this.util.getNiceTime(~~(t*1000))
    }
  }

  // slideTap(slide: number) {
  //   this.slides.selectSlide(slide, false, 300)
  //   let t = this.timeLine[this.slides.getCurrent()] //seconds
  //   if (this.isPlaying) {
  //     this.player.pause()
  //     this.player.play(t)
  //     this.gestate.playGestures(~~(t*1000))
  //   } else {
  //     this.elapsed = this.util.getNiceTime(~~(t*1000))
  //   }
  // }

  _checkTime(time: number) {
    let cs = this.slides.getCurrent()
    if (cs === this.timeLine.length - 1) {
      return
    }
    if (time >= this.timeLine[cs + 1]) {
      this.slides.selectSlide(cs + 1, false)
    }
  }

  pressedPlay(): void {
    if (!this.isPlaying) {
      if (this.player.ended && this.slides.isEnd()) {
        this.slides.selectSlide(0, false)
        this.player.play(0)
        this.gestate.playGestures(0)
      } else {
        let time = this.timeLine[this.slides.getCurrent()] // seconds
        console.log('playing start from ', time)
        this.player.play(time)
        this.gestate.playGestures(~~(time*1000))
      }
    } else {
      this.player.pause()
      this.gestate.stopPlay()
    }
    this.isPlaying = !this.isPlaying
    this.ref.detectChanges()
  }

}
