import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { DataService } from './services/data.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { Angulartics2Module } from 'angulartics2';
import { AnalyticsService } from './services/analytics.service';
import { ConsentDialogComponent } from './components/consent-dialog/consent-dialog.component';

/** Everything that should be loaded globally and only once goes here */
@NgModule({
  declarations: [HeaderComponent, FooterComponent, ConsentDialogComponent],
  imports: [CommonModule, NgbModule, FormsModule, SharedModule, RouterModule, Angulartics2Module.forRoot(AnalyticsService.options)],
  exports: [HeaderComponent, FooterComponent, ConsentDialogComponent],
  providers: [DataService],
})
export class CoreModule {}
