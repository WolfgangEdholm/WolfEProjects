import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RouterModule, Routes } from '@angular/router';

import { StandardModule } from '../standard/standard.module';
import { ServicesModule } from '../services/services.module';
import { UIEngineModule } from '../ui-engine/ui-engine.module';

import { SidePanelModule } from '../sidepanel/side-panel.module';

import { QueryIntegrityReportComponent
} from './query-integrity/query-integrity-report.component';
import { Read2ReportComponent } from './read2/read2-report.component';
import { Read3ReportComponent } from './read3/read3-report.component';

import { WriteReportComponent } from './write/write-report.component';
import { UserReportComponent } from './user/user-report.component';

import { TestReportComponent } from './test/test-report.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    RouterModule,

    StandardModule,
    ServicesModule,
    UIEngineModule,
    SidePanelModule,
  ],
  declarations: [
    QueryIntegrityReportComponent,
    Read2ReportComponent,
    Read3ReportComponent,
    WriteReportComponent,
    UserReportComponent,
    TestReportComponent,
  ],
})
export class ReportsModule {
}
