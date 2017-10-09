import { Injectable } from '@angular/core'
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { TranslateService } from '@ngx-translate/core'
import { AlertController } from 'ionic-angular'
import Moment from 'moment'

declare var navigator, window

export interface Orientation {
  width: number,
  height: number,
  landscape: boolean,
  portrait: boolean
}

@Injectable()
export class UtilProvider {
  orientSubject: BehaviorSubject<Orientation>
  orientAlertSubject: BehaviorSubject<boolean> = new BehaviorSubject(false)
  backAction: Function = null
  currentOrientation: string = null
  preferredOrientation: string = null
  /* 
    C O N S T R U C T O R
  */
  constructor(public translate: TranslateService, public alertCtrl: AlertController) {
    Moment.locale(this.translate.currentLang)
    this.orientSubject = new BehaviorSubject({
      width: screen.width,
      height: screen.height,
      landscape: (screen.width > screen.height),
      portrait:  (screen.height > screen.width)
    })
    this.currentOrientation = (screen.width > screen.height) ? 'landscape' : 'portrait'
    window.addEventListener('resize', (event) => {
      let height = event.currentTarget['innerHeight']
      let width = event.currentTarget['innerWidth']
      let data = {
        width: width,
        height: height,
        landscape: (width > height),
        portrait: (height > width)
      }
      this.currentOrientation = data.landscape ? 'landscape' : 'portrait'
      console.log('orient change', this.currentOrientation)
      this.orientSubject.next(data)
      this.checkOrientationWarn()
    })
  }

  setPreferredOrientation(orientation: string) {
    this.preferredOrientation = orientation
    this.checkOrientationWarn()
  }

  checkOrientationWarn() {
    if (this.preferredOrientation && this.preferredOrientation !== this.currentOrientation) {
      this.orientAlertSubject.next(true)
    } else {
      this.orientAlertSubject.next(false)
    }
  }

  observeOrientation(): Observable<Orientation> {
    return this.orientSubject // for no reason I can fathom, if we .asObservable() this fails to fire
  }

  observeOrientationAlert(): Observable<boolean> {
    return this.orientAlertSubject.asObservable()
  }

  getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  
  makeId(): string {
    // ( http://stackoverflow.com/questions/3231459/create-unique-id-with-javascript)
    // always start with a letter (for DOM friendlyness)
    var idstr=String.fromCharCode(Math.floor((Math.random()*25)+65))
    do {
        // between numbers and characters (48 is 0 and 90 is Z (42-48 = 90)
        var ascicode=Math.floor((Math.random()*42)+48)
        if (ascicode<58 || ascicode>64){
            // exclude all chars between : (58) and @ (64)
            idstr+=String.fromCharCode(ascicode)
        }
    } while (idstr.length<32)
    return (idstr)
  }

  getNiceTime (milliseconds) {
    let mt = Moment.utc(milliseconds)
    let md = Moment.duration(milliseconds)
    let ts = ''
    if (~~md.asHours() > 0) {
      ts += ~~md.asHours() + ':'
    }
    return ts + mt.format('mm:ss.S')
  }

  getBrowserInfo(): {platform: string, browser: string, version: number} {
    let extractVersion = (agentStr: string, expr: RegExp, pos: number) => {
      let match = agentStr.match(expr)
      return match && match.length >= pos && parseInt(match[pos], 10)
    }
    
    let result = {
      platform: null,
      browser: null,
      version: null
    }
    if (typeof window === 'undefined' || !window.navigator) {
      return result
    }

    // Firefox.
    if (navigator.mozGetUserMedia) {
      result.browser = 'firefox'
      result.version = extractVersion(navigator.userAgent, /Firefox\/([0-9]+)\./, 1)

    // webkit-based browsers (Chrome, Chromium, Webview, Opera)
    } else if (navigator.webkitGetUserMedia) {
      if (window.webkitRTCPeerConnection) {
        result.browser = 'chrome'
        result.version = extractVersion(navigator.userAgent, /Chrom(e|ium)\/([0-9]+)\./, 2)
      // Safari or unknown webkit-based
      } else {
        if (navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
          result.browser = 'safari'
          result.version = extractVersion(navigator.userAgent, /AppleWebKit\/([0-9]+)\./, 1)

        // unknown webkit-based browser
        } else {
          return result
        }
      }
    // Edge.
    } else if (navigator.mediaDevices && navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
      result.browser = 'edge'
      result.version = extractVersion(navigator.userAgent, /Edge\/(\d+).(\d+)$/, 2)
    }

    //Android
    if (navigator.userAgent.match(/Android/i)) {
      result.platform = 'android'
    
    //iOS
    } else if(navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
      result.platform = 'ios'
    }

    return result
  }

  // ES6 does not provide a way to check set equality, so that's what this does :)
  eqSet(as: Set<any>, bs: Set<any>): boolean {
    if (as.size !== bs.size) {
      return false
    }
    for (var a of Array.from(as.values())) {
      if (!bs.has(a)) {
        return false
      }
    }
    return true
  }
  // Creates a dialog that returns a boolean promise on user accept or cancel
  // Uses a standardized schema for translate where the first arg is the component
  // and second arg is the action. 
  presentDialog(comp: string, action: string): Promise<boolean> {
    return new Promise((resolve) => {
      let atitle = comp + '.' + action + '.TITLE'
      let amessage = comp + '.' + action + '.MESSAGE'
      let aconfirm = comp + '.' + action + '.CONFIRM'
      let acancel = comp + '.' + action + '.CANCEL'
      this.translate.get([atitle, amessage, aconfirm, acancel])
      .subscribe(str => {
        let confirm = this.alertCtrl.create({
          title: str[atitle],
          message: str[amessage],
          buttons: [
            {
              text: str[aconfirm],
              handler: () => {
                resolve(true)
              }
            },
            {
              role: 'cancel',
              text: str[acancel],
              handler: () => {
                resolve(false)
              }
            }
          ]
        })
        confirm.present()
      })
    })
  }
  presentAlert(comp: string, action: string): Promise<boolean> {
    return new Promise((resolve) => {
      let atitle = comp + '.' + action + '.TITLE'
      let amessage = comp + '.' + action + '.MESSAGE'
      let aconfirm = comp + '.' + action + '.CONFIRM'
      this.translate.get([atitle, amessage, aconfirm])
      .subscribe(str => {
        let confirm = this.alertCtrl.create({
          title: str[atitle],
          message: str[amessage],
          buttons: [
            {
              text: str[aconfirm],
              handler: () => {
                resolve(true)
              }
            }
          ]
        })
        confirm.present()
      })
    })
  }

}
