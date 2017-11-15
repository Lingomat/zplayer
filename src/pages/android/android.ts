import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { TranslateService } from '@ngx-translate/core'

/**
 * Generated class for the AndroidPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-android',
  templateUrl: 'android.html',
})
export class AndroidPage {
  hlt: string[] = ['Zahwa', '雜碗']
  lang: string = ''
  betapicturepath: string = null
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public trans: TranslateService) {
      this.lang = this.trans.currentLang.slice(0,2)
      this.betapicturepath = './assets/img/betaupdates-' + this.lang + '.webp'
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AndroidPage')
  }

}
