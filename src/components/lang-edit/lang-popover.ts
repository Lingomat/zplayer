import { Component } from '@angular/core'
import { ViewController, NavParams } from 'ionic-angular'

@Component({
  selector: 'page-lang-popover',
  templateUrl: 'lang-popover.html'
})
export class LangPopover {
  languages: any[]
  required: boolean = true
  constructor(public viewCtrl: ViewController, 
    params: NavParams
  ) {
   this.languages = params.get('languages') ? params.get('languages') : []
   this.required = params.get('required')
  }

  langsAccept(event: any)  {
    this.viewCtrl.dismiss({languages: event.languages})
  }

}
