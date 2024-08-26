import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserEditorComponent } from './user-editor.component';
import { UserModule } from './user.module';

const routes: Routes = [
  // { path: 'user/:uuid', component: UserEditor },
  { path: 'users', component: UserEditorComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    UserModule
  ],
  exports: [
    RouterModule
  ]
})
export class UserRoutingModule {
}
