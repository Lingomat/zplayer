import { Component } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { HomePage } from '../pages/home/home'
import { AboutPage } from '../pages/about/about'
import { AndroidPage } from '../pages/android/android'
import { BlogPage } from '../pages/blog/blog'
import { FaqPage } from '../pages/faq/faq'
import { ResearchPage } from '../pages/research/research'

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
    },
    {
      title: "FAQ.TITLE",
      page: FaqPage
    },
    {
      title: "RESEARCH.TITLE",
      page: ResearchPage
    },
    {
      title: "BLOG.TITLE",
      page: BlogPage
    }
  ]

  constructor(public translate: TranslateService) {
    this.translate.addLangs(['en', 'zh-TW'])
    this.translate.use('en')
  }

  openPage(page: any) {
    this.rootPage = page
  }
}

