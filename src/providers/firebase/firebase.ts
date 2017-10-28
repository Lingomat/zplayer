import { Injectable } from '@angular/core'
import firebase from 'firebase'
import { GlobalsProvider } from '../globals/globals'
import GeoFire from 'geofire'
//import { DomSanitizer, SafeStyle, SafeUrl } from '@angular/platform-browser'
import { Observable } from 'rxjs/Observable'

export interface MediaFrame {
  type: string
  image: string
  video?: string
}

export interface Gesture {
  timeOffset: number
  type?: string
  timeLine: {x: number, y: number, t: number}[]
}

export interface Language {
  iso?: string
  name: string
}

export interface Geoloc {
  latitude: number
  longitude: number
}

export interface TimeLine extends Array<{t: number}>{}

export interface RespeakTimeLine 
extends Array<{source: {start: number, end: number}, secondary: {start: number, end: number}}>{}

export interface Translation {
  _id?: string
  languages: Language[]
  author: string
  audioFileId: string
  description: string
  handle: string
  created: number
  timeLine: RespeakTimeLine
}

export interface Recipe {
  _id: string
  created: number
  author: string
  authorUsername: string
  audio: string
  gestures: Gesture[]
  displayImage: number
  description: string
  duration: number
  location: Geoloc
  mediaSet: MediaFrame[]
  name: string
  stage: number
  tags: string[]
  languages: Language[]
  timeLine: TimeLine
  valid: boolean
  shared: boolean
  deleted: boolean
  handle: string
}

export interface UserInfo {
  userName: string
  photoURL: string
  joined: number
}

export interface SmallRecipeHit {
  recipe: Recipe
  imageURL: string
  userInfo: UserInfo
  translations: Translation[]
}

@Injectable()
export class FirebaseProvider {
  fbConfig: any
  userCache: Map<string, UserInfo> = new Map()
  constructor(public globals: GlobalsProvider) {
    this.fbConfig = globals.getEnv().fbConfig
    try {
      firebase.initializeApp(this.fbConfig)
    } catch (e) {
      console.error('firebase: Firebase initialization error', e)
    }
  }

  // Even a basic firebase one-shot ought to be in the data service
  getFirebaseEntry(dbPath: string): Promise<any> {
    const fbRef = firebase.database().ref(dbPath)
    return new Promise((resolve, reject) => {
      fbRef.once('value').then((snapshot) => {
        resolve(snapshot.val())
      }).catch((err) => {
        console.error('data: getFirebaseEntry() failed for', dbPath, err)
        reject(err)
      })
    })
  }

  getGeoType(type: string) {
    let fbRef = firebase.database().ref('geo/' + type)
    return new GeoFire(fbRef)
  }

  async fetchRecipeHit(recipeId: string): Promise<SmallRecipeHit> {
    let data = await this.getFirebaseEntry(recipeId)
    if (data) {
      let userInfo = await this.getUserFromCache(data.author)
      let dIndex: number = ('displayImage' in data) ? data['displayImage'] : 0
      let diPath: string  = data.mediaSet[dIndex].image
      let imageData = await this.getFirebaseEntry(diPath)
      let tData = await this.getFirebaseEntry('/translate/' + recipeId)
      let trans: Translation[] = []
      if (tData) {
        for (let t in tData) {
          trans.push(tData[t])
        }
      }
      return {
        recipe: data,
        imageURL: imageData.downloadURL,
        userInfo: userInfo,
        translations: trans
      }
    }
  }

  async getUserFromCache(userId: string): Promise<UserInfo> {
    const getUserInfo = async (userId: string): Promise<UserInfo> => {
      if (userId) {
        let value = await this.getFirebaseEntry('/users/' + userId)
        let profile = {
          userName: value.userName,
          joined: value.joined,
          photoURL: value.photoURL ? value.photoURL : './assets/img/usr-icon-placeholder.png'
        }
        if (value.photoId) {
          let fileval = await this.getFirebaseEntry(value.photoId)
          if (fileval !== null && fileval.downloadURL) {
            profile.photoURL = fileval.downloadURL
          }
        }
        return profile
      }
    }
    if (this.userCache.has(userId)) {
      return this.userCache.get(userId)
    } else {
      let bp = await getUserInfo(userId)
      this.userCache.set(userId, bp)
      return bp
    }
  }

  // Returns an observable which emits an object containing success, liked (this user liked) and total likes
  getLikes(recipeId: string): Observable<{success: boolean, liked: boolean, count: number}> {
    return Observable.create((observer) => {
      const socialRef = firebase.database().ref('social/' + recipeId)
      function fbChanged(snapshot) {
        let val = snapshot.val()
        let likeCount = (val !== null && 'likeCount' in val) ? val.likeCount : 0
        let likeSelf = false
        observer.next({
          success: true,
          liked: likeSelf,
          count: likeCount
        })
      }
      socialRef.on('value', fbChanged)
      return function() {
        socialRef.off('value', fbChanged)
      }
    })
  }
}
