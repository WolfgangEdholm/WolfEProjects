import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { StandardModule } from '../standard/standard.module';
import { ServicesModule } from '../services/services.module';
import { UIEngineModule } from '../ui-engine/ui-engine.module';

import { SidePanelModule } from '../sidepanel/side-panel.module';

import { HomeComponent } from './home.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,

    StandardModule,
    ServicesModule,
    UIEngineModule,
    SidePanelModule,
  ],
  declarations: [
    HomeComponent,
  ],
})
export class HomeModule {
}
