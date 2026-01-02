import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageViewerComponent } from './image-viewer.component';
import { CommonsInfoComponent } from '../components/commons-info-component/commons-info-component';

@NgModule({
  imports: [CommonModule, CommonsInfoComponent],
  declarations: [ImageViewerComponent],
  exports: [ImageViewerComponent],
})
export class ImageViewerModule {}
