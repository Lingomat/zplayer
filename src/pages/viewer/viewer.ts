import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core'
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular'
import { AuthService } from '../../providers/auth-service'
import { RecipeService } from '../../providers/recipe-service'
import { DataService, Recipe, RecipeAssets } from '../../providers/data-service'
import { SyncService } from '../../providers/sync-service'
import { Subscription } from 'rxjs/Subscription'
import { TranslationAction } from '../../components/translation-selector/translation-selector'
import { Events } from 'ionic-angular'

@IonicPage({
  segment: 'r/:handleId'
})
@Component({
  selector: 'page-viewer',
  templateUrl: 'viewer.html'
})
export class ViewerPage implements OnInit, OnDestroy {
  handleId: string
  recipeId: string
  recipe: Recipe
  recipeAssets: RecipeAssets
  recipeData: any
  liked: boolean
  duplicateLiked: boolean
  lang: string = 'en'
  title: string = 'Zahwa'
  showViewer: boolean = false
  syncing: boolean = true
  syncSub: Subscription
  selectedTranslation: string = null
  constructor(public navCtrl: NavController,
      public events: Events,
      params: NavParams, public dataService: DataService,
      public recipeService: RecipeService, public sync: SyncService,
      public popoverCtrl: PopoverController, public ref: ChangeDetectorRef,
      public authService: AuthService) {
    this.handleId = params.get('handleId')
    this.init()
  }

  ngOnInit() {
    this.events.subscribe('overlay:sync', (onoff) => {
      this.syncing = onoff
      this.ref.detectChanges()
    })
  }

  ngOnDestroy(): void {
    if (this.syncSub) {
      this.syncSub.unsubscribe()
    }
  }

  init() {
    this.dataService.getDetailsFromHandle(this.handleId).then((details) => {
      console.log('recipeId', details.recipeId)
      if (!details || !details.recipeId) {
        throw new Error('PublicView has no recipeId argument!')
      }
      // Always call sync... Public view has not properly bootstrapped the app 
      // So we can't call sync.isSaved()...
      // This will overwrite recipe data from server, but it wont fetch large files
      // because sync: _syncDownFile() checks if the file exists first.
      this.sync.syncRecipe2(details.recipeId).then(() => {
        this.fetchRecipe(details.recipeId)
      })
      this.selectedTranslation = details.translationId ? details.translationId : null
    })
  }

  fetchRecipe(recipeId: string) {
    this.recipeService.fetchRecipe(recipeId).then((recipeAssets) => {
      this.recipeAssets = recipeAssets
      this.recipe = this.recipeAssets.recipeData
      this.title = this.recipeAssets.recipeData.name
      this.showViewer = true
    }) 
  }

  pressedLike(): void {
    this.liked = !this.liked
    if (this.liked && ! this.duplicateLiked) {
      this.duplicateLiked = true // don't let them toggle away
      //this.publicDataService.likeRecipeAnonymously(this.recipeId)
    }
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
