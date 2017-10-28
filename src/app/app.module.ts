import { BrowserModule } from '@angular/platform-browser'
import { ErrorHandler, NgModule } from '@angular/core'
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular'
import { Http, HttpModule } from '@angular/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { MyApp } from './app.component'
import { HomePage } from '../pages/home/home'
import { ViewerPage } from '../pages/viewer/viewer'
import { DataProvider } from '../providers/data/data'
import { AboutPage } from '../pages/about/about'
import { AndroidPage } from '../pages/android/android'
import { DetailsPage } from '../pages/details/details'

import { GestateComponent } from '../components/gestate/gestate'
import { RecipeSlidesComponent } from '../components/recipe-slides/recipe-slides'
import { RecipeViewerComponent } from '../components/recipe-viewer/recipe-viewer'
import { GoogleMapComponent } from '../components/google-map/google-map'

import { TranslationSelectorComponent } from '../components/translation-selector/translation-selector'
import { TransPopover } from '../components/translation-selector/trans-popover'

import { LangEditComponent } from '../components/lang-edit/lang-edit'
import { LangPopover } from '../components/lang-edit/lang-popover'
import { LangSelectorComponent } from '../components/lang-edit/lang-selector'

import { TagEditComponent } from '../components/tag-edit/tag-edit'

import { StatusIconsComponent } from '../components/status-icons/status-icons'


import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import { UtilProvider } from '../providers/util/util'
import { WebAudioPlayerProvider } from '../providers/web-audio-player/web-audio-player'
import { AudioProvider } from '../providers/audio/audio'
import { GlobalsProvider } from '../providers/globals/globals'

import { HighlightPipeModule } from '../pipes/highlight/highlight.module'

import { LottieAnimationViewModule } from 'ng-lottie'
import { FirebaseProvider } from '../providers/firebase/firebase'

export function createTranslateLoader(http: Http) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json')
}

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ViewerPage,
    AboutPage,
    AndroidPage,
    GestateComponent,
    RecipeSlidesComponent,
    RecipeViewerComponent,
    TranslationSelectorComponent,
    TransPopover,
    LangEditComponent,
    LangPopover,
    LangSelectorComponent,
    GoogleMapComponent,
    DetailsPage,
    TagEditComponent,
    StatusIconsComponent
  ],
  imports: [
    BrowserModule,
    HighlightPipeModule,
    LottieAnimationViewModule.forRoot(),
    IonicModule.forRoot(MyApp, {}, {
      links: [
        { component: ViewerPage, name: 'view', segment: 'r/:handleId'}
      ],
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
    ViewerPage,
    AboutPage,
    AndroidPage,
    TransPopover,
    LangPopover,
    DetailsPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DataProvider,
    UtilProvider,
    WebAudioPlayerProvider,
    AudioProvider,
    GlobalsProvider,
    FirebaseProvider
  ]
})
export class AppModule {}
