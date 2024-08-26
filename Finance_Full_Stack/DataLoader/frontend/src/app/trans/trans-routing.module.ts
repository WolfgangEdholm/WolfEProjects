import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransComponent } from './trans.component';
import { TransModule } from './trans.module';

const routes: Routes = [
  { path: 'trans', component: TransComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    TransModule,
  ],
  exports: [
    RouterModule
  ]
})
export class TransRoutingModule {
}
