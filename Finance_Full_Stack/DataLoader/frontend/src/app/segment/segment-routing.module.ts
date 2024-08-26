import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SegmentEditorComponent } from './segment-editor.component';
import { SegmentModule } from './segment.module';

const routes: Routes = [
  // { path: 'user/:uuid', component: UserEditor },
  { path: 'segments', component: SegmentEditorComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SegmentModule,
  ],
  exports: [
    RouterModule
  ]
})
export class SegmentRoutingModule {
}
