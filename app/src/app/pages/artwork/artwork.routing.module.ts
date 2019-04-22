import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ArtworkComponent } from './artwork.component';
import { SharedModule } from '../../shared/shared.module';

const artworkRoutes: Routes = [
  {
    path: '',
    component: ArtworkComponent,
  },
];

@NgModule({
  declarations: [ArtworkComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(artworkRoutes)],
  exports: [ArtworkComponent],
})
export class ArtworkRoutingModule {}
