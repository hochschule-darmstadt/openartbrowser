import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SearchResultComponent } from './search-result.component';

const searchResultRoutes: Routes = [
  {
    path: '',
    component: SearchResultComponent,
  },
];

@NgModule({
  declarations: [SearchResultComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(searchResultRoutes), NgbModule.forRoot()],
  exports: [SearchResultComponent],
})
export class SearchResultRoutingModule {}
