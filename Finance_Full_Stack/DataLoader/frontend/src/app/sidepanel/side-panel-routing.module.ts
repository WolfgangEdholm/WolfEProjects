import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SidePanelComponent } from './side-panel.component';
import { SidePanelModule } from './side-panel.module';

const routes: Routes = [
  { path: 'leftPane', component: SidePanelComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SidePanelModule,
  ],
  exports: [
    RouterModule
  ]
})
export class SidePanelRoutingModule {
}
