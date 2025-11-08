import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { UserFormComponent } from './components/user-form/user-form.component';
import { UsersListComponent } from './components/users-list/users-list.component';
import { UsersRoutingModule } from './users-routing.module';

@NgModule({
  declarations: [UsersListComponent, UserFormComponent],
  imports: [SharedModule, UsersRoutingModule]
})
export class UsersModule {}
