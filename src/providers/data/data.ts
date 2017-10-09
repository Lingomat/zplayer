import { Injectable } from '@angular/core'
import { Http } from '@angular/http'
import 'rxjs/add/operator/map'
import { RecipeAssets, Translation } from '../../app/types'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'

export interface RecipeBundle {
  recipeAssets: RecipeAssets
  translations: Translation[]
}

@Injectable()
export class DataProvider {
  constructor(public http: Http, public sanitizer: DomSanitizer) {
  }

  async getRecipeAssets(recipeHandle: string): Promise<RecipeBundle> {
    let a: RecipeAssets
    let b: Translation[]
    return {recipeAssets: a, translations: b}
  }

  sanitizeFileURL (url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url)
  }

}
