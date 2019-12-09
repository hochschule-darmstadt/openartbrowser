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
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { Analytics } from './services/analytics.service';

/** Everything that should be loaded globally and only once goes here */
@NgModule({
  declarations: [HeaderComponent, FooterComponent],
  imports: [CommonModule, NgbModule, FormsModule, SharedModule, RouterModule, Angulartics2Module.forRoot(Analytics.options)],
  exports: [HeaderComponent, FooterComponent],
  providers: [DataService],
})
export class CoreModule {
  constructor(angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics) {
    Analytics.setTrackingId();
    angulartics2GoogleAnalytics.startTracking();
  }
}
