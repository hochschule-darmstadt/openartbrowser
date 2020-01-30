import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ImpressComponent } from './impress.component';

const impressRoutes: Routes = [
  {
    path: '',
    component: ImpressComponent
  }
];

@NgModule({
  declarations: [ImpressComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(impressRoutes)],
  exports: [ImpressComponent]
})
export class ImpressRoutingModule {}
