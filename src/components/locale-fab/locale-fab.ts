import { Component, ViewChild, OnInit } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'locale-fab',
  templateUrl: 'locale-fab.html'
})
export class LocaleFabComponent implements OnInit {
  @ViewChild('fab') fab: any
  langmap: any = {
    'en': {
      fab: 'En'
    },
    'zh-TW': {
      fab: '中文'
    }
  }
  languageList: string[]
  currentLanguage: string
  constructor(
      public translate: TranslateService
  ) {}
  ngOnInit() {
    console.log('local fab init')
    this.languageList = this.translate.getLangs()
    this.currentLanguage = this.translate.currentLang
  }
  async selectLanguage (language: string) {
    //this.translate.use(language) // this just doesn't work so do it in auth service instead
    if (language !== this.translate.currentLang) {
      this.translate.use(language)
      this.currentLanguage = language
    }
    this.fab.close()
  }
}
