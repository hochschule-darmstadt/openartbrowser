import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MaterialComponent } from './material.component';
import { SharedModule } from '../../shared/shared.module';

const materialRoutes: Routes = [
  {
    path: '',
    component: MaterialComponent,
  },
];

@NgModule({
  declarations: [MaterialComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(materialRoutes)],
  exports: [MaterialComponent],
})
export class MaterialRoutingModule {}
