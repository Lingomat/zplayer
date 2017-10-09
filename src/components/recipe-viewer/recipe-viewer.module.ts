import { NgModule } from '@angular/core'
import { IonicModule } from 'ionic-angular'
import { RecipeViewerComponent } from './recipe-viewer'
import { RecipeSlidesComponentModule } from '../../components/recipe-slides/recipe-slides.module'
import { GestateComponentModule } from '../../components/gestate/gestate.module'

@NgModule({
  declarations: [RecipeViewerComponent],
  imports: [IonicModule, RecipeSlidesComponentModule, GestateComponentModule],
  exports: [RecipeViewerComponent]
})
export class RecipeViewerComponentModule { }
