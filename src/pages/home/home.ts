import { Component } from '@angular/core'
import { NavController } from 'ionic-angular'
import { DataProvider } from '../../providers/data/data'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, public data: DataProvider) {

  }

  async ngOnInit() {
    
  }

  mapSelect(selected: {recipeIds: string[], evt: MouseEvent}) {
    console.log('home got', selected)
  }

}
