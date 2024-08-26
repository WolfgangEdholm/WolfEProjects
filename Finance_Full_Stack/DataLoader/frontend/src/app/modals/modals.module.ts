import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { WDataModalComponent } from './wdata/wdata-modal.component';
import { WCompModalComponent } from './wcomp/wcomp-modal.component';
import { ConstrModalComponent } from './constr/constr-modal.component';
import { DataModalComponent } from './data/data-modal.component';
import { DbSaveModalComponent } from './save/save-modal.component';
import { SvModalComponent } from './sv/sv-modal.component';
import { GrowModalComponent } from './grow/grow-modal.component';
import { TransResultsModalComponent
} from './trans-results/trans-results-modal.component';

// 45678911234567892123456789312345678941234567895123456789612345678971234567898


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
  ],
  declarations: [
    WDataModalComponent,
    WCompModalComponent,
    ConstrModalComponent,
    DataModalComponent,
    DbSaveModalComponent,
    SvModalComponent,
    TransResultsModalComponent,
    GrowModalComponent,
  ],
  exports: [
    WDataModalComponent,
    WCompModalComponent,
    ConstrModalComponent,
    DataModalComponent,
    DbSaveModalComponent,
    SvModalComponent,
    TransResultsModalComponent,
    GrowModalComponent,
  ],
})
export class ModalsModule { }
