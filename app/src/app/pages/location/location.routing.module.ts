import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LocationComponent } from './location.component';
import { SharedModule } from '../../shared/shared.module';

const locationRoutes: Routes = [
  {
    path: '',
    component: LocationComponent
  }
];

@NgModule({
  declarations: [LocationComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(locationRoutes)],
  exports: [LocationComponent]
})
export class LocationRoutingModule {}
