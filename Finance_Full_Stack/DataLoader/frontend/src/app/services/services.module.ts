import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AlertComponent } from './std-modals/alert/alert.component';
import { ErrorModalComponent } from './std-modals/error/error-modal.component';
import { PromptModalComponent
} from './std-modals/prompt/prompt-modal.component';
// import { ComputedDialogComponent
//   } from '../modals/computed-dialog/computed-dialog.component';
// import { ConstrDialogComponent
//   } from '../modals/constr-dialog/constr-dialog.component';


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
  ],
  declarations: [
    AlertComponent,
    ErrorModalComponent,
    PromptModalComponent,
    // ComputedDialogComponent,
    // ConstrDialogComponent,
  ],
  exports: [
    MaterialModule,
    FlexLayoutModule,
    AlertComponent,
    ErrorModalComponent,
    PromptModalComponent,
    // ComputedDialogComponent,
    // ConstrDialogComponent,
  ],
  entryComponents: [
    AlertComponent,
    ErrorModalComponent,
  ]
})
export class ServicesModule { }
