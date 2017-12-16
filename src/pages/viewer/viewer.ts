import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core'
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular'
import { DataProvider, RecipeComplete  } from '../../providers/data/data'
import { TranslationAction } from '../../components/translation-selector/translation-selector'
import { Recipe, RecipeAssets, Translation, PublicUserData } from '../../app/types'

@IonicPage({
  segment: 'r/:handleId'
})
@Component({
  selector: 'page-viewer',
  templateUrl: 'viewer.html'
})
export class ViewerPage implements OnInit, OnDestroy {
  handleId: string
  recipe: Recipe
  recipeAssets: RecipeAssets
  recipeData: any
  lang: string = 'en'
  title: string = 'Zahwa'
  showViewer: boolean = false
  selectedTranslation: string = null
  translations: Translation[] = []
  anim: any
  workingMessage: string = null
  users: {[key: string]: PublicUserData}
  constructor(public navCtrl: NavController,
      params: NavParams, public data: DataProvider,
      public popoverCtrl: PopoverController, public ref: ChangeDetectorRef) {
    this.handleId = params.get('handleId')
  }

  ngOnInit() {
    this.init()
  }

  ngOnDestroy(): void {

  }

  async init() {
    this.workingMessage = "VIEWER.LOADING"
    let rb: RecipeComplete = await this.data.getCompleteRecipe(this.handleId)
    this.users = rb.users
    this.workingMessage = null
    this.recipeAssets = rb.recipeAssets
    this.recipe = this.recipeAssets.recipeData
    this.translations = rb.translations
    this.title = this.recipeAssets.recipeData.name
    this.showViewer = true
  }

  pressedLogIn(): void {
    console.log('clicked login')
    //this.authService.enterApp()
    this.navCtrl.pop()
  }
  pressedShare() {
    let popover = this.popoverCtrl.create('RecipeSharePage', {recipeData: this.recipeAssets.recipeData}, {cssClass: 'sharepopup'})
    popover.present()
  }

  translationSelected(transaction: TranslationAction) {
    if (!transaction) {
      return
    }
    if (transaction.action === 'select') {
      this.selectedTranslation = transaction.translation === "source" ? "source" : transaction.translation._id
    }
  }
}
