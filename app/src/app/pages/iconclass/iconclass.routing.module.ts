import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { IconclassComponent } from './iconclass.component';
import { SharedModule } from '../../shared/shared.module';

const iconclassRoutes: Routes = [
  {
    path: '',
    component: IconclassComponent,
  },
];

@NgModule({
  declarations: [IconclassComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(iconclassRoutes)],
  exports: [IconclassComponent],
})
export class IconclassRoutingModule {}
