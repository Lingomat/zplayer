import { NgModule } from '@angular/core'
import { HighlightPipe } from './highlight'

@NgModule({
  declarations: [HighlightPipe],
  exports: [HighlightPipe]
})
export class HighlightPipeModule { }
