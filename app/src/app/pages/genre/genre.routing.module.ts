import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { GenreComponent } from './genre.component';
import { SharedModule } from '../../shared/shared.module';

const genreRoutes: Routes = [
  {
    path: '',
    component: GenreComponent,
  },
];

@NgModule({
  declarations: [GenreComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(genreRoutes)],
  exports: [GenreComponent],
})
export class GenreRoutingModule {}
