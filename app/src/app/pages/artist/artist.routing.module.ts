import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ArtistComponent } from './artist.component';
import { SharedModule } from '../../shared/shared.module';

const artistRoutes: Routes = [
  {
    path: '',
    component: ArtistComponent,
  },
];

@NgModule({
  declarations: [ArtistComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(artistRoutes)],
  exports: [ArtistComponent],
})
export class ArtistRoutingModule {}
