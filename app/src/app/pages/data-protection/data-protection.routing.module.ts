import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { DataProtectionComponent } from './data-protection.component';

const dataProtectionRoutes: Routes = [
  {
    path: '',
    component: DataProtectionComponent
  }
];

@NgModule({
  declarations: [DataProtectionComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(dataProtectionRoutes)],
  exports: [DataProtectionComponent]
})
export class DataProtectionRoutingModule {}
