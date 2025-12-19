import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ClassComponent } from './class.component';
import { SharedModule } from '../../shared/shared.module';

const classRoutes: Routes = [
  {
    path: '',
    component: ClassComponent,
  },
];

@NgModule({
  declarations: [ClassComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(classRoutes)],
  exports: [ClassComponent],
})
export class ClassRoutingModule {}
