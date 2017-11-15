import { Component, ChangeDetectorRef } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'

/**
 * Generated class for the AboutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {
  hlt: string[] = ['Zahwa', '雜碗']
  psource: string[] = ['','','','']
  numslideshow: number = 12
  mtick: number = 4
  interval: any
  constructor(public navCtrl: NavController, public navParams: NavParams, public ref: ChangeDetectorRef) {
    for (let i = 0; i < 4; ++i) {
      this.psource[i] = this.makeImagePath(i)
    }
  }
  ngOnInit() {
    this.interval = setInterval(() => {
      this.tick()
    }, 2000)
  }
  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }
  tick() {
    let pos = this.mtick % 4
    this.psource[pos] = this.makeImagePath(this.mtick)
    this.ref.detectChanges()
    ++this.mtick
    if (this.mtick === this.numslideshow) {
      this.mtick = 0
    }
  }
  makeImagePath(num: number): string {
    return './assets/img/slideshow/' + num.toString() + '.webp'
  }
  refreshImages() {

  }

}
