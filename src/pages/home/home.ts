import { Component } from '@angular/core'
import { NavController, ModalController } from 'ionic-angular'
import { DataProvider } from '../../providers/data/data'
import { SmallRecipeHit } from '../../providers/firebase/firebase'
import { DetailsPage } from '../../pages/details/details'
import { ViewerPage } from '../../pages/viewer/viewer'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(
    public navCtrl: NavController, 
    public data: DataProvider, 
    //public popCtrl: PopoverController,
    public modalCtrl: ModalController) {
  }

  async ngOnInit() {
    
  }

  mapSelect(recipeHit: {selected: SmallRecipeHit[], evt: any}) {
    console.log('home page got selected', recipeHit)
    let popover = this.modalCtrl.create(DetailsPage, {recipeHit: recipeHit.selected}, {cssClass: 'details'})
    popover.onDidDismiss((data) => {
      if (data && data.play) {
        this.navCtrl.push(ViewerPage, {handleId: recipeHit.selected[0].recipe.handle})
      }
    })
    // hax0r mouse event into something Ionic wants
    let ev = {
      target : {
        getBoundingClientRect : () => {
          return {
            top: recipeHit.evt.clientY,
            left: recipeHit.evt.clientX
          }
        }
      }
    }
    popover.present({ev: ev})
  }
  
}
