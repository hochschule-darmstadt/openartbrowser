import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MotifComponent } from './motif.component';
import { SharedModule } from '../../shared/shared.module';

const motifRoutes: Routes = [
  {
    path: '',
    component: MotifComponent,
  },
];

@NgModule({
  declarations: [MotifComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(motifRoutes)],
  exports: [MotifComponent],
})
export class MotifRoutingModule {}
