import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AboutComponent } from './about.component';

const aboutnRoutes: Routes = [
  {
    path: '',
    component: AboutComponent
  }
];

@NgModule({
  declarations: [AboutComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(aboutnRoutes)],
  exports: [AboutComponent]
})
export class AboutRoutingModule {}
