import { Component, ChangeDetectorRef  } from '@angular/core'
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular'
import { TranslateService } from '@ngx-translate/core'
import { SmallRecipeHit, UserInfo, Recipe } from '../../providers/firebase/firebase'
import Moment from 'moment'
import { DomSanitizer, SafeStyle } from '@angular/platform-browser'

@IonicPage()
@Component({
  selector: 'page-details',
  templateUrl: 'details.html'
})
export class DetailsPage {
  recipeHit: SmallRecipeHit
  recipeHits: SmallRecipeHit[] = []
  userInfo: UserInfo
  recipeId: string
  recipe: Recipe
  backgroundImage: SafeStyle
  haveHit: boolean = false
  constructor(public navCtrl: NavController, 
      params: NavParams, public sanitizer: DomSanitizer,
      public translate: TranslateService,
      public viewCtrl: ViewController, public ref: ChangeDetectorRef
    ) {
    this.recipeHits = params.get('recipeHit')
    console.log('details got', this.recipeHits)
    if (this.recipeHits && this.recipeHits.length === 1) {
      this.setHit(0)
    }
  }

  setHit(rIndex: number) {
    this.recipeHit = this.recipeHits[rIndex]
    this.haveHit = true
    this.userInfo = this.recipeHit.userInfo
    this.recipe = this.recipeHit.recipe
    this.recipeId = this.recipe._id
    this.backgroundImage = this.sanitizer.bypassSecurityTrustStyle('url('+this.recipeHit.imageURL+')')
    //this.ref.detectChanges()
  }

  getBgImage(url: string): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle('url('+url+')')
  }

  clickHit(rIndex: number) {
    this.setHit(rIndex)
    this.ref.detectChanges()
  }

  displayCreated(ms: number): string {
    Moment.locale(this.translate.currentLang)
    return Moment(ms).format("DD MMM YYYY")
  }

  pressedDownPlay() {
    console.log('play')
    this.viewCtrl.dismiss({play: true})
    //this.navCtrl.push('RecipeViewPage', { recipeId: this.recipe._id, ownRecipe: false })
  }

}
