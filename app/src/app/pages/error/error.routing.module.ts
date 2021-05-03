import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ErrorComponent } from './error.component';
import { SharedModule } from '../../shared/shared.module';

const errorRoutes: Routes = [
  {
    path: '',
    component: ErrorComponent
  }
];

@NgModule({
  declarations: [ErrorComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(errorRoutes)],
  exports: [ErrorComponent]
})
export class ErrorRoutingModule {}
