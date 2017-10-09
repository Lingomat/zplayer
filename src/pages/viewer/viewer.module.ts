import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { ViewerPage } from './viewer'
import { RecipeViewerComponentModule } from '../../components/recipe-viewer/recipe-viewer.module'
import { TranslationSelectorComponentModule } from '../../components/translation-selector/translation-selector.module'

@NgModule({
  declarations: [ViewerPage],
  imports: [
    IonicPageModule.forChild(ViewerPage), 
    RecipeViewerComponentModule,
    TranslationSelectorComponentModule
    ]
})
export class ViewerPageModule { }
