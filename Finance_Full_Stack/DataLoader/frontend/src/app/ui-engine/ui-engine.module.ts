import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { UIDateInputComponent } from './ui-date-input.component';
import { UIMultiSelectInputComponent } from './ui-multiselect-input.component';
import { UITextInputComponent } from './ui-text-input.component';

@NgModule({
  imports: [
    CommonModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatNativeDateModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatIconModule,
  ],
  declarations: [
    UIDateInputComponent,
    UIMultiSelectInputComponent,
    UITextInputComponent,
  ],
  exports: [
    UIDateInputComponent,
    UIMultiSelectInputComponent,
    UITextInputComponent,
  ],
})
export class UIEngineModule {
}
