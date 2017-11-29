import { Component } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { HomePage } from '../pages/home/home'
import { AboutPage } from '../pages/about/about'
import { AndroidPage } from '../pages/android/android'
import { BlogPage } from '../pages/blog/blog'
import { FaqPage } from '../pages/faq/faq'
import { ResearchPage } from '../pages/research/research'
import { HelpPage } from '../pages/help/help'
import { FeedbackPage } from '../pages/feedback/feedback'

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
      title: "HELP.TITLE",
      page: HelpPage
    },
    {
      title: "FAQ.TITLE",
      page: FaqPage
    },
    {
      title: "RESEARCH.TITLE",
      page: 'ResearchPage'
    },
    {
      title: "BUGREPORT",
      page: 'gplus'
    },
    {
      title: "BLOG.TITLE",
      page: 'blog'
    }
  ]

  constructor(public translate: TranslateService) {
    this.translate.addLangs(['en', 'zh-TW'])
    let lang = window.navigator.language.slice(0,2)
    if (lang === 'zh') {
      this.translate.use('zh-TW')
    } else {
      this.translate.use('en')
    }
  }

  openPage(page: any) {
    if (typeof page === 'string') {
      let lang = this.translate.currentLang.slice(0,2)
      if (page === 'gplus') {
        if (lang === 'zh') {
          window.open('https://plus.google.com/communities/115628487219035842652/stream/d7383e33-ee00-4f90-8597-cf945d794bb7')
        } else {
          window.open('https://plus.google.com/communities/115628487219035842652/stream/27625609-5e1e-4059-8703-e6c13e46f32d')
        }
      } else if (page === 'blog') {
        if (lang === 'zh') {
          window.open('https://translate.google.com/translate?sl=en&tl=zh-TW&js=y&prev=_t&hl=en&ie=UTF-8&u=https%3A%2F%2Fformatosa.weebly.com%2F&edit-text=&act=url')
        } else {
          this.rootPage = BlogPage
        }
      }
      //window.location.href = page
    } else {
      this.rootPage = page
    }
  }
}

