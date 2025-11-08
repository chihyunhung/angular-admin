import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { AdminShellComponent } from './components/admin-shell/admin-shell.component';

@NgModule({
  declarations: [AdminShellComponent],
  imports: [SharedModule],
  exports: [AdminShellComponent]
})
export class LayoutModule {}
