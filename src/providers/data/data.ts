import { Injectable } from '@angular/core'
import 'rxjs/add/operator/map'
import { RecipeAssets, Recipe, Slide, MediaFrame, PublicUserData, Translation } from '../../app/types'
import { DomSanitizer, SafeUrl, SafeStyle } from '@angular/platform-browser'
import { Http, Response, Headers, RequestOptions } from '@angular/http'
import { GlobalsProvider } from '../globals/globals'
import { Observable } from 'rxjs/Observable'

export interface RecipeComplete {
  recipeAssets: RecipeAssets
  translations: Translation[]
  users: {[key: string]: PublicUserData}
}

export interface RecipeBundle {
  recipe: Recipe
  translations: Translation[]
  urlMap: {[key: string]: string}
  userMap: {[key: string]: PublicUserData}
}

@Injectable()
export class DataProvider {
  urlFetchTimeout: number = 100
  isoLangCache: {i: string, n: string}[] = null
  constructor(public http: Http, public sanitizer: DomSanitizer, public globals: GlobalsProvider) {
  }

  async getCompleteRecipe(recipeHandle: string): Promise<RecipeComplete> {
    let bundle: RecipeBundle = await this.functionPromise('view', {recipe: recipeHandle})
    let ra: RecipeAssets = await this.makeRecipeAssets(bundle)
    let t: Translation[] = await this.makeTranslations(bundle)
    return {
      recipeAssets: ra,
      translations: t,
      users: bundle.userMap
    }
  }

  makeTranslations(bundle: RecipeBundle): Promise<Translation[]> {
    const addFileToTranslation = async (trans: Translation): Promise<Translation> => {
      let turl = bundle.urlMap[trans.audioFileId]
      let afblob: Blob = await this._rawFetchFile(turl, this.urlFetchTimeout)
      trans.audio = afblob // we've cheekily added this to Translation type over and above Zahwa's data type definition...
      return trans
    }
    let tProms: Promise<Translation>[] = []
    for (let t of bundle.translations) {
      tProms.push(addFileToTranslation(t))
    }
    return Promise.all(tProms) // Typescript doesn't seem to whine about this any more!
  }

  makeRecipeAssets(bundle: RecipeBundle): Promise<RecipeAssets> {
    const makeSlide = async (mf: MediaFrame): Promise<Slide> => {
      let imageid: string = mf.image
      let iurl = bundle.urlMap[imageid]
      console.log('fetching url', iurl)
      let iblob: Blob = await this._rawFetchFile(iurl, this.urlFetchTimeout)
      let s: Slide = {
        imageId: imageid,
        type: mf.type,
        image: iblob,
        bg: this.sanitizeBackgroundImageURL(URL.createObjectURL(iblob))
      }
      if (mf.video) {
        s.videoId = mf.video
        let lvurl = bundle.urlMap[mf.video]
        s.video = await this._rawFetchFile(lvurl, 60)
      }
      return s
    }
    return new Promise((resolve, reject) => {
      let recipe: Recipe = bundle.recipe
      // get all of the slide images async
      let sProms: Promise<Slide>[] = []
      for (let mf of recipe.mediaSet) {
        sProms.push(makeSlide(mf))
      }
      Promise.all([
        this._rawFetchFile(bundle.urlMap['audio']),
        Promise.all(sProms) // this will resolve with an array of slides in the same order
      ])
      .then(([ablob, slides]) => {
        resolve({
          recipeData: recipe,
          audio: ablob,
          slides: slides
        })
      })
    })
  }

  getRecipeBundleFromFirebase(handleId: string): Promise<any> {
    return this.functionPromise('view', {
      recipe: handleId
    })
  }

  functionPromise(endpoint: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postJson(endpoint, data)
      .subscribe(
        resp => {
          resolve(resp)
        },
        error =>  reject(error)
      )
    })
  }

  postJson(endpoint: string, data: any): Observable<any> {
    let url = 'https://' + 
      this.globals.getEnv().fbConfig.functionsDomain + 
      '/' +
      endpoint
    console.log('func: sending request to', url)
    let headers = new Headers({
      //'Authorization': 'Bearer ' + userToken,
      'Content-Type': 'application/json'
    })
    let options = new RequestOptions({ headers: headers })
    return this.http.post(url, data, options)
    .map((res: Response) => {
      let body = res.json()
      console.log('func: got raw response', body)
      return body || { }
    })
  }

  // taken from Zahwa sync service
  // Pass in a URL and promise resolves to a Blob, or it rejects with an error
  _rawFetchFile(url: string, timeout: number = 10): Promise<Blob> {
    return new Promise((resolve, reject) =>  {
      let xhr = new XMLHttpRequest()
      xhr.onload = () => {
        // If this didn't fetch, just ignore it
        //this.debug('_rawFetchFile() xhr.onload() fired with status', xhr.status)
        if (xhr.status === 200 && xhr.status < 300) {
          resolve(xhr.response)
        } else {
          reject(xhr.status)
        }
      }
      // xhr.onprogress = (oEvent) => {
      //   if (oEvent.lengthComputable) {
      //     var percentComplete = oEvent.loaded / oEvent.total
      //     console.log('_rawFetchFile() progress', percentComplete)
      //   }
      // }
      xhr.onerror = (error) => {
        reject(xhr.status)
      }
      xhr.open("GET", url, true)
      xhr.timeout = timeout * 1000
      xhr.ontimeout = () => {
        reject('xhr: timeout')
      }
      xhr.responseType = "blob"
      xhr.send()
    })
  }

  sanitizeFileURL (url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url)
  }

  sanitizeBackgroundImageURL (url: string): SafeStyle {
    let style = 'url('+url+')'
    return this.sanitizer.bypassSecurityTrustStyle(style)
  }

  // get iso languages from json file, cache results
  getISOLanguages(): Promise<{i: string, n: string}[]> {
    return new Promise((resolve) => {
      if (!this.isoLangCache) {
        this.http.get('assets/iso693.json').map((rsp) => rsp.json())
        .subscribe((foo) => {
          this.isoLangCache = foo
          resolve(this.isoLangCache)
        })
      } else {
        resolve(this.isoLangCache)
      }
    })
  }

}
