import { BrowserModule } from '@angular/platform-browser'
import { ErrorHandler, NgModule } from '@angular/core'
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular'
import { HttpClientModule, HttpClient} from '@angular/common/http'
import { HttpModule } from '@angular/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { MyApp } from './app.component'
import { HomePage } from '../pages/home/home'
import { ViewerPage } from '../pages/viewer/viewer'
import { DataProvider } from '../providers/data/data'
import { AboutPage } from '../pages/about/about'
import { AndroidPage } from '../pages/android/android'
import { DetailsPage } from '../pages/details/details'
import { BlogPage } from '../pages/blog/blog'
import { FaqPage } from '../pages/faq/faq'
import { ResearchPage } from '../pages/research/research'
import { HelpPage } from '../pages/help/help'
import { FeedbackPage } from '../pages/feedback/feedback'

import { GestateComponent } from '../components/gestate/gestate'
import { RecipeSlidesComponent } from '../components/recipe-slides/recipe-slides'
import { RecipeViewerComponent } from '../components/recipe-viewer/recipe-viewer'
import { GoogleMapComponent } from '../components/google-map/google-map'
import { LocaleFabComponent } from '../components/locale-fab/locale-fab'

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

import { HighlightPipe} from '../pipes/highlight/highlight'

import { FirebaseProvider } from '../providers/firebase/firebase'


export function createTranslateLoader(http: HttpClient) {
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
    StatusIconsComponent,
    HighlightPipe,
    LocaleFabComponent,
    BlogPage,
    FaqPage,
    ResearchPage,
    HelpPage,
    FeedbackPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp, {iconMode: 'md'}, {
      links: [
        { component: ViewerPage, name: 'view', segment: 'r/:handleId'}
      ],
    }),
    BrowserAnimationsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
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
    DetailsPage,
    BlogPage,
    FaqPage,
    ResearchPage,
    HelpPage,
    FeedbackPage
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
