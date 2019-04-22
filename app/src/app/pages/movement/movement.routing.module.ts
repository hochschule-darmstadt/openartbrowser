import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MovementComponent } from './movement.component';
import { SharedModule } from '../../shared/shared.module';

const movementRoutes: Routes = [
  {
    path: '',
    component: MovementComponent,
  },
];

@NgModule({
  declarations: [MovementComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(movementRoutes)],
  exports: [MovementComponent],
})
export class MovementRoutingModule {}
