import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { IconographyComponent } from './iconography.component';
import { SharedModule } from '../../shared/shared.module';
import { ImageViewerModule } from 'ngx-image-viewer';

const iconographyRoutes: Routes = [
  {
    path: '',
    component: IconographyComponent
  }
];

@NgModule({
  declarations: [IconographyComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(iconographyRoutes), ImageViewerModule.forRoot()],
  exports: [IconographyComponent]
})
export class IconographyRoutingModule {}
