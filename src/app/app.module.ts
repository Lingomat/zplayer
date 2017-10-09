import { BrowserModule } from '@angular/platform-browser'
import { ErrorHandler, NgModule } from '@angular/core'
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular'
import { Http, HttpModule } from '@angular/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { MyApp } from './app.component'
import { HomePage } from '../pages/home/home'
import { ViewerPage } from '../pages/viewer/viewer'
import { DataProvider } from '../providers/data/data'

import { GestateComponent } from '../components/gestate/gestate'
import { RecipeSlidesComponent } from '../components/recipe-slides/recipe-slides'
import { RecipeViewerComponent } from '../components/recipe-viewer/recipe-viewer'
import { TranslationSelectorComponent } from '../components/translation-selector/translation-selector'

import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import { UtilProvider } from '../providers/util/util'
import { WebAudioPlayerProvider } from '../providers/web-audio-player/web-audio-player'
import { AudioProvider } from '../providers/audio/audio'
import { GlobalsProvider } from '../providers/globals/globals';

export function createTranslateLoader(http: Http) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json')
}

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ViewerPage,
    GestateComponent,
    RecipeSlidesComponent,
    RecipeViewerComponent,
    TranslationSelectorComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {}, {
      links: [
        { component: ViewerPage, name: 'view', segment: 'r/:handleId'}
      ]
    }),
    BrowserAnimationsModule,
    HttpModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [Http]
      }
    }),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ViewerPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DataProvider,
    UtilProvider,
    WebAudioPlayerProvider,
    AudioProvider,
    GlobalsProvider
  ]
})
export class AppModule {}
