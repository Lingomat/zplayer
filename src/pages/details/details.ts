import { Component  } from '@angular/core'
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
  userInfo: UserInfo
  recipeId: string
  recipe: Recipe
  backgroundImage: SafeStyle
  constructor(public navCtrl: NavController, 
      params: NavParams, public sanitizer: DomSanitizer,
      public translate: TranslateService,
      public viewCtrl: ViewController
    ) {
    this.recipeHit = params.get('recipeHit')
    this.userInfo = this.recipeHit.userInfo
    this.recipe = this.recipeHit.recipe
    this.recipeId = this.recipe._id
    this.backgroundImage = this.sanitizer.bypassSecurityTrustStyle('url('+this.recipeHit.imageURL+')')
  }

  ngOnInit () {
    console.log('recipe details page', this.recipeHit)
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
