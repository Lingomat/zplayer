import { Component } from '@angular/core'
import { NavController } from 'ionic-angular'
import { DataProvider } from '../../providers/data/data'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, public data: DataProvider) {
    console.log('home page')
  }

  async ngOnInit() {
    console.log('running test')
    // try {
    //   let bundle = await this.data.getRecipeBundleFromFirebase('JJmrs')
    // } catch(e) {
    //   console.log('error', e)
    // }
    // try {
    //   let complete = await this.data.getCompleteRecipe('JJmrs')
    //   console.log('got complete', complete)
    // } catch(e) {
    //   console.log('error', e)
    // }
    
  }

}
