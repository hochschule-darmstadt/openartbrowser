import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ArtistPageComponent } from './artist-page.component';
import { SharedModule } from 'src/app/shared/shared.module';

const artistRoutes: Routes = [
  {
    path: '',
    component: ArtistPageComponent,
  },
];

@NgModule({
  declarations: [ArtistPageComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(artistRoutes)],
  exports: [ArtistPageComponent],
})
export class ArtistPageRoutingModule {}
