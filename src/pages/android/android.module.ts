import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AndroidPage } from './android';

@NgModule({
  declarations: [
    AndroidPage,
  ],
  imports: [
    IonicPageModule.forChild(AndroidPage),
  ],
})
export class AndroidPageModule {}
