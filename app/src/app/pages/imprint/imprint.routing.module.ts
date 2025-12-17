import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ImprintComponent } from './imprint.component';

const imprintRoutes: Routes = [
  {
    path: '',
    component: ImprintComponent,
  },
];

@NgModule({
  declarations: [ImprintComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(imprintRoutes)],
  exports: [ImprintComponent],
})
export class ImprintRoutingModule {}
