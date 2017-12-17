import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-faq',
  templateUrl: 'faq.html',
})
export class FaqPage {
  faq: {q: string, a: string}[] = []
  numFaqEntries: number = 7
  hlt: string[] = ['Zahwa', '雜碗']
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
