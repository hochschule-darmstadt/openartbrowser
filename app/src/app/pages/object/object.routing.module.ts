import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ObjectComponent } from './object.component';
import { SharedModule } from '../../shared/shared.module';

const objectRoutes: Routes = [
  {
    path: '',
    component: ObjectComponent,
  },
];

@NgModule({
  declarations: [ObjectComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(objectRoutes)],
  exports: [ObjectComponent],
})
export class ObjectRoutingModule {}
