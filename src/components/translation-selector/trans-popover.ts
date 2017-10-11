import { Component } from '@angular/core'
import { NavParams, ViewController } from 'ionic-angular'
import { Recipe, Translation } from '../../app/types'
import { SafeUrl } from '@angular/platform-browser'
import { PublicUserData } from '../../app/types'

@Component({
  selector: 'page-trans-popover',
  templateUrl: 'trans-popover.html'
})
export class TransPopover {
  recipeId: string
  authorId: string
  recipe: Recipe
  translations: Translation[]
  profileCache: Map<string, {name: string, image: SafeUrl}> = new Map()
  selectedTranslation: string
  enableAdd: boolean
  users: {[key: string]: PublicUserData}
  constructor(params: NavParams, public viewCtrl: ViewController) {
    this.recipe = params.get('recipe')
    this.translations = params.get('translations')
    this.users = params.get('users')
    this.authorId = this.recipe.author
    this.selectedTranslation = params.get('selectedTranslation')
    this.enableAdd = params.get('enableAdd')
  }

  getName(authorId: string): string {
    return this.users[authorId].userName
  }
  getImage(authorId: string): string {
    return this.users[authorId].photoURL
  }

  selectTranslation(translation: Translation): void {
    this.viewCtrl.dismiss({action: 'select', translation: translation})
  }
  addTranslation(): void {
    this.viewCtrl.dismiss({action: 'add'})
  }

  originalSelected(): boolean {
    return (!this.selectedTranslation || this.selectedTranslation === "source")
  }

}
