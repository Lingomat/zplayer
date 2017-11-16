import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core'

@IonicPage()
@Component({
  selector: 'page-help',
  templateUrl: 'help.html',
})
export class HelpPage {
  lang: string
  hc: {root: string, icon?: string, image?: string, count: number}[] = [
    {
      root: "OVERVIEW",
      image: "./assets/img/small-logo.png",
      count: 17
    },
    {
      root: "SHARE",
      icon: "share",
      count: 4
    },
    {
      root: "DISCOVER",
      icon: "search",
      count: 4
    },
    {
      root: "TRANSLATE",
      icon: "falanguage",
      count: 7
    },
    {
      root: "FORK",
      icon: "faclone",
      count: 9
    },
  ]
  constructor(public navCtrl: NavController, public navParams: NavParams, public translate: TranslateService) {
    this.lang = this.translate.currentLang.slice(0,2)
  }

  ionViewDidLoad() {
    
  }

  getRange(num: number) {
    return Array(num).fill(0).map((x,i)=>i)
  }

  getImages(item: {root: string, icon?: string, image?: string, count: number}): {source: string, text: string}[] {
    let i = []
    for (let x = 0; x < item.count; ++x) {
      i.push({
        source: 'url(./assets/help/' + item.root.toLowerCase() + '/' + this.lang + '/' + x.toString() + '.webp)', 
        text: 'HELP.' + item.root + '.' + x.toString()
      })
    }
    return i
  }

  getTransString(item: {root: string, count: number}, type: string): string {
    return 'HELP.' + item.root + '.' + type
  }
}
