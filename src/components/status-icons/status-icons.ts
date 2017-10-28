import { Component, Input, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core'
import { PopoverController, NavController } from 'ionic-angular'
import { TranslateService } from '@ngx-translate/core'
import { Subscription } from 'rxjs/Subscription'
import Moment from 'moment'
import { Events } from 'ionic-angular'
import { FirebaseProvider } from '../../providers/firebase/firebase'

@Component({
  selector: 'status-icons',
  templateUrl: 'status-icons.html'
})
export class StatusIconsComponent implements OnInit, OnDestroy {
  @Input() recipeData: any = {}
  @Input() showShared: boolean = false
  @Input() showOwn: boolean = false
  @Input() badges: string[] = []
  @Input() transCount: number = 0
  values: any = {}
  subscriptions: Subscription[] = []
  destroyed: boolean = false
  disableIconInteraction: Map<string, boolean> = new Map()
  highlightedIcon: Map<string, boolean> = new Map()
  isOwn: boolean
  iconMap: any = {
    likes: {
      icon: 'heart',
      online: true
    },
    mediaSet: {
      icon: 'images',
      online: false
    },
    messages: {
      icon: 'mail',
      online: true
    },
    duration: {
      icon: 'time',
      online: false
    },
    translations: {
      icon: 'falanguage',
      online: false
    }
  }
  shareIcon: {name: string, color: string}
  constructor(
    public events: Events,
    public fb: FirebaseProvider,
    public popoverCtrl: PopoverController, 
    public ref: ChangeDetectorRef, 
    public navCtrl: NavController,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.isOwn = false
    for (let icon of this.badges) {
      this.values[icon] = '-'
      // disable any icon if recipe not shared and the icon type is marked as an 'online' type in iconMap
      if (this.iconMap[icon].online && !this.recipeData.shared) {
        this.values[icon] = '-'
        this.disableIconInteraction.set(icon, true) // not implemented yet
      } else if (icon === 'likes') {
        if (this.isOwn) {
          this.disableIconInteraction.set('likes', true) // can't like your own recipe!
        }
        let sub = this.fb.getLikes(this.recipeData._id).subscribe((data) => {
          if (data.success) {
            this.values['likes'] = data.count
            this.highlightedIcon.set('likes', data.liked)
            this._detectChanges()
          }
        })
        this.subscriptions.push(sub)
      } else if (icon === 'messages') {
        this.values[icon] = '0'
        this.disableIconInteraction.set('messages', true) // not implemented yet
      } else if (icon === 'mediaSet') {
        this.values[icon] = this.recipeData.mediaSet.length
      } else if (icon === 'duration') {
        Moment.locale(this.translate.currentLang)
        this.values[icon] = Moment.utc(this.recipeData.duration).format("m:ss")
      }
      else if (icon === 'translations') {
        this.values['translations'] = this.transCount
  
      } 
    }
  }

  _detectChanges() {
    if (!this.destroyed) {
      this.ref.detectChanges()
    }
  }
  ngOnDestroy() {
    this.destroyed =  true // stupid hack because init fires after destroy!
    for (let sub of this.subscriptions) {
      sub.unsubscribe()
    }
  }

  getIonIcon(iconname: string): string {
    return this.iconMap[iconname].icon
  }

  getBadgeValue(icon: string): string {
    return this.values[icon]
  }
}
