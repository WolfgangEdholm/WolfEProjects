import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsModule } from './reports.module';

import { QueryIntegrityReportComponent
} from './query-integrity/query-integrity-report.component';
import { Read2ReportComponent } from './read2/read2-report.component';
import { Read3ReportComponent } from './read3/read3-report.component';
import { WriteReportComponent } from './write/write-report.component';
import { UserReportComponent } from './user/user-report.component';
import { TestReportComponent } from './test/test-report.component';


const routes: Routes = [
  { path: 'reports/queryIntegrity', component: QueryIntegrityReportComponent },
  { path: 'reports/read2', component: Read2ReportComponent },
  { path: 'reports/read3', component: Read3ReportComponent },
  { path: 'reports/write', component: WriteReportComponent },
  { path: 'reports/user', component: UserReportComponent },
  { path: 'reports/test', component: TestReportComponent },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    ReportsModule,
  ],
  exports: [
    RouterModule,
  ]
})
export class ReportsRoutingModule {
}
