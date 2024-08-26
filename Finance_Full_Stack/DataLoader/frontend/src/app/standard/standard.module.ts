import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { FullNamePipe } from './full-name.pipe';
import {LoadingSpinnerComponent} from './loading-spinner.component';

@NgModule({
  imports: [
    CommonModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatNativeDateModule,
    MatSelectModule,
    FormsModule,
    MatAutocompleteModule,
    MatIconModule,
  ],
  declarations: [
    FullNamePipe,
    LoadingSpinnerComponent,
  ],
  exports: [
    FullNamePipe,
    LoadingSpinnerComponent,
  ],
})
export class StandardModule {
}
