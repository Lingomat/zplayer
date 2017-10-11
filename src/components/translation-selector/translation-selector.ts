import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { PopoverController, ActionSheetOptions } from 'ionic-angular'
import { Language, Recipe, Translation, PublicUserData } from '../../app/types'
import { TranslateService } from '@ngx-translate/core'
import { TransPopover } from './trans-popover'

export interface TranslationAction {
  action: "add" | "select",
  translation?: Translation | "source"
}

@Component({
  selector: 'translation-selector',
  templateUrl: 'translation-selector.html'
})
export class TranslationSelectorComponent implements OnInit {
  @Input('recipe') recipe: Recipe
  @Input('enableAdd') enableAdd: boolean = false
  @Input('users') users: {[key: string]: PublicUserData} = {}
  @Input('selectedTranslation') selectedTranslation: string = ''
  @Input('translations') translations: Translation[] = []
  @Output() selected: EventEmitter<TranslationAction> = new EventEmitter<TranslationAction>()
  selectOptions: ActionSheetOptions
  showSelect: boolean = false
  translation: Translation
  // user profile pics
  userCache: Map<string, any> = new Map()
  langString: string = ''
  constructor(
    public popoverCtrl: PopoverController,
    public translate: TranslateService
  ) {

  }

  ngOnInit() {
    if (!this.selectedTranslation) {
      this.setLang(this.recipe.languages[0])
    }
    Promise.all([
      new Promise((resolve) => {
        this.translate.get(['TRANSSEL.SHEETTITLE']).subscribe((transtrings) => {
          this.selectOptions = {
            title: transtrings['TRANSSEL.SHEETTITLE']
          }
          resolve()
        })
      })
    ])
    .then(() => {
      //this.cacheProfiles()
      this.showSelect = true
    })
  }

  clickButton(event): void {
    let popover = this.popoverCtrl.create(TransPopover, 
      {
        enableAdd: this.enableAdd,
        recipe: this.recipe,
        users: this.users,
        selectedTranslation: this.selectedTranslation,
        translations: this.translations
      }, 
      {cssClass: 'translationselect'})
    popover.onDidDismiss((data) => {
      if (data) {
        if (data.action === 'select') {
          if (data.translation === 'source') {
            this.setLang(this.recipe.languages[0])
          } else {
            this.setLang(data.translation.languages[0])
          }
        }
        this.selected.emit(data)
      }
    })
    popover.present({ev: event})
  }

  setLang(language: Language) {
    this.langString = language.iso ? language.iso : language.name.slice(0,3).toLowerCase()
  }

}
