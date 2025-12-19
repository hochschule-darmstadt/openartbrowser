import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { EntitiesComponent } from './entities.component';

const artistRoutes: Routes = [
  {
    path: '',
    component: EntitiesComponent,
  },
];

@NgModule({
  declarations: [EntitiesComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(artistRoutes)],
  exports: [EntitiesComponent],
})
export class EntitiesRoutingModule {}
