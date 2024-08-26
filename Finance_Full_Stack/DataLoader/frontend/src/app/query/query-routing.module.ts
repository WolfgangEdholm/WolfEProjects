import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QueryComponent } from './query.component';
import { QueryModule } from './query.module';

const routes: Routes = [
  { path: 'query', component: QueryComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    QueryModule,
  ],
  exports: [
    RouterModule
  ]
})
export class QueryRoutingModule {
}
