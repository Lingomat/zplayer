import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the FaqPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-faq',
  templateUrl: 'faq.html',
})
export class FaqPage {
  faq: {q: string, a: string}[] = []
  numFaqEntries: number = 6
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.faq = Array.from(new Array(this.numFaqEntries), (x,i) => {
      return {q: 'FAQ.Q' + i.toString(), a:  'FAQ.A' + i.toString()}
    })
  }

  ionViewDidLoad() {
    
  }

  getFaq() {
    return this.faq
  }

}
