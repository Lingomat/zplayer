import { Component } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { HomePage } from '../pages/home/home'
import { AboutPage } from '../pages/about/about'
import { AndroidPage } from '../pages/android/android'

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = HomePage
  menuItems = [
    {
      title: "HOME.TITLE",
      page: HomePage
    },
    {
      title: "ABOUT.TITLE",
      page: AboutPage
    },
    {
      title: "ANDROID.TITLE",
      page: AndroidPage
    }
  ]

  constructor(public translate: TranslateService) {
    this.translate.use('en')
  }

  openPage(page: any) {
    this.rootPage = page
  }

}

