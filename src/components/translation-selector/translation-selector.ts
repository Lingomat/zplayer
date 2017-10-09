import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { PopoverController, ActionSheetOptions } from 'ionic-angular'
import { RecipeService } from '../../providers/recipe-service'
import { DataService, Language, Recipe, Translation } from '../../providers/data-service'
import { TranslateService } from '@ngx-translate/core'
//import { TranslationSelectorPopoverPage } from '../../pages/translation-selector-popover/translation-selector-popover'

// export interface Translation {
//   _id?: string
//   languages: Language[]
//   author: string
//   audioFileId: string
//   description: string
// }

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
  @Input('selectedTranslation') selectedTranslation: string = ''
  @Output() selected: EventEmitter<TranslationAction> = new EventEmitter<TranslationAction>()
  selectOptions: ActionSheetOptions
  translations: Translation[] = []
  showSelect: boolean = false
  translation: Translation
  // user profile pics
  userCache: Map<string, any> = new Map()
  langString: string = ''
  constructor(
    public recipeService: RecipeService, public popoverCtrl: PopoverController,
    public translate: TranslateService, public dataService: DataService,
  ) {

  }

  ngOnInit() {
    if (!this.selectedTranslation) {
      this.setLang(this.recipe.languages[0])
    }
    Promise.all([
      this.recipeService.getTranslations(this.recipe._id).then((translations) => {
        console.log('translations', translations)
        this.translations = translations
      }),
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
    let popover = this.popoverCtrl.create('TranslationSelectorPopoverPage', 
      {
        enableAdd: this.enableAdd,
        recipe: this.recipe,
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
