import { Input, EventEmitter, Output, Component, OnInit } from '@angular/core'
import { PopoverController } from 'ionic-angular'
import { LangPopover } from './lang-popover'

export interface Language {
  id?: string,
  name: string,
  iso: string
}

@Component({
  selector: 'lang-edit',
  templateUrl: 'lang-edit.html'
})
export class LangEditComponent implements OnInit {
  @Input() color: string = 'favorite'
  @Input() languages: Language[] = []
  @Input() required: boolean = true
  @Input() readonly: boolean = false
  @Input() nohead: boolean = false
  @Output() langsUpdated = new EventEmitter()
  constructor(
      public popoverCtrl: PopoverController
  ) { }
  ngOnInit() {
    //console.log('lang edit got', this.languages)
    console.log('lang edit req', this.required)
  }
  editLanguages() {
    if (this.readonly) {
      return
    }
    let popover = this.popoverCtrl.create(LangPopover, {languages: this.languages.slice(0), required: this.required}, {cssClass: 'language'})
    popover.onDidDismiss((data) => {
      if (data) {
        console.log('got', data.languages)
        this.languages = data.languages.slice(0)
        this.langsUpdated.emit({languages: this.languages})
      }
    })
    popover.present()
  }
}
