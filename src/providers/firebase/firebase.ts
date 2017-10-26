import { Injectable } from '@angular/core'
import firebase from 'firebase'
import { GlobalsProvider } from '../globals/globals'
import GeoFire from 'geofire'

@Injectable()
export class FirebaseProvider {
  fbConfig: any
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

}
