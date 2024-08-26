import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { StandardModule } from '../standard/standard.module';
import { ServicesModule } from '../services/services.module';
import { UIEngineModule } from '../ui-engine/ui-engine.module';
import { SidePanelModule } from '../sidepanel/side-panel.module';

import { UserEditorComponent } from './user-editor.component';

import { FullNamePipe } from '../standard/full-name.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    StandardModule,
    ServicesModule,
    UIEngineModule,
    SidePanelModule,
  ],
  declarations: [
    UserEditorComponent,
  ],
  providers: [
    FullNamePipe,
  ],
})
export class UserModule {
}
