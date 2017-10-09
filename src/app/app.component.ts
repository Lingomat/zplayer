import { Component } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'

import { HomePage } from '../pages/home/home'
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage

  constructor(public translate: TranslateService) {
    this.translate.use('en')
  }

}

