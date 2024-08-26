import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';


import { StandardModule } from '../standard/standard.module';
import { ServicesModule } from '../services/services.module';
import { UIEngineModule } from '../ui-engine/ui-engine.module';

import { SidePanelComponent } from './side-panel.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,

    StandardModule,
    ServicesModule,
    UIEngineModule,
  ],
  declarations: [
    SidePanelComponent,
  ],
  exports: [
    SidePanelComponent,
  ],
})
export class SidePanelModule {
}
